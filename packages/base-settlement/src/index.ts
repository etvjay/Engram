import type {
  ProviderDecision,
  ProviderId,
  ProviderTerms,
} from "../../scenarios/provider-continuity/src/index.js";

export const BASE_SEPOLIA_CHAIN_ID = 84_532;
export const BASE_SEPOLIA_NETWORK = "base-sepolia" as const;
export const BASE_SEPOLIA_USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
export const USDC_DECIMALS = 6;

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

export type ProviderAddressBook = Record<ProviderId, string>;

export type SettlementProvenance = {
  executionId: string;
  retrievalId?: string;
  decisionId?: string;
};

export type BaseSettlementTerms = {
  maxSpendUsd: number;
  prepayBps: number;
  authorizedPrepayAtomic: bigint;
  authorizedPrepayUsd: string;
  requireMilestoneVerification: boolean;
};

export type BaseSettlementCounterfactual = {
  providerId: ProviderId;
  recipient: string;
  terms: BaseSettlementTerms;
};

export type BaseSettlementIntent = {
  schema: "engram.base-settlement-intent/v1";
  chainId: typeof BASE_SEPOLIA_CHAIN_ID;
  network: typeof BASE_SEPOLIA_NETWORK;
  token: "USDC";
  tokenAddress: typeof BASE_SEPOLIA_USDC;
  providerId: ProviderId;
  recipient: string;
  terms: BaseSettlementTerms;
  memoryRefs: string[];
  provenance: SettlementProvenance;
  counterfactual?: BaseSettlementCounterfactual;
};

function assertAddress(address: string, label: string): string {
  if (!ADDRESS_RE.test(address)) throw new Error(`INVALID_${label.toUpperCase()}_ADDRESS`);
  return address;
}

function usdToUsdcAtomic(value: number): bigint {
  if (!Number.isFinite(value) || value < 0) throw new Error("INVALID_USD_AMOUNT");
  const scaled = Math.round(value * 1_000_000);
  if (Math.abs((scaled / 1_000_000) - value) > 1e-9) {
    throw new Error("USD_AMOUNT_EXCEEDS_USDC_PRECISION");
  }
  return BigInt(scaled);
}

export function usdcAtomicToDecimal(value: bigint): string {
  if (value < 0n) throw new Error("NEGATIVE_USDC_AMOUNT");
  const whole = value / 1_000_000n;
  const fraction = (value % 1_000_000n).toString().padStart(6, "0");
  return `${whole}.${fraction}`;
}

function settlementTerms(terms: ProviderTerms): BaseSettlementTerms {
  if (!Number.isInteger(terms.prepayBps) || terms.prepayBps < 0 || terms.prepayBps > 10_000) {
    throw new Error("INVALID_PREPAY_BPS");
  }
  const maxSpendAtomic = usdToUsdcAtomic(terms.maxSpendUsd);
  const authorizedPrepayAtomic = (maxSpendAtomic * BigInt(terms.prepayBps)) / 10_000n;
  return {
    maxSpendUsd: terms.maxSpendUsd,
    prepayBps: terms.prepayBps,
    authorizedPrepayAtomic,
    authorizedPrepayUsd: usdcAtomicToDecimal(authorizedPrepayAtomic),
    requireMilestoneVerification: terms.requireMilestoneVerification,
  };
}

export function deriveBaseSettlementIntent(input: {
  decision: ProviderDecision;
  addresses: ProviderAddressBook;
  provenance: SettlementProvenance;
}): BaseSettlementIntent {
  const recipient = assertAddress(input.addresses[input.decision.providerId], "provider");
  const counterfactual = input.decision.counterfactual
    ? {
      providerId: input.decision.counterfactual.providerId,
      recipient: assertAddress(input.addresses[input.decision.counterfactual.providerId], "counterfactual_provider"),
      terms: settlementTerms(input.decision.counterfactual.terms),
    }
    : undefined;

  return {
    schema: "engram.base-settlement-intent/v1",
    chainId: BASE_SEPOLIA_CHAIN_ID,
    network: BASE_SEPOLIA_NETWORK,
    token: "USDC",
    tokenAddress: BASE_SEPOLIA_USDC,
    providerId: input.decision.providerId,
    recipient,
    terms: settlementTerms(input.decision.terms),
    memoryRefs: [...input.decision.memoryRefs],
    provenance: input.provenance,
    counterfactual,
  };
}
