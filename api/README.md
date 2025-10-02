# MealMap API

## Files

- `openapi.v1.json`: Current stable v1 spec for tooling and codegen.
- `archive/openapi.v1.0.0.json`: Immutable snapshots of exact past specs.

## Versioning

- Path version: `/v1` in URLs.
- Semantic version: `info.version` inside the spec.
- On changes within v1: add a new snapshot to `archive/` and update `openapi.v1.json`.
- On breaking changes: create `openapi.v2.json` and a new `archive/` series.
