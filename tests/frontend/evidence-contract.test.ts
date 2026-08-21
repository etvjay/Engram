import { describe, expect, it } from "vitest";
import { parseEvidenceIndex } from "../../apps/web/src/lib/evidence-schema";
import { findAblationExperiment } from "../../apps/web/src/components/ProductSurfaces";

const baseIndex = {
  schema_version: "engram-evidence-index-v1",
  repository: "etvjay/Engram-Memory",
  ref: "research-ref",
  commit: "abcdef1234567890",
  experiments: [
    {
      id: "PRISM-13-A0",
      title: "No-memory control",
      kind: "CONTROL",
      status: "TESTED",
      coverage: "SUBSET",
      ablation_stage: "A0",
      claim_scope: "official no_retrieval control",
      metrics: { empty_contexts: 12 },
    },
    {
      id: "PRISM-14",
      title: "Causal provenance",
      kind: "CAUSAL",
      status: "IMPLEMENTED",
      coverage: "SUBSET",
      ablation_stage: "A4",
      claim_scope: "provenance only",
    },
  ],
};

describe("evidence index contract", () => {
  it("rejects a missing schema version", () => {
    expect(() => parseEvidenceIndex({ experiments: [] })).toThrow(/schema_version/);
  });

  it("preserves index provenance instead of deriving it", () => {
    const parsed = parseEvidenceIndex(baseIndex);
    expect(parsed.ref).toBe("research-ref");
    expect(parsed.commit).toBe("abcdef1234567890");
  });

  it("normalizes unknown statuses without strengthening the claim", () => {
    const parsed = parseEvidenceIndex({
      ...baseIndex,
      experiments: [{ id: "X", title: "Future experiment", kind: "FUTURE", status: "MAGIC" }],
    });
    expect(parsed.experiments?.[0]?.status).toBe("UNKNOWN");
  });

  it("resolves ablations only from explicit ablation_stage metadata", () => {
    const parsed = parseEvidenceIndex(baseIndex);
    expect(findAblationExperiment(parsed, "A0")?.id).toBe("PRISM-13-A0");
    expect(findAblationExperiment(parsed, "A1")).toBeUndefined();
    expect(findAblationExperiment(parsed, "A4")?.id).toBe("PRISM-14");
  });

  it("ignores invalid ablation metadata", () => {
    const parsed = parseEvidenceIndex({
      ...baseIndex,
      experiments: [{ id: "X", title: "Bad mapping", kind: "CONTROL", status: "TESTED", ablation_stage: "A9" }],
    });
    expect(parsed.experiments?.[0]?.ablation_stage).toBeUndefined();
  });
});
