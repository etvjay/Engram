# Engram web evidence contract

The Engram product must render research evidence without copying experiment metrics or research commit SHAs into React source.

## Runtime source

The web app reads a canonical index through `EvidenceClient`.

Preferred transport:

```text
GET /api/evidence/index
```

Static fallback:

```text
https://raw.githubusercontent.com/{owner}/{repo}/{ref}/{indexPath}
```

Configurable transport defaults:

```text
VITE_ENGRAM_EVIDENCE_OWNER=etvjay
VITE_ENGRAM_EVIDENCE_REPO=Engram-Memory
VITE_ENGRAM_EVIDENCE_REF=<transport ref>
VITE_ENGRAM_EVIDENCE_INDEX=evidence/web/index.json
```

`VITE_ENGRAM_EVIDENCE_REF` is only a transport locator for finding the index. It is **not evidence provenance**. The product must display research provenance exclusively from the loaded index's `ref` and `commit` fields.

The canonical research producer publishes `evidence/web/index.json` using schema `engram-evidence-index-v1`. If the index cannot be loaded, the Evidence surface intentionally renders `EVIDENCE SOURCE UNAVAILABLE`, and provenance fields render `UNAVAILABLE`, rather than reconstructing research state from frontend constants or repository branch state.

## Index contract

```json
{
  "schema_version": "engram-evidence-index-v1",
  "generated_at": "...",
  "repository": "etvjay/Engram-Memory",
  "ref": "...",
  "commit": "...",
  "dataset": {},
  "experiments": [],
  "latest": {}
}
```

The `ref` and `commit` fields are authoritative for screenshots and product provenance. Do not infer either value from build-time environment variables, GitHub branch state, or frontend source constants.

Experiment objects are generic. A0–A4 controls/ablations, PRISM-14 structural causal provenance, and later PRISM experiments must appear through the same index-driven renderers. No frontend source-code modification should be required to advance an ablation status or render a newly published experiment.

## Claim safety

The frontend must preserve experiment status, coverage, kind, warnings, metrics, claim scope, and `ablation_stage`. It must never convert diagnostic recoverability into benchmark accuracy or infer a stronger status than the source provides.

Recognized status vocabulary:

```text
IMPLEMENTED TESTED DEPLOYED SIMULATED PROPOSED UNKNOWN NOT_RUN
```

Coverage:

```text
FULL SUBSET SMOKE
```

Experiment kind:

```text
BENCHMARK DIAGNOSTIC LIVE_MECHANISM CONTROL CAUSAL
```

Ablation display rules:

```text
index has matching A0/A1/A2/A3/A4 experiment -> render source status
index missing or unavailable                    -> UNAVAILABLE
source explicitly says NOT_RUN                  -> NOT_RUN
```

`ablation_stage` is the only authoritative A0–A4 mapping field. The frontend must not infer a stage from an experiment title, ID prefix, or claim text.

PRISM-14 is structural causal provenance. It may be `TESTED` while A4 remains `NOT_RUN`. The product must not present PRISM-14 as proof that memory caused a behavioral change; that stronger claim requires the behavioral causal experiment represented by A4/PRISM-15.

## Failure behavior

A missing index, malformed index, unavailable source, missing experiment, or unknown future experiment kind must not crash the rest of the product. Evidence renders an explicit unavailable/unknown state while Overview, Trace, Experience, and Compare remain usable.

## Producer handoff

The research repository generates `evidence/web/index.json` from committed manifests/results, validates it, and publishes it on relevant research updates. The deployed product should advance by fetching the updated index; no frontend source-code modification, commit-SHA update, or manual metric copy is required.
