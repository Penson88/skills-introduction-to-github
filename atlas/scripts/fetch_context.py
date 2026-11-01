"""Reproducible, pinned Natural Earth extraction. No shoreline inference."""
import json, hashlib, urllib.request, datetime
from shapely import make_valid
from shapely.geometry import shape,mapping,MultiPolygon
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
PIN='ca96624a56bd078437bca8184e78163e5039ad19'
BASE=f'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/{PIN}/geojson/'
OUT=ROOT/'public/data'
OUT.mkdir(parents=True, exist_ok=True)
manifest=[]
def load(name):
    url=BASE+name+'.geojson'
    raw=urllib.request.urlopen(url,timeout=90).read()
    manifest.append(dict(dataset=name,url=url,sha256=hashlib.sha256(raw).hexdigest(),acquired=datetime.date.today().isoformat(),crs='OGC:CRS84',license='Public domain'))
    return json.loads(raw)
def save(name,features):
    (OUT/(name+'.geojson')).write_text(json.dumps({'type':'FeatureCollection','features':features},ensure_ascii=False,separators=(',',':')))
# World context is deliberately retained. Administrative boundaries are cartographic, not a political claim.
countries=load('ne_110m_admin_0_countries')
repairs=[]
for f in countries['features']:
    g=shape(f['geometry'])
    if not g.is_valid:
        fixed=make_valid(g)
        if fixed.geom_type=='GeometryCollection':
            parts=[]
            for child in fixed.geoms:
                if child.geom_type=='Polygon':parts.append(child)
                elif child.geom_type=='MultiPolygon':parts.extend(child.geoms)
            fixed=MultiPolygon(parts)
        if not fixed.is_valid:raise ValueError('Context geometry repair failed')
        f['geometry']=mapping(fixed)
        repairs.append(f['properties']['NAME_EN'])
manifest[-1]['processing']='Context-only planar topology repair with Shapely make_valid: '+', '.join(repairs)

save('countries',[dict(type='Feature',geometry=f['geometry'],properties={'name':f['properties']['NAME_EN'],'code':f['properties']['ADM0_A3']}) for f in countries['features']])
rivers=load('ne_10m_rivers_lake_centerlines')
def coords(g):
    if g['type']=='LineString': return g['coordinates']
    return [p for line in g['coordinates'] for p in line]
selected=[]
for f in rivers['features']:
    if any(73<x<136 and 17<y<55 for x,y,*_ in coords(f['geometry'])):
        p=f['properties']
        selected.append(dict(type='Feature',geometry=f['geometry'],properties={'name':p.get('name_en') or p.get('name') or '', 'yangtze':p.get('name_en')=='Yangtze','source':'ne-rivers','scale':'1:10m','temporal':'undated-cartographic-context'}))
save('rivers',selected)
places=load('ne_10m_populated_places_simple')
save('places',[dict(type='Feature',geometry=f['geometry'],properties={'name':f['properties']['name'],'source':'ne-places','ne_id':f['properties']['ne_id']}) for f in places['features'] if f['properties']['name'] in ['Yichang','Chongqing','Fengjie']])
(OUT/'provenance.json').write_text(json.dumps({'version':PIN,'sources':manifest},indent=2))
print(f'Wrote {len(countries["features"])} countries, {len(selected)} context rivers, 3 reference places.')
