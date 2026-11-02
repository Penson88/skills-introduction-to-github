"""Extract source waterbody polygons intersecting the local navigation window.
Input: the CC BY 4.0 HydroLAKES v1.0 public archive, downloaded separately.
No buffering, synthetic widening, shoreline reconstruction or year assignment.
"""
import argparse,datetime,hashlib,json,subprocess,tempfile,zipfile,shutil
from pathlib import Path
from shapely.geometry import shape,box
ROOT=Path(__file__).resolve().parents[1]
URL='https://github.com/chartcatalogs/water_bodies/releases/download/2024.4/HydroLAKES_polys_v10_shp.zip'
EXPECTED_ARCHIVE_SHA256='9ef63498569dd7ccd0b8d8852da026e009a75f42d293f00e483f3b9fcfe8e1f9'
BOUNDS=[110.809284,30.665152,111.189284,31.005152]
def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('archive',type=Path);a=p.parse_args()
 with a.archive.open('rb') as f:digest=hashlib.file_digest(f,'sha256').hexdigest()
 if digest!=EXPECTED_ARCHIVE_SHA256:raise ValueError('Archive checksum mismatch; stop and review the source rather than replacing the expected hash.')
 with tempfile.TemporaryDirectory() as t:
  folder=Path(t)
  with zipfile.ZipFile(a.archive) as z:
   for info in z.infolist():
    name=Path(info.filename).name
    if name.startswith('HydroLAKES_polys_v10.') and Path(name).suffix in ['.shp','.shx','.dbf','.prj','.sbn','.sbx']:
     with z.open(info) as src,(folder/name).open('wb') as dst:shutil.copyfileobj(src,dst)
  with (folder/'HydroLAKES_polys_v10.shp').open('rb') as f:shape_digest=hashlib.file_digest(f,'sha256').hexdigest()
  if shape_digest!='bbb5a60b8e3016908991aa0abd76f5553a3d019ae7d2da0866c823f1ddf4dded':raise ValueError('Original shapefile checksum mismatch')
  output=folder/'selected.geojson'
  subprocess.run(['ogr2ogr','-f','GeoJSON',str(output),str(folder/'HydroLAKES_polys_v10.shp'),'-spat',*map(str,BOUNDS),'-t_srs','EPSG:4326','-lco','RFC7946=YES'],check=True)
  data=json.loads(output.read_text());features=[];region=box(*BOUNDS)
  for f in data['features']:
   g=shape(f['geometry'])
   if not g.is_valid or g.is_empty or not g.intersects(region):raise ValueError('Invalid or misplaced water polygon')
   source=f['properties'];properties={k:source.get(k) for k in ['Hylak_id','Lake_name','Lake_type','Grand_id','Poly_src']}
   properties.update(dataset='HydroLAKES v1.0',temporal='undated inventory context; not a yearly observation',license='CC BY 4.0')
   features.append({'type':'Feature','properties':properties,'geometry':f['geometry']})
  if not any(f['properties']['Hylak_id']==1453 and f['properties']['Lake_name']=='Three Gorges Reservoir' for f in features):raise ValueError('Three Gorges reservoir missing')
  out=ROOT/'public/data';fc={'type':'FeatureCollection','features':features}
  (out/'waterbodies.geojson').write_text(json.dumps(fc,ensure_ascii=False,separators=(',',':')))
  metadata={'dataset':'HydroLAKES v1.0','authors':'Messager, Lehner, Grill, Nedeva & Schmitt (2016)','sourceUrl':'https://www.hydrosheds.org/products/hydrolakes','acquired':datetime.date.today().isoformat(),'downloadUrl':URL,'archiveSha256':digest,'sourceShapefileSha256':shape_digest,'crs':'OGC:CRS84 / WGS84 longitude-latitude','license':'CC BY 4.0','licenseUrl':'https://creativecommons.org/licenses/by/4.0/','licenseEvidence':'Bundled HydroLAKES_TechDoc_v10.pdf, section 4.1','reference':'https://doi.org/10.1038/ncomms13603','scale':'Approx. 1:250,000 regionally; mixed source resolution, generalized shorelines','dateRange':'Mixed source dates. No per-feature shoreline observation date established. v1.0 published 2016; mirror release 2024.4 is not an observation date.','processing':'Select entire source polygons intersecting the local navigation window using GDAL; retain original geometry; WGS84 GeoJSON export. No clipping, buffer, manual bank editing or shoreline year assignment.','features':[f['properties'] for f in features],'limitations':'Inventory mapping, not measured current water, historic pre-dam water or a dated operational shoreline. Small islands may be removed by upstream compilation. No area-difference or temporal animation is inferred from this layer.'}
  (out/'waterbodies-provenance.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2));print('Extracted',len(features),'source waterbody polygons; archive SHA256',digest)
if __name__=='__main__':main()
