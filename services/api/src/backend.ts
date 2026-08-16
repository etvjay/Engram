import { TitanEmbeddingProvider } from "../../../packages/bedrock/src/embeddings.js";
import { createCockroachPool } from "../../../packages/cockroach/src/client.js";
import { CockroachControlPlaneStore } from "../../../packages/cockroach/src/control-plane.js";
import { CockroachMemoryEvaluationStore } from "../../../packages/cockroach/src/evaluation-store.js";
import { CockroachMemoryRepository } from "../../../packages/cockroach/src/repository.js";
import { CockroachRuntimeStore } from "../../../packages/cockroach/src/runtime-store.js";
import { EngramRuntime } from "../../../packages/runtime/src/runtime.js";
import { DEMO_RUNTIME_POLICIES } from "../../demo/src/runtime-policy.js";

const pool = createCockroachPool();
const embeddings = new TitanEmbeddingProvider();
const repository = new CockroachMemoryRepository(pool, embeddings);
const runtimeStore = new CockroachRuntimeStore(pool, repository);
const runtime = new EngramRuntime(runtimeStore, DEMO_RUNTIME_POLICIES);
const controlPlane = new CockroachControlPlaneStore(pool);
const evaluation = new CockroachMemoryEvaluationStore(pool);

export function getApiBackend() {
  return {
    pool,
    repository,
    runtime,
    controlPlane,
    evaluation,
  };
}
