# Base settlement authority adapter

Status: `IMPLEMENTED / LOCAL_CONFORMANCE_PASS / LIVE_BASE_UNVERIFIED`

This server-only package converts an Engram provider decision into a bounded Base Sepolia USDC settlement intent and independently verifies the resulting onchain receipt.

It exists to make remembered experience economically consequential rather than merely observable.

```text
prior execution evidence
  -> Engram relationship memory
  -> Sibyl persistence
  -> fresh Engram recall
  -> changed provider/terms
  -> Base settlement authority
  -> Base receipt verification
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

## Local conformance

Run:

```bash
npm run test:base
```

The local suite proves:

- urgent relationship memory changes the settlement recipient Atlas -> Beacon;
- routine relationship memory changes authorized prepay `4.000000 -> 0.800000 USDC`;
- malformed provider addresses fail closed;
- a receipt is accepted only when it is successful and contains the expected Circle USDC `Transfer`;
- wrong recipient fails;
- wrong amount fails;
- wrong token contract fails;
- reverted transaction fails.

The Base tests are also included in canonical `npm run test:all` / `npm run check`. Canonical CI run `33264157362`, check job `99131095748`, passed on code head `266d3c38acc3c70a9533315679d4927108852ba3`.

## Live verification

Once an explicit wallet step has executed the reviewed settlement intent:

```bash
ENGRAM_BASE_RPC_URL='<BASE_SEPOLIA_RPC>' \
  npm run base:settlement:verify -- \
  --intent <intent.json> \
  --tx-hash <0x...>
```

The verifier calls `eth_getTransactionReceipt` and emits Base evidence only if the observed USDC transfer matches the decision-derived recipient and atomic amount.

## Evidence boundary

`LOCAL_CONFORMANCE_PASS` proves the causal settlement model and fail-closed receipt verifier. It does **not** prove an executed Base transaction and does not earn the partner multiplier.

`BASE-001` remains `UNVERIFIED` until a real Base Sepolia action is executed and retained with:

- transaction hash;
- successful receipt;
- token transfer evidence matching the decision-derived recipient and amount;
- Engram execution/retrieval/decision IDs;
- demonstration that removing or changing the remembered decision changes the Base action.

No private key, wallet secret, or signer material belongs in this package or repository.
