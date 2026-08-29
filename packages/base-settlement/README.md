# Base settlement authority adapter

Status: `IMPLEMENTED / LOCAL_CONFORMANCE_PENDING_CI / LIVE_BASE_UNVERIFIED`

This server-only package converts an Engram provider decision into a bounded Base Sepolia USDC settlement intent.

It exists to make remembered experience economically consequential rather than merely observable.

```text
prior execution evidence
  -> Engram relationship memory
  -> Sibyl persistence
  -> fresh Engram recall
  -> changed provider/terms
  -> Base settlement authority
```

## Current evaluated network

- network: Base Sepolia
- chain ID: `84532`
- asset: Circle USDC
- USDC contract: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- decimals: `6`

The contract address is pinned only for the evaluated testnet profile and must be reverified before the live hackathon run.

## Causal product role

For the flagship provider-continuity scenario:

### Urgent work
Without applicable memory, the application selects Atlas.

With repeated Atlas SLA-breach memory, the fresh decision selects Beacon.

Base therefore receives a **different settlement recipient** downstream of memory.

### Routine work
Without memory, Atlas receives 50% prepayment authority on an $8 offer: `4.000000 USDC`.

With applicable relationship memory, Atlas remains selected but prepayment authority falls to 10%: `0.800000 USDC`, with milestone verification required.

Base therefore receives a **smaller authorized economic action** downstream of memory rather than a decorative transfer.

## Evidence boundary

Current tests prove only deterministic derivation of settlement intent. They do not prove an executed Base transaction.

`BASE-001` remains `UNVERIFIED` until a real Base Sepolia USDC transfer or equivalent Base-native action is executed and retained with:

- transaction hash;
- successful receipt;
- token transfer evidence matching the decision-derived recipient and amount;
- Engram execution/retrieval/decision IDs;
- demonstration that removing or changing the remembered decision changes the Base action.

No private key, wallet secret, or signer material belongs in this package or repository.
