# Data sources and licensing inventory

Audit date: **2026-11-01**. “Acquired” means actually downloaded and inspected, not merely linked. No tile-provider token or undocumented external basemap is used. React, MapLibre GL JS and Turf dependencies retain their upstream licenses; Natural Earth data is public domain. No claim is made to rights in future archive media.

## Acquired and used

Institution: Natural Earth contributors. [Official project](https://www.naturalearthdata.com/). Acquisition date: 2026-11-01. Source CRS: WGS 84 longitude/latitude; output GeoJSON OGC:CRS84; browser projection EPSG:3857. Original-byte SHA-256 and exact source URLs: `public/data/provenance.json`. All upstream files are pinned at Git commit **ca96624a56bd078437bca8184e78163e5039ad19**.

| Dataset | Scale | Use / output | Temporal extent | License |
|---|---|---|---|---|
| `ne_110m_admin_0_countries` | 1:110 million | 177 national context features / `countries.geojson` | Undated cartographic context | Public domain |
| `ne_10m_rivers_lake_centerlines` | 1:10 million | 238 line features intersecting broad China context / `rivers.geojson` | Undated cartographic context | Public domain |
| `ne_10m_populated_places_simple` | 1:10 million | Yichang, Chongqing and Fengjie / `places.geojson` | Undated cartographic context | Public domain |

Processing: `scripts/fetch_context.py` retains source coordinates, selects river features with at least one vertex within 73–136° E / 17–55° N, retains Yangtze name attribution, and strips unused country/place attributes. It does not classify water, reconstruct historic shorelines or derive affected places. Two source country geometries (USA and Sudan) have planar self-intersections. The reproducible extraction explicitly applies Shapely `make_valid`, retains polygonal parts and records this context-only repair in provenance. Other original source geometry is preserved. No such silent repair is permitted for imported water geometry.

Reference matches checked against downloaded source:

| Record | Original `ne_id` | Longitude | Latitude | Meaning |
|---|---|---|---|---|
| Yichang | 1159146995 | 111.278073 | 30.701918 | Geographic reference only |
| Chongqing | 1159151327 | 106.593036 | 29.566923 | Geographic reference only |
| Fengjie | 1159139667 | 109.516664 | 31.050442 | Location to investigate, not a verified old town |

Coordinate decimals reproduce dataset values, not measured positional accuracy. The app rounds them for display. “Source-located” does not establish old-town location, acquisition date, population, historical extent, displacement or a route. The Fengjie reference is explicitly excluded from the affected-settlement layer. Administrative boundaries are generalised cartographic context, without political recognition claims.

## Editorial annotations (not acquired GIS evidence)

- Dashed study window: **106.2–111.6° E, 29.2–31.5° N**. A navigation rectangle, not a reservoir outline, catchment, administrative area or impact boundary.
- Dam vicinity: **approximately 111° E, 30.8° N**, a deliberately rounded regional orientation point. Independent coordinate-source verification remains outstanding. No surveyed footprint, water level, engineering dimensions or historical precision is asserted. It is styled and labelled approximate, and must be replaced with an attributable geographic feature before making precision claims.
- Timeline years are research windows. They do not assert operational milestones, dates of valid scenes or water elevations.

## Candidate sources — not acquired or mapped

| Institution / dataset | Original source | Candidate coverage / resolution | Access result and licensing status |
|---|---|---|---|
| USGS Landsat Collection 2 | https://www.usgs.gov/landsat-missions/landsat-collection-2 | Scene-dependent; 30 m multispectral nominal | No scenes downloaded; no API/data access verified. USGS public-domain policy should be checked against selected products. |
| NASA Earth Observatory, Three Gorges Dam, China | https://science.nasa.gov/earth/earth-observatory/three-gorges-dam-china-7769/ | Brief suggests 17 Apr 1987 / 7 Nov 2006; registration and pixel scale unknown | Official page request denied by proxy network policy (403). Dates remain brief-supplied leads. No images downloaded or embedded; item credits and reuse terms unchecked. |
| JRC GSW v1.4 Yearly History | https://developers.google.com/earth-engine/datasets/catalog/JRC_GSW1_4_YearlyHistory | Catalogue specification: 1984–2021, 30 m annual classes | Catalogue request denied by proxy (403). No raster exports acquired, no Earth Engine access assumed. Free-use/attribution terms require review; cite Pekel et al., *Nature* (2016), DOI https://doi.org/10.1038/nature20584 when applicable. |
| NASA SRTM | https://www.earthdata.nasa.gov/data/instruments/srtm | 30 m candidate; mission/product-specific vertical datum and dates | No DEM acquired. Verify product terms, acquisition, void treatment, elevation units and vertical reference. |
| Copernicus DEM | https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/COP-DEM | GLO-30 candidate; product-specific | Not downloaded or access-tested. Product license, attribution and redistribution conditions not yet reviewed. |
| AWS Open Data terrain tiles | https://s3.amazonaws.com/elevation-tiles-prod/terrarium/7/104/52.png | Candidate test tile only | Proxy returned 403; no tile acquired. This regional access probe does not validate DEM source lineage or licensing. No AWS tiles are used. |
| MapLibre demonstration terrain | https://raw.githubusercontent.com/maplibre/demotiles/gh-pages/terrain-tiles/tiles.json | Descriptor names `jaxa_terrainrgb_N047E011` | Descriptor retrieved and inspected. Alpine tile-set identity does not establish Three Gorges coverage. Rejected as regional terrain evidence; no tiles used. |

No restricted service was bypassed. A new host allowlist would be needed to retry blocked official sources from this environment. That alone would not supply data authentication, source review or a historical dataset. No network settings were changed for this task.

## Evidence to acquire next

Prioritise at least one modest research area supported by a pair of valid, comparable classifications and dated archive evidence. Obtain shared valid-data coverage, product metadata, rights, acquisition date and processing logs together with the pixels. For settlements, retain the original gazetteer / archival map reference, temporal extent, positional uncertainty, documented impact and media rights. No usable historical settlement dataset has yet been acquired.
