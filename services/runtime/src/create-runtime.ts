import { TitanEmbeddingProvider } from "../../../packages/bedrock/src/embeddings.js";
import { createCockroachPool } from "../../../packages/cockroach/src/client.js";
import { CockroachMemoryRepository } from "../../../packages/cockroach/src/repository.js";
import { CockroachRuntimeStore } from "../../../packages/cockroach/src/runtime-store.js";
import { DEFAULT_RUNTIME_POLICIES } from "../../../packages/runtime/src/defaults.js";
import { EngramRuntime } from "../../../packages/runtime/src/runtime.js";
import type { RuntimePolicyBundle } from "../../../packages/runtime/src/types.js";

let runtime: EngramRuntime | undefined;

export function createEngramRuntime(policies: RuntimePolicyBundle = DEFAULT_RUNTIME_POLICIES): EngramRuntime {
  const pool = createCockroachPool();
  const repository = new CockroachMemoryRepository(pool, new TitanEmbeddingProvider());
  const store = new CockroachRuntimeStore(pool, repository);
  return new EngramRuntime(store, policies);
}

export function getEngramRuntime(): EngramRuntime {
  if (!runtime) runtime = createEngramRuntime();
  return runtime;
}
