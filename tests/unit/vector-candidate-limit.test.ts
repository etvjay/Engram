import { afterEach, describe, expect, it } from "vitest";
import { resolveVectorBeamSize, resolveVectorCandidateLimit } from "../../packages/cockroach/src/repository.js";

describe("resolveVectorCandidateLimit", () => {
  afterEach(() => {
    delete process.env.ENGRAM_VECTOR_CANDIDATE_LIMIT;
  });

  it("defaults to a 64-candidate envelope for the normal top-8 retrieval", () => {
    expect(resolveVectorCandidateLimit(8)).toBe(64);
  });

  it("scales with larger result limits", () => {
    expect(resolveVectorCandidateLimit(20)).toBe(160);
  });

  it("never permits a configured candidate limit below the requested result limit", () => {
    process.env.ENGRAM_VECTOR_CANDIDATE_LIMIT = "4";
    expect(resolveVectorCandidateLimit(8)).toBe(8);
  });

  it("caps the candidate envelope", () => {
    process.env.ENGRAM_VECTOR_CANDIDATE_LIMIT = "1000";
    expect(resolveVectorCandidateLimit(8)).toBe(400);
  });
});

describe("resolveVectorBeamSize", () => {
  afterEach(() => {
    delete process.env.ENGRAM_VECTOR_BEAM_SIZE;
  });

  it("defaults to the smallest live-tested beam that restored top-8 recall", () => {
    expect(resolveVectorBeamSize()).toBe(128);
  });

  it("accepts an explicit positive integer beam", () => {
    process.env.ENGRAM_VECTOR_BEAM_SIZE = "256";
    expect(resolveVectorBeamSize()).toBe(256);
  });

  it("falls back to 128 for invalid values", () => {
    process.env.ENGRAM_VECTOR_BEAM_SIZE = "not-a-number";
    expect(resolveVectorBeamSize()).toBe(128);
  });

  it("caps the beam to keep configuration bounded", () => {
    process.env.ENGRAM_VECTOR_BEAM_SIZE = "4096";
    expect(resolveVectorBeamSize()).toBe(512);
  });
});
