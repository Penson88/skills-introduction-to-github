# Research method

## Question and position

How can counter-mapping reveal the submerged geographies, displaced settlements and changing water boundaries of the Three Gorges Dam that conventional engineering maps do not fully communicate?

The atlas brings measurement and situated histories into the same frame. It does not assume technical maps are false or historical accounts are automatically complete. The conceptual frame draws on Dilip da Cunha, *The Invention of Rivers*; Gabrielle Hecht, *Interscalar Vehicles for an African Anthropocene*; and Rob Nixon, *Slow Violence and the Environmentalism of the Poor*. RCA ADS2 briefs inform the project context but were not supplied as source documents and are not quoted. No invented quotations, population figures or relocation routes appear.

## Four separate kinds of evidence

1. **Cartographic context**: undated Natural Earth country, river and city data. Useful for orientation; inappropriate for detecting local inundation.
2. **Observed classification**: future imported, dated water masks, with common observed coverage and documented classification method. None currently bundled.
3. **Derived difference**: later water minus earlier water within the same valid-data footprint. This describes a classification change, not sole dam causation, persistence, land ownership or loss of habitat.
4. **Historical interpretation**: archival evidence linked to a location with a period, impact, source and uncertainty. A modern name does not locate a historical settlement.

The WRI inventory dam point is a source-located facility reference with unspecified accuracy; the editorial study window remains a navigation annotation. Neither is an observed or reconstructed water boundary. No modelled engineering elevation boundary is currently displayed.

## Geography and precision

Coordinates use longitude first, latitude second (OGC:CRS84). MapLibre uses Web Mercator for display; Turf uses geodesic area for WGS84 polygons. Never subtract Web Mercator planar areas and call them measured land loss. Natural Earth's scale is shown at close zoom: increasing zoom does not produce new evidence. No GCJ-02 / BD-09 coordinates are accepted without an explicit, documented conversion to WGS84. Do not align layers by visually nudging them.

The water importer requires identical input grids and CRS, rejects unknown classes and empty shared coverage, excludes missing observations in either year, transforms polygon geometry to WGS84 and rejects invalid output. It records raster hashes and hashes the exact common-coverage file. Both years must reference that footprint; the browser verifies its checksum and verifies water stays inside it. Independent Shapely audits verify geometry validity and containment. Imported data still needs scientific review: valid geometry is not proof of a correct interpretation.

## Time and seasonal limits

Timeline years are research windows until observations are acquired. No engineering water levels or impoundment dates have been inferred from the year alone. JRC annual class 2 (seasonal) plus class 3 (permanent) indicates classified water at some point in a year, not a single day, a season-matched pair or a permanently inundated footprint. Unequal observation frequency, clouds, turbidity, sensor differences and annual aggregation can change classifications. For a season-specific argument, obtain and process appropriate monthly or scene-level observations with a separately documented method; do not re-label annual data.

## Terrain

A DEM describes surface elevation for its acquisition/product period. It cannot reconstruct submerged pre-dam terrain by itself. Hillshade, observed shoreline, engineering design limits, water elevations and administrative resettlement areas must remain separate. The optional DEM importer rejects voids in requested output tiles, records source metadata and resamples continuous elevation bilinearly for display. It makes no vertical-datum conversion, hydrological-connectivity model or 175 m inundation calculation. No regional DEM has yet been acquired.

## Archive and uncertainty

Source-located means a coordinate occurs in the identified source. Approximate means a locator needs its uncertainty and method explained. Unlocated records remain in the archive and cannot produce map points. A source lead is not an acquired item. A documented affected-settlement record needs an actual historical period, spatial evidence and impact description. No migration route is drawn from two coincident names or geographic proximity. Official, local and scholarly sources can be displayed together, with item-level provenance and rights, without an automatic hierarchy of truth.

## Exhibition ethics

An empty research layer is shown as an evidence gap, never as proof that a landscape had no inhabitants. Disabled comparison is a visible research condition. Archive media remains absent until an item has been acquired and its rights established. Synthetic geometries exist only in automated tests; they never enter shipped research data. Before exhibition, re-audit sources and dependencies, add an accurately sourced dam location and inspect at least one evidence-rich detailed area against primary materials.

## Dated residential geography and animation

Each habitation record carries an evidence-backed inclusive validity period and an independent spatial-source citation and method. A town locator indicates the place named by its source, not the extent of residential occupation or individual homes. Residential footprints need their own acquired geometry and evidence of residential use; remotely observed built-up area alone is insufficient. Every layer filters these records at its own selected year. Undated Natural Earth points remain optional, separately labelled context.

The water animation enumerates only available annual observations on the same validated footprint/resolution/classification. It never morphs a bank, fills intermediate years or animates a generic line-width parameter. The selected frame updates the water polygon and dated residential records together. Playback pauses on manual year/layer changes or page backgrounding and stops at the final frame. With fewer than two compatible real frames, playback is unavailable. Synthetic test fixtures verify the mechanism without entering the public research dataset.
