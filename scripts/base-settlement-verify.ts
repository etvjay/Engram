import { readFile } from "node:fs/promises";
import {
  fetchBaseChainId,
  fetchBaseTransactionReceipt,
  verifyBaseSettlementReceipt,
} from "../packages/base-settlement/src/evidence.js";
import { parseSerializedBaseSettlementIntent } from "../packages/base-settlement/src/index.js";

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const intentPath = arg("--intent");
const transactionHash = arg("--tx-hash");
const rpcUrl = arg("--rpc-url") ?? process.env.ENGRAM_BASE_RPC_URL;
const expectedPayer = arg("--payer") ?? process.env.ENGRAM_BASE_EXPECTED_PAYER;

if (!intentPath || !transactionHash || !rpcUrl) {
  throw new Error(
    "Usage: npm run base:settlement:verify -- --intent <intent.json> --tx-hash <0x...> [--rpc-url <url>] [--payer <0x...>] "
    + "or set ENGRAM_BASE_RPC_URL / ENGRAM_BASE_EXPECTED_PAYER",
  );
}

const raw = JSON.parse(await readFile(intentPath, "utf8")) as unknown;
const intent = parseSerializedBaseSettlementIntent(raw);
const observedChainId = await fetchBaseChainId({ rpcUrl });
const receipt = await fetchBaseTransactionReceipt({ rpcUrl, transactionHash });
const evidence = verifyBaseSettlementReceipt({
  intent,
  receipt,
  observedChainId,
  expectedPayer,
});
process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
