import type { EmbeddingProvider } from "../../memory-core/src/domain.js";
import { TitanEmbeddingProvider } from "../../bedrock/src/embeddings.js";
import { VertexEmbeddingProvider } from "../../vertex/src/embeddings.js";

export type EmbeddingProviderName = "bedrock" | "vertex";

export type ConfiguredEmbeddingProvider = EmbeddingProvider & {
  readonly provider: string;
  readonly modelId: string;
};

export function configuredEmbeddingProviderName(): EmbeddingProviderName {
  const raw = (process.env.ENGRAM_EMBEDDING_PROVIDER ?? "bedrock").trim().toLowerCase();
  if (raw === "bedrock" || raw === "vertex") return raw;
  throw new Error(`Unsupported ENGRAM_EMBEDDING_PROVIDER: ${raw}`);
}

export function createConfiguredEmbeddingProvider(): ConfiguredEmbeddingProvider {
  const provider = configuredEmbeddingProviderName();
  return provider === "vertex"
    ? new VertexEmbeddingProvider()
    : new TitanEmbeddingProvider();
}
