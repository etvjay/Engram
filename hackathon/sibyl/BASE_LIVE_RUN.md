# Base Live Settlement Proof

Status: `NOT_EXECUTED`

This runbook promotes Base only when an Engram memory-conditioned decision causes and matches a real Base Sepolia USDC action.

## Frozen evaluated network

- network: Base Sepolia
- chain ID: `84532`
- token: Circle USDC
- token address: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- decimals: `6`

Reverify these values from first-party Base/Circle documentation immediately before the official live run.

## Required causal chain

```text
execution evidence
  -> Sibyl memory
  -> fresh Engram recall
  -> Engram provider decision
  -> engam.base-settlement-intent/v1
  -> explicit wallet execution on Base Sepolia
  -> receipt
  -> USDC Transfer matches recipient + amount
  -> Base settlement evidence
```

A transaction hash without the preceding memory/decision linkage does not qualify.

## Live sequence

1. Start from a hackathon-window commit with green canonical CI.
2. Use an isolated/new Sibyl evidence DB or retained build-window DB whose provenance is explicit.
3. Run/ingest provider execution evidence.
4. Form the relationship memory through normal Engram admission.
5. Terminate the originating process.
6. In a fresh process, recall the relationship memory and record the provider decision.
7. Derive a Base settlement intent containing:
   - execution ID;
   - retrieval ID;
   - decision ID;
   - memory refs;
   - provider ID;
   - provider recipient address;
   - prepay basis points;
   - exact USDC atomic amount;
   - no-memory counterfactual.
8. Review the intent before signing anything.
9. Execute exactly that authorized USDC transfer with the selected testnet wallet/signer.
10. Retain the transaction hash. Never retain/export the private key in Engram evidence.
11. Verify independently:

```bash
ENGRAM_BASE_RPC_URL='<BASE_SEPOLIA_RPC>' \
  npm run base:settlement:verify -- \
  --intent artifacts/base/<intent>.json \
  --tx-hash <0x...>
```

12. Verification must fail unless the receipt:
   - succeeded;
   - contains a Circle Base Sepolia USDC `Transfer`;
   - transfers to the exact decision-derived recipient;
   - transfers the exact decision-derived amount.
13. Save verifier stdout, transaction hash, explorer link, receipt, intent, and Engram trace in the final evidence bundle.

## Flagship expected deltas

### Urgent
Control:
- provider: Atlas
- Base recipient: Atlas address

Memory-conditioned:
- provider: Beacon
- Base recipient: Beacon address

### Routine
Control:
- provider: Atlas
- max spend: $8
- prepay: 50%
- authorized initial transfer: `4.000000 USDC`

Memory-conditioned:
- provider: Atlas
- max spend: $8
- prepay: 10%
- authorized initial transfer: `0.800000 USDC`
- milestone verification: required

The routine case is the stronger Base authority proof because memory changes how much capital the same counterparty is permitted to receive, not merely which address is selected.

## Negative pressure

A live claim is invalid if any of these are true:
- recipient differs from the settlement intent;
- amount differs from the settlement intent;
- wrong token contract;
- reverted transaction;
- no retrieval/decision provenance;
- transfer was executed independently of the Engram decision;
- only a screenshot is retained and raw transaction evidence is unavailable.

## Promotion

`BASE-001` remains `UNVERIFIED` until this sequence is executed during the eligible build window.

Local intent/receipt tests can support an internal conformance gate but cannot promote the published Base partner gate.
