# Engram web evidence contract

The Engram product must render research evidence without copying experiment metrics into React source.

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

Default configuration:

```text
VITE_ENGRAM_EVIDENCE_OWNER=etvjay
VITE_ENGRAM_EVIDENCE_REPO=Engram-Memory
VITE_ENGRAM_EVIDENCE_REF=a3-engram-hydra-memory
VITE_ENGRAM_EVIDENCE_INDEX=evidence/web/index.json
```

The active research branch does not yet publish `evidence/web/index.json`. Until the research producer is wired, the Evidence surface intentionally renders `EVIDENCE SOURCE UNAVAILABLE` rather than embedding current metrics in frontend code.

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

Experiment objects are generic. New PRISM experiments should appear through the same renderer when they are added to the index. Unknown kinds are preserved as labels rather than crashing the product.

## Claim safety

The frontend must preserve experiment status, coverage, kind, warnings, and claim scope. It must never convert diagnostic recoverability into benchmark accuracy or infer a stronger status than the source provides.

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

## Failure behavior

A missing index, malformed index, unavailable source, missing experiment, or unknown future experiment kind must not crash the rest of the product. Evidence renders an explicit unavailable/unknown state while Overview, Trace, Experience, and Compare remain usable.

## Producer handoff

The research repository should generate `evidence/web/index.json` from committed manifests/results, validate it, and publish it on relevant research pushes. Once that producer exists, the deployed product can update by fetching the new index; no frontend source-code modification or manual metric copy is required.
