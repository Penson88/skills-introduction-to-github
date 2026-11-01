# Dated town locations and residential footprints

**No dated residential records are currently shipped.** The existing source-located Natural Earth city references have no established historical occupation period and cannot stand in for old town locations. The WRI dam point is infrastructure context, not habitation evidence.

Add actual evidence records under `archives` in `public/data/research.json`. All ordinary archive fields remain required: bilingual title / summary / research notes / period / impact, unique ID, source URL, item rights, location certainty and coordinates in longitude/latitude. For a place to appear as habitation evidence, it must also have:

- `evidence: "documented"` and actual supported coordinates.
- A `residence` object with integer `fromYear` and `toYear` (inclusive), `sourceUrl`, and a plain-language `method` that explains dating, spatial evidence and uncertainty.
- `kind: "town-location"` for a sourced town locator. It does **not** map individual homes or establish a residential boundary.
- `kind: "residential-footprint"` plus `footprintUrl: "/data/YOUR-ACTUAL-FILE.geojson"` for independently evidenced residential land. This file must contain at least one valid Polygon/MultiPolygon FeatureCollection in WGS84 within the study region. Unknown or unlicensed imagery is not a footprint.

The field structure is:

```
residence:
  fromYear: source-supported starting year
  toYear: source-supported ending year
  kind: town-location OR residential-footprint
  sourceUrl: actual HTTPS evidence URL
  method: georeferencing, dating and uncertainty notes
  footprintUrl: local acquired GeoJSON path (required for residential-footprint)
```

This is documentation, not a sample settlement to publish. No invented coordinates, place names, households, period bounds or relocation relationships should be used to populate it. Keep old and new town locations as separate records with individually supported dates and provenance. Mapping a new location does not automatically establish where its residents came from. No migration arrows are produced.

The app displays a record only where `fromYear ≤ selected year ≤ toYear`. Layer 01 uses the chosen earlier year; Layers 02/03 use the current timeline year. Thus switching years changes which historical locations are shown. Optional undated reference places remain separate. Polygon footprints have clickable archival IDs; approximate locations are distinguished with dashed outlines. A town point and an areal footprint are explicitly labelled differently in the archive.

Run `npm run data:validate`, `npm run data:validate:gis`, and `npm run build`, then inspect records and date transitions in the browser. Validation checks metadata, coordinate range, polygon validity and declared years; it cannot establish the truth of a historical claim. Cross-check source maps, gazetteers, residential land-use evidence and positional uncertainty before exhibition.

**Evidence limits:** Landsat water classification maps water, not residents. WSF/GHSL built-up pixels map built structures under their product definitions, not necessarily occupied houses or verified household addresses. A settlement's familiar modern name does not locate its old town. Do not infer an individual's location or household history from these products.
