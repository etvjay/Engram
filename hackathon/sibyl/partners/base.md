# Base Partner Contract

Class: `PUBLISHED_BONUS`

## Published qualification
A claimed Base stack counts only when judges can see it doing real work in the product. Deployment is the eligibility floor; an executed onchain action shown in the demo earns the partner bonus, including wallet operation, x402 payment, B20 read, or contract interaction.

## Engram fit
Base is the economic consequence layer for remembered provider experience:

```text
Virtuals/provider execution evidence
  -> Engram observation
  -> Sibyl relationship memory
  -> fresh Engram recall
  -> provider/authority decision changes
  -> Base settlement action changes
```

The evaluated Base profile is Base Sepolia (`84532`) using Circle USDC at `0x036CbD53842c5426634e7929541eC2318f3dCF7e`.

## Flagship causal deltas

### Urgent
No-memory control selects Atlas. Applicable relationship memory selects Beacon.

The Base effect is a different settlement recipient.

### Routine
No-memory control selects Atlas with 50% prepayment on an $8 offer: `4.000000 USDC`.

Applicable relationship memory still selects Atlas but reduces prepayment to 10%: `0.800000 USDC`, while requiring milestone verification.

The Base effect is reduced economic authority, not a global provider blacklist.

## Veto
Do not claim Base merely because a transaction receipt exists. The transaction must match the settlement intent derived from the remembered Engram decision.

## Required evidence
- Engram execution ID;
- recall/retrieval ID when memory influenced the decision;
- decision-linked `engram.base-settlement-intent/v1` intent;
- protocol-native Base transaction hash and successful receipt;
- observed USDC transfer recipient and amount matching the intent;
- action visible in the demo;
- counterfactual showing what recipient/amount would have been authorized without memory.

## Acceptance test
`BASE-001` may promote only when a real Base Sepolia action proves:

`remembered decision == authorized settlement intent == observed onchain settlement`.

A transaction hash alone is insufficient.

## Negative tests
- remove memory: recipient/amount must revert to the control settlement;
- alter provider address: verification must not accept the wrong recipient;
- alter prepayment amount: verification must not accept the wrong amount;
- remove Base action: no Base partner claim remains.

Status: `IMPLEMENTED / LOCAL_CONFORMANCE_PENDING_CI / LIVE_BASE_UNVERIFIED`.
