"""Acquire one attributable WRI locator; not a surveyed dam footprint."""
import csv,datetime,hashlib,io,json,urllib.request
from pathlib import Path
PIN='7a91cfbb2a4e272597acbc00506d61fc1ec73b3d'
URL=f'https://raw.githubusercontent.com/wri/global-power-plant-database/{PIN}/output_database/global_power_plant_database.csv'
raw=urllib.request.urlopen(URL,timeout=60).read()
rows=[r for r in csv.DictReader(io.StringIO(raw.decode())) if r['gppd_idnr']=='WRI1000452']
if len(rows)!=1 or rows[0]['name']!='Three Gorges Dam':raise ValueError('Unexpected WRI record')
r=rows[0];feature={'type':'Feature','properties':{'id':r['gppd_idnr'],'name':r['name'],'source':'World Resources Institute / Global Power Plant Database','upstreamSource':r['source'],'sourceUrl':URL,'license':'CC BY 4.0','limitations':'Inventory point; positional accuracy and geolocation source unspecified. Not a surveyed footprint.'},'geometry':{'type':'Point','coordinates':[float(r['longitude']),float(r['latitude'])]}}
out=Path(__file__).resolve().parents[1]/'public/data';(out/'dam.geojson').write_text(json.dumps({'type':'FeatureCollection','features':[feature]},indent=2))
(out/'dam-provenance.json').write_text(json.dumps({'acquired':datetime.date.today().isoformat(),'sourceUrl':URL,'sourceSha256':hashlib.sha256(raw).hexdigest(),'pin':PIN,'crs':'OGC:CRS84','processing':'Select WRI1000452; preserve source point; strip unrelated attributes; no geometry inference.','license':'CC BY 4.0','licenseEvidence':f'https://github.com/wri/global-power-plant-database/blob/{PIN}/README.md'},indent=2))
print('Acquired source-located WRI dam inventory point:',feature['geometry']['coordinates'])
