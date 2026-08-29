import { readFile } from "node:fs/promises";
import {
  fetchBaseTransactionReceipt,
  verifyBaseSettlementReceipt,
} from "../packages/base-settlement/src/evidence.js";
import type { BaseSettlementIntent } from "../packages/base-settlement/src/index.js";

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const intentPath = arg("--intent");
const transactionHash = arg("--tx-hash");
const rpcUrl = arg("--rpc-url") ?? process.env.ENGRAM_BASE_RPC_URL;

if (!intentPath || !transactionHash || !rpcUrl) {
  throw new Error(
    "Usage: npm run base:settlement:verify -- --intent <intent.json> --tx-hash <0x...> [--rpc-url <url>] "
    + "or set ENGRAM_BASE_RPC_URL",
  );
}

const raw = JSON.parse(await readFile(intentPath, "utf8")) as Record<string, unknown>;
if (raw.schema !== "engram.base-settlement-intent/v1") throw new Error("INVALID_BASE_SETTLEMENT_INTENT_SCHEMA");

// JSON cannot encode bigint. Evidence files store atomic amounts as decimal strings.
const terms = raw.terms as Record<string, unknown> | undefined;
if (!terms || typeof terms.authorizedPrepayAtomic !== "string" || !/^\d+$/.test(terms.authorizedPrepayAtomic)) {
  throw new Error("INVALID_BASE_SETTLEMENT_INTENT_AMOUNT");
}

const intent = {
  ...raw,
  terms: {
    ...terms,
    authorizedPrepayAtomic: BigInt(terms.authorizedPrepayAtomic),
  },
  counterfactual: raw.counterfactual && typeof raw.counterfactual === "object"
    ? {
      ...(raw.counterfactual as Record<string, unknown>),
      terms: {
        ...((raw.counterfactual as Record<string, unknown>).terms as Record<string, unknown>),
        authorizedPrepayAtomic: BigInt(
          String((((raw.counterfactual as Record<string, unknown>).terms as Record<string, unknown>).authorizedPrepayAtomic)),
        ),
      },
    }
    : undefined,
} as unknown as BaseSettlementIntent;

const receipt = await fetchBaseTransactionReceipt({ rpcUrl, transactionHash });
const evidence = verifyBaseSettlementReceipt({ intent, receipt });
process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
