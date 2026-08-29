import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

function safeStamp(date = new Date()): string {
  return date.toISOString().replace(/[:.]/g, "-");
}

function commandOutput(command: string, args: string[]): string {
  const result = spawnSync(command, args, { encoding: "utf8", cwd: process.cwd() });
  if (result.status !== 0) return "unknown";
  return result.stdout.trim() || result.stderr.trim() || "unknown";
}

function commandStdoutAllowEmpty(command: string, args: string[]): string | null {
  const result = spawnSync(command, args, { encoding: "utf8", cwd: process.cwd() });
  if (result.status !== 0) return null;
  return result.stdout.trim();
}

function gitHead(): string {
  return commandOutput("git", ["rev-parse", "HEAD"]);
}

async function sha256File(path: string): Promise<string | null> {
  try {
    const body = await readFile(path);
    return createHash("sha256").update(body).digest("hex");
  } catch {
    return null;
  }
}

type Step = {
  id: string;
  args: string[];
};

type StepReceipt = {
  id: string;
  command: string;
  exitCode: number | null;
  stdoutFile: string;
  stdoutSha256: string | null;
  stderrFile: string;
  stderrSha256: string | null;
  startedAt: string;
  completedAt: string;
};

const capturedAt = new Date();
const head = gitHead();
const stamp = safeStamp(capturedAt);
const sourceTreeStatusResult = commandStdoutAllowEmpty("git", ["status", "--porcelain"]);
const sourceTreeStatus = sourceTreeStatusResult ?? "unknown";
const sourceTreeClean = sourceTreeStatusResult !== null && sourceTreeStatusResult.length === 0;
const allowDirty = process.env.ENGRAM_EVIDENCE_ALLOW_DIRTY === "1";

if (!sourceTreeClean && !allowDirty) {
  throw new Error(
    `EVIDENCE_SOURCE_TREE_DIRTY: commit-stamped evidence requires a clean working tree. `
    + `Set ENGRAM_EVIDENCE_ALLOW_DIRTY=1 only for non-submission diagnostics. status=${JSON.stringify(sourceTreeStatus)}`,
  );
}

const outputDir = resolve(
  process.env.ENGRAM_EVIDENCE_DIR ?? `artifacts/sibyl-evidence/${stamp}-${head.slice(0, 12)}`,
);
const dbPath = resolve(outputDir, "sibyl-evidence.db");
const tenant = process.env.ENGRAM_SIBYL_TENANT ?? `engram-evidence-${stamp}`;
const python = process.env.ENGRAM_SIBYL_PYTHON ?? "python3";

const steps: Step[] = [
  { id: "sibyl-pressure-suite", args: ["run", "test:sibyl"] },
  { id: "route-seed", args: ["run", "demo:sibyl:seed"] },
  { id: "route-fresh-recall", args: ["run", "demo:sibyl:recall"] },
  { id: "route-no-memory-control", args: ["run", "demo:sibyl:no-memory-control"] },
  { id: "provider-history", args: ["run", "demo:sibyl:provider:seed"] },
  { id: "provider-fresh-urgent", args: ["run", "demo:sibyl:provider:urgent"] },
  { id: "provider-fresh-routine", args: ["run", "demo:sibyl:provider:routine"] },
  { id: "sibyl-deletion-mutation", args: ["run", "test:sibyl:deletion"] },
];

await mkdir(outputDir, { recursive: true });

const baseEnv = {
  ...process.env,
  ENGRAM_SIBYL_DB: dbPath,
  ENGRAM_SIBYL_TENANT: tenant,
};

const receipts: StepReceipt[] = [];
let failed = false;

for (const step of steps) {
  const startedAt = new Date();
  const result = spawnSync("npm", step.args, {
    encoding: "utf8",
    env: baseEnv,
    cwd: process.cwd(),
  });
  const completedAt = new Date();
  const stdoutFile = `${step.id}.stdout.txt`;
  const stderrFile = `${step.id}.stderr.txt`;
  const stdoutPath = resolve(outputDir, stdoutFile);
  const stderrPath = resolve(outputDir, stderrFile);
  await writeFile(stdoutPath, result.stdout ?? "", "utf8");
  await writeFile(stderrPath, result.stderr ?? "", "utf8");

  receipts.push({
    id: step.id,
    command: `npm ${step.args.join(" ")}`,
    exitCode: result.status,
    stdoutFile,
    stdoutSha256: await sha256File(stdoutPath),
    stderrFile,
    stderrSha256: await sha256File(stderrPath),
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
  });

  if (result.status !== 0) {
    failed = true;
    break;
  }
}

const packageLockPath = resolve(process.cwd(), "package-lock.json");
const sibylRequirementsPath = resolve(process.cwd(), "packages/sibyl/requirements.txt");
const dbSha256 = await sha256File(dbPath);

const manifest = {
  schema: "engram.sibyl-evidence-capture/v2",
  capturedAt: capturedAt.toISOString(),
  repository: commandOutput("git", ["remote", "get-url", "origin"]),
  gitHead: head,
  sourceTreeClean,
  sourceTreeStatus,
  tenant,
  environment: {
    platform: process.platform,
    arch: process.arch,
    node: process.version,
    npm: commandOutput("npm", ["--version"]),
    python: commandOutput(python, ["--version"]),
    sibylMemoryClient: commandOutput(python, [
      "-c",
      "import importlib.metadata as m; print(m.version('sibyl-memory-client'))",
    ]),
  },
  dependencyDigests: {
    packageLockSha256: await sha256File(packageLockPath),
    sibylRequirementsSha256: await sha256File(sibylRequirementsPath),
  },
  dbFile: "sibyl-evidence.db",
  dbSha256,
  status: failed ? "FAILED" : "LOCAL_PASS",
  evidenceBoundary: "This capture is local/CI evidence unless the surrounding run is itself an eligible public evaluator or live partner execution.",
  integrityNote: "SHA-256 values bind retained stdout/stderr, dependency manifests, and the final Sibyl database to this manifest. The manifest itself is the root receipt and should be retained with the artifact.",
  steps: receipts,
};

await writeFile(resolve(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

process.stdout.write(`${JSON.stringify({ outputDir, ...manifest }, null, 2)}\n`);
if (failed) process.exit(1);
