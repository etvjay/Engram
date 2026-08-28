import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

function safeStamp(date = new Date()): string {
  return date.toISOString().replace(/[:.]/g, "-");
}

function gitHead(): string {
  const result = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" });
  if (result.status !== 0) return "unknown";
  return result.stdout.trim();
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
  stderrFile: string;
  startedAt: string;
  completedAt: string;
};

const capturedAt = new Date();
const head = gitHead();
const stamp = safeStamp(capturedAt);
const outputDir = resolve(
  process.env.ENGRAM_EVIDENCE_DIR ?? `artifacts/sibyl-evidence/${stamp}-${head.slice(0, 12)}`,
);
const dbPath = resolve(outputDir, "sibyl-evidence.db");
const tenant = process.env.ENGRAM_SIBYL_TENANT ?? `engram-evidence-${stamp}`;

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
  await writeFile(resolve(outputDir, stdoutFile), result.stdout ?? "", "utf8");
  await writeFile(resolve(outputDir, stderrFile), result.stderr ?? "", "utf8");

  receipts.push({
    id: step.id,
    command: `npm ${step.args.join(" ")}`,
    exitCode: result.status,
    stdoutFile,
    stderrFile,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
  });

  if (result.status !== 0) {
    failed = true;
    break;
  }
}

const manifest = {
  schema: "engram.sibyl-evidence-capture/v1",
  capturedAt: capturedAt.toISOString(),
  gitHead: head,
  tenant,
  dbFile: "sibyl-evidence.db",
  status: failed ? "FAILED" : "LOCAL_PASS",
  evidenceBoundary: "This capture is local/CI evidence unless the surrounding run is itself an eligible public evaluator or live partner execution.",
  steps: receipts,
};

await writeFile(resolve(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

process.stdout.write(`${JSON.stringify({ outputDir, ...manifest }, null, 2)}\n`);
if (failed) process.exit(1);
