"""Independent topology/coverage audit of shipped or imported GeoJSON."""
import hashlib,json
from pathlib import Path
from shapely.geometry import shape
ROOT=Path(__file__).resolve().parents[1]/'public'
r=json.loads((ROOT/'data/research.json').read_text())
for name in ['countries','rivers','places','dam','waterbodies']:
 fc=json.loads((ROOT/f'data/{name}.geojson').read_text())
 for f in fc['features']:
  g=shape(f['geometry'])
  if g.is_empty or not g.is_valid:raise ValueError(f'Invalid {name} geometry: {f.get("properties")}')
 print(name,': all source geometries valid')
for o in r['observations']:
 water=json.loads((ROOT/o['dataUrl'].lstrip('/')).read_text());cb=(ROOT/o['coverageUrl'].lstrip('/')).read_bytes()
 if o['coverageId']!='sha256:'+hashlib.sha256(cb).hexdigest():raise ValueError('Coverage checksum mismatch')
 coverage=shape(json.loads(cb)['features'][0]['geometry'])
 if not coverage.is_valid:raise ValueError('Invalid coverage polygon')
 for f in water['features']:
  g=shape(f['geometry'])
  if not g.is_valid:raise ValueError(f'Invalid water topology: {o["id"]}')
  if not coverage.covers(g):raise ValueError(f'Water outside valid coverage: {o["id"]}')
 print(o['id'],': valid polygons within common observation coverage')
print('GIS audit complete. Valid topology does not establish historical truth or observational accuracy.')

for a in r['archives']:
 if a.get('residence',{}).get('footprintUrl'):
  for f in json.loads((ROOT/a['residence']['footprintUrl'].lstrip('/')).read_text())['features']:
   g=shape(f['geometry'])
   if g.is_empty or not g.is_valid:raise ValueError('Invalid residential footprint: '+a['id'])
