import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const registryPath = join(root, "docs", "frontend-modules", "registry.json");

type FrontendModule = {
  id: string;
  modulePath: string;
  usageGuide: string;
  consumptionMode: "BROWSER_SAFE" | "BROWSER_CONDITIONAL" | "API_ONLY" | "SERVER_ONLY";
  summary: string;
};

type Registry = {
  schemaVersion: string;
  modules: FrontendModule[];
};

async function loadRegistry(): Promise<Registry> {
  return JSON.parse(await readFile(registryPath, "utf8")) as Registry;
}

describe("frontend-consumable module registry", () => {
  it("keeps unique module ids and resolvable module/usage paths", async () => {
    const registry = await loadRegistry();
    expect(registry.schemaVersion).toBe("engram.frontend-module-registry/v1");
    expect(registry.modules.length).toBeGreaterThan(0);

    const ids = registry.modules.map((module) => module.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const module of registry.modules) {
      expect(module.summary.trim().length, `${module.id} must explain its frontend surface`).toBeGreaterThan(0);
      await expect(access(join(root, module.modulePath)), `${module.id} modulePath must exist`).resolves.toBeUndefined();
      await expect(access(join(root, module.usageGuide)), `${module.id} usageGuide must exist`).resolves.toBeUndefined();
    }
  });

  it("requires every usage guide to declare consumption mode and evidence status", async () => {
    const registry = await loadRegistry();

    for (const module of registry.modules) {
      const guide = await readFile(join(root, module.usageGuide), "utf8");
      expect(guide, `${module.id} guide must name its consumption mode`).toContain(module.consumptionMode);
      expect(guide, `${module.id} guide must declare evidence status`).toMatch(/Evidence status/i);
      expect(guide, `${module.id} guide must contain a concrete example`).toMatch(/```/);
    }
  });

  it("keeps contributor instructions pointed at the canonical registry", async () => {
    const [agents, contributing] = await Promise.all([
      readFile(join(root, "AGENTS.md"), "utf8"),
      readFile(join(root, "CONTRIBUTING.md"), "utf8"),
    ]);

    for (const instructions of [agents, contributing]) {
      expect(instructions).toContain("frontend-usage/README.md");
      expect(instructions).toContain("docs/frontend-modules/registry.json");
    }
  });
});
