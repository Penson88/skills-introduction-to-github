# Data gaps — current delivery

This is a functioning atlas with real contextual geography and validated import capabilities. It is **not yet a historical inundation reconstruction**.

| Gap | Current behaviour | Evidence needed to resolve it |
|---|---|---|
| Historical river / shoreline | Research layer empty; undated river context explicitly labelled | Georeferenced, dated classification or reconstructable archival geometry, with season, CRS, resolution, method and uncertainty |
| Reservoir-era extent | Research layer empty; timeline shows “Data unavailable” | Comparable observed mask with common valid observation footprint |
| Before / after scientific comparison | Disabled on shipped data; functional mechanism tested only with synthetic test fixtures | Two appropriate, reviewed observations; verify classification, dates, alignment, season and no-data coverage |
| Affected historic settlements | Empty independent layer; no fabricated villages | Dated gazetteer/maps/official or scholarly evidence, old location, impact, confidence, source and rights |
| Relocation destinations / routes | Not drawn | Documented relationship between specific origin and destination; not inferred from modern city labels |
| Terrain / hillshade | No relief; land stays visible; control explains gap | Licensed regional DEM, horizontal and vertical CRS, source period, units, void treatment, padded coverage |
| Surveyed dam footprint | WRI inventory point acquired and source-matched; survey accuracy remains unknown | Engineering survey geometry and positional metadata if a precise footprint is needed |
| Archival media | None displayed; NASA item remains an unlocated source lead | Acquired original item, credits, permission / reuse terms, date verification and contextual notes |
| Detailed study area | Reference-place navigation works; high zoom warns about map scale | A strong common evidence set before any detailed submergence claim |
| Water-level / operational phases | No levels or engineering milestones assigned | Actual dated operating records with elevation reference and citations |
| Official versus local accounts | Data model/categories ready, but no invented evidence | Acquired and rights-cleared source items with sufficient context to compare responsibly |

## Access observations

During the 2026-11-01 audit, the platform proxy returned HTTP 403 for `science.nasa.gov`, `developers.google.com` and `s3.amazonaws.com`. No credentials were extracted, no source was bypassed and no access setting was changed. `raw.githubusercontent.com` supplied the pinned Natural Earth datasets. USGS scene access, Copernicus access and Earth Engine exports were not established. This is not evidence that those datasets are unavailable generally.

To continue research, permit the specific official hosts you intend to use in environment settings (preserve existing policy), acquire the materials through their supported access mechanisms and rerun the affected download. Source-page access alone does not equal dataset access. Enter any required secrets only through secure settings, never chat or source files.

## Priority

1. Acquire and cross-check one attributable dam point and one regionally complete licensed DEM.
2. Choose a small, evidence-rich area; obtain an actual historic / later water observation pair with common valid coverage.
3. Pair this geography with one properly dated historic settlement record and original archival evidence.
4. Verify seasonal interpretation and explanatory limits before expanding the collection.

At initial implementation, no public deployment, environment publication, repository push or course-step progression was performed. For subsequent website publication and its status, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Current three-layer update

The full-reservoir view, three direct layer buttons, evidence-year water playback mechanism and dated residential-location/footprint support are implemented. The water playback and habitation filtering were exercised using explicitly synthetic browser fixtures only. **There are still zero actual water observations and zero dated residential records in shipped research data.** No artificial widening or made-up towns were introduced.

Official source access is a current external blocker: NASA, the JRC catalogue and DLR WSF Evolution all returned proxy 403. Required additional hosts are saved in the environment draft. Applying those settings allows further investigation; it does not supply actual water masks, historical gazetteers, household evidence, georeferencing or licensing review. Subsequent data acquisition and validation remain required before these data-dependent features can be presented as historical results.
