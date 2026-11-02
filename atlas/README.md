# SUBMERGED GEOGRAPHIES

**An Interactive Counter-Map of the Three Gorges** · RCA MA Architecture / ADS2

A working React / TypeScript / MapLibre research atlas, with an editorial bilingual interface and an evidence-first data policy. This application lives in `atlas/` inside the existing GitHub course repository; the original course files are preserved.

## Run locally

Requirements: Node 22.12+ (tested with Node 24.19), npm, a WebGL-capable browser.

```sh
cd atlas                         # from the repository root
npm ci
npm run dev                     # port 5173; Ctrl-C to stop
```

Open `http://localhost:5173` in your local browser. In a hosted development environment, use its supported port-forwarding facility for port 5173. For publication status and deployment steps, see [DEPLOYMENT.md](DEPLOYMENT.md). No API keys, tile account, database or runtime external network requests are needed for the bundled map. Standard browser hardware acceleration is recommended.

```sh
npm run build                   # TypeScript check + production output in dist/
npm run preview                 # serve the build on port 4173
```

For deployment later, serve `dist/` from an HTTPS static host. The build uses relative asset paths; geographic data and terrain resolve relative to the document, supporting both root hosting and a GitHub project Pages subdirectory. Keep the published entry URL's trailing slash. No SPA history rewrite is needed: navigation stays within the atlas. Retain Natural Earth and any later data/media attribution. Do not enable external tile sources until their licensing, rate limits and attribution have been reviewed.

## What works now

- Real, locally served Natural Earth geographic vectors; full-reservoir initial view plus China locator, Yangtze and tributaries, scale bar, geographic attribution and zoom navigation.
- Research-window outline (editorial bounding box, **not a reservoir boundary**), three spatial scales and city reference locations.
- Three independently controlled **research** layers. They are currently empty: the visible river line is undated basemap context, not historical water evidence.
- Archive index, category filters, clickable source-located reference points, bilingual record panels and optional image / video / audio fields.
- Chinese / English interface; sources, licensing and methodology dialog; keyboard controls; reduced-motion support; desktop and mobile layouts.
- Timeline with explicit data availability; choice of earlier / later observation, opacity control, and a functional dual-MapLibre comparison divider that **only enables with compatible imported observations**. Both canvases use the same style and camera; camera changes are copied from the interactive map.
- Turf computes later-minus-earlier geodesic water area on a checksum-verified common valid-data footprint. This is a classification difference, not a causal estimate of permanent submergence.
- A freely navigable six-chapter guided reading mode.

## Deliberate limits

Read [DATA_GAPS.md](DATA_GAPS.md) before exhibiting the work. No historical or reservoir-era water masks, verified affected settlements, migration routes, archival images, or regional DEM are bundled. Those features are not simulated. The dam marker now preserves the WRI source inventory coordinate (WRI1000452, CC BY 4.0); positional accuracy is unspecified and it is not a surveyed dam footprint. Reference city coordinates are source-checked, but their historical period / social impact is not established. Close zoom does not improve the original map's resolution.

## Validate

```sh
npm test                        # evidence guards + geodesic difference tests
npm run data:validate            # coordinate ranges, provenance metadata, reference matches
npm run test:e2e                 # Chromium; auto-starts Vite if needed
```

On machines without Chromium: `npx playwright install chromium`. Set `CHROMIUM_PATH` for an existing executable if necessary. The tests use software WebGL in headless Chromium; there is no browser download during `npm ci`.

GIS checks / processing additionally require Python 3.11+:

```sh
python3 -m venv .venv
.venv/bin/pip install -r scripts/requirements.txt
npm run data:validate:gis        # independent Shapely geometry + coverage audit
npm run test:gis                 # temporary synthetic raster tests, not real observations
npm run data:fetch               # re-download and extract pinned Natural Earth context
```

The fetcher verifies TLS, pins an upstream Git commit and records acquisition dates and SHA-256 of original bytes in `public/data/provenance.json`. USA / Sudan context polygons require explicit planar topology repair with Shapely `make_valid`; this is recorded and never applied to historical evidence. The default site also works offline after loading its assets.

## Import actual JRC annual water rasters

Obtain licensed JRC v1.4 Yearly History exports for the chosen years. Authentication, downloading, scene selection, dates and source review are the researcher's responsibility. The catalogue URL is a candidate source; it was blocked by the current network policy and was not acquired. Never pass Landsat reflectance bands into this importer as though they were JRC class values.

Both regional raster crops must have exactly the same CRS, transform, dimensions and grid, using classes **0=no data; 1=not water; 2=seasonal water; 3=permanent water**. Crop to 105–113° E / 28–33° N, and restrict the extent to a meaningful study area; max 20 million pixels per input. If alignment is needed, export on a common grid or use nearest-neighbour resampling for categorical data and record that upstream operation. Never bilinear-resample classes.

```sh
.venv/bin/python scripts/import_water.py \
  --before /path/to/jrc-1987-regional.tif --before-year 1987 \
  --after /path/to/jrc-2021-regional.tif --after-year 2021 \
  --source-url 'https://developers.google.com/earth-engine/datasets/catalog/JRC_GSW1_4_YearlyHistory' \
  --license 'JRC GSW use terms reviewed; cite Pekel et al. 2016' --resolution 30 \
  --acquired YYYY-MM-DD
npm run data:validate
npm run data:validate:gis
```

This is a command template, not evidence that either year has been downloaded. The importer excludes class 0 in **either** year, polygonises classes 2+3 within their shared valid coverage, dissolves to one multipart feature, checks geometry validity, transforms to longitude/latitude without simplification, hashes the exact coverage file and writes the manifest. The original raster hashes are retained. Repeating the same import replaces those years without duplicating them. Preserve original files and acquisition/processing logs outside the web root. Compare annual classifications as annual classifications; they are not season-matched shoreline snapshots.

On reload, the browser validates metadata and regional coordinates, checks coverage-file SHA-256, and rejects water outside that footprint. Exact topology is independently audited by `data:validate:gis`. Source integrity checks cannot establish that a classification is scientifically appropriate: inspect imagery, dates, sensor artefacts and no-data coverage before exhibition.

## Import terrain

No DEM was acquired. If a legally usable, regional, metre-elevation GeoTIFF with documented CRS, vertical datum, explicit no-data metadata and sufficient padding becomes available:

```sh
.venv/bin/python scripts/import_dem.py /path/to/padded-dem.tif \
  --source-url 'https://YOUR-ACTUAL-SOURCE' --license 'ACTUAL-LICENSE' \
  --attribution 'ACTUAL REQUIRED ATTRIBUTION' --acquired YYYY-MM-DD \
  --units metres --vertical-datum 'ACTUAL PRODUCT VERTICAL DATUM' \
  --bounds 109.8 30.6 111.2 31.2 --minzoom 7 --maxzoom 9
```

Use actual source metadata, not the template strings. The script resamples continuous elevations bilinearly into local Terrarium tiles for MapLibre hillshade and writes provenance plus the terrain manifest. Requested tiles must have complete valid elevation coverage, including tile edges; missing elevations cause a hard failure rather than a zero-elevation fill. Supply a padded DEM, or reduce the requested bounds. Document vertical units and datum independently: no vertical conversion is made. Rendering hillshade does not validate an inundation model. Do not infer shoreline by filling terrain below 175 m. Inspect generated relief against the source DEM before use.

## Add archive evidence without editing components

Edit `public/data/research.json` → `archives`. Keep `observations`, `version` and `terrain`. Each record follows `ArchiveRecord` in `src/data/catalog.ts`:

```json
{
  "id": "YOUR-UNIQUE-ID",
  "title": {"en": "Title", "zh": "中文标题"},
  "category": "geography",
  "period": {"en": "Documented date or period", "zh": "有证据支持的日期或时期"},
  "summary": {"en": "Evidence-led summary", "zh": "基于证据的摘要"},
  "notes": {"en": "Provenance, uncertainty, method", "zh": "来源、不确定性与方法"},
  "certainty": "unlocated",
  "evidence": "source-lead",
  "source": "Actual collection, author and item reference",
  "sourceUrl": "https://ACTUAL-SOURCE-URL",
  "rights": "Actual item-level usage information",
  "impact": {"en": "No impact established", "zh": "尚未确认影响"}
}
```

This is a non-geographic schema example, not an archive record to publish unchanged. Add `coordinates: [longitude, latitude]` only with location evidence and set `certainty` to `source-located` or `approximate`. Record uncertainty and the coordinate method in `notes`. Unlocated records omit coordinates. Source leads cannot be mapped. `settlements` records must have `evidence: documented`; they need dated historical location evidence, not a modern city name. Categories: `geography`, `settlements`, `engineering`, `resettlement`, `official`, `ecology`.

Optional `media` is an array of `{kind: "image" | "video" | "audio", url: "https://…", caption: {en, zh}, rights: "item credits and usage terms"}`. Use stable, rights-cleared HTTPS assets; the app does not invent or scrape media. Keep IDs unique, run validation, and review changes in the browser. No migration-route feature is supplied: adding routes later requires documented origin/destination relationships.

## Structure

```
src/components/MapView.tsx   MapLibre basemap, markers, camera and comparison
src/App.tsx                 editorial layout, bilingual UI, archive, timeline
src/data/catalog.ts         audited reference records + source inventory
src/lib/research.ts         manifest guards, coverage checks and Turf operations
public/data/                bundled GeoJSON + provenance + research manifest
scripts/                    pinned fetcher, water/DEM importers, GIS audits
tests/                      unit, raster pipeline and browser tests
```

[DATA_SOURCES.md](DATA_SOURCES.md) · [RESEARCH_METHOD.md](RESEARCH_METHOD.md) · [DATA_GAPS.md](DATA_GAPS.md) · [VALIDATION.md](VALIDATION.md)

## Three-period reservoir views

The atlas now opens in a **local Yiling / dam-area study window**. The user-supplied “Unnamed Road, 443134” is not a uniquely geocoded road; until a share link or coordinate is supplied, the sourced WRI dam point is a temporary regional anchor. The three prominent map buttons select Before the Dam, Submergence & Displacement, and Engineered Waters. Independent overlay switches remain available under **Overlay visibility**. The wordmark and breadcrumb reset this local view. National and whole-reservoir navigation are no longer offered; min zoom and maximum navigation bounds keep exploration local.

The second view can play **actual imported observation frames only**, with pause, three speeds and automatic stop at the final frame. It requires at least two masks with the same audited coverage, classification and resolution. No temporal interpolation, width pulsing, river-buffer growth or 175 m terrain fill is substituted. With no real masks imported, playback remains disabled and explains the gap. The newly classified-water difference is a separate derived overlay, not a claim of permanent dam-caused inundation.

**Where did people live?** is filtered by a documented habitation period, independently of the undated reference city dataset. Old city names are hidden from historical maps unless the reader explicitly enables undated reference places. See [RESIDENTIAL_DATA.md](RESIDENTIAL_DATA.md) for the record schema, footprint requirements and limitations. No dated habitation data is currently bundled; a zero-record status describes missing evidence, not an uninhabited landscape.

To reproduce the dam inventory extraction: `python3 scripts/fetch_dam.py`. This downloads the pinned WRI CSV, selects only WRI1000452 and writes `dam.geojson` plus original-byte SHA-256 provenance. Attribution is visible on the map and in the source inventory. No facilities commissioning field is reused as a dated water observation.

## Current geographic scope · 2 November 2026

User request: concentrate on an unnamed road in Yiling District, Yichang, Hubei (postal code 443134), not the whole map. This address does not uniquely identify a road. The map currently uses the already sourced dam inventory point (111.0032, 30.8235) as an **explicitly temporary nearby anchor**, not a claimed road geocode. A map share link or latitude/longitude is required for exact placement.

Initial window: 110.92–111.09° E / 30.77–30.88° N. Navigation limit: 110.82–111.20° E / 30.67–31.00° N. These are editorial viewport limits, not district boundaries or inundation estimates. Minimum zoom 10.8, maximum zoom 13. Layer switching and guided reading stay in the local view; archive entries outside it remain readable without moving the map outside the area. Basemap data resolution is unchanged and does not support street-level claims.
