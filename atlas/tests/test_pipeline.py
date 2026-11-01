"""Synthetic algorithm fixtures only; temporary files never enter public/data."""
import unittest,tempfile,subprocess,json,hashlib
from pathlib import Path
import numpy as np
import rasterio
from rasterio.transform import from_origin
from shapely.geometry import shape
ROOT=Path(__file__).resolve().parents[1]
class PipelineTests(unittest.TestCase):
 def setUp(self):self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
 def tearDown(self):self.tmp.cleanup()
 def raster(self,name,values,transform=None,crs='EPSG:4326'):
  path=self.root/name
  with rasterio.open(path,'w',driver='GTiff',height=2,width=3,count=1,dtype='uint8',crs=crs,transform=transform or from_origin(110,31,.01,.01),nodata=0) as dst:dst.write(np.array(values,dtype='uint8'),1)
  return path
 def run_import(self,a,b):
  import sys
  return subprocess.run([sys.executable,str(ROOT/'scripts/import_water.py'),'--before',str(a),'--after',str(b),'--before-year','1987','--after-year','2021','--source-url','https://example.org/SYNTHETIC-TEST','--license','Synthetic test only','--acquired','2026-11-01','--resolution','30','--output',str(self.root/'out')],capture_output=True,text=True)
 def test_common_valid_coverage_classes_and_reprojection(self):
  a=self.raster('a.tif',[[0,1,2],[3,1,1]]);b=self.raster('b.tif',[[3,2,3],[3,0,1]])
  r=self.run_import(a,b);self.assertEqual(r.returncode,0,r.stderr)
  out=self.root/'out';manifest=json.loads((out/'research.json').read_text());self.assertEqual(len(manifest['observations']),2)
  ca=(out/'observations').glob('coverage-*.geojson');coverage_bytes=next(ca).read_bytes();self.assertEqual(manifest['observations'][0]['coverageId'],'sha256:'+hashlib.sha256(coverage_bytes).hexdigest())
  coverage=shape(json.loads(coverage_bytes)['features'][0]['geometry']);self.assertAlmostEqual(coverage.area,.0004,places=8)
  before=shape(json.loads((out/'observations/jrc-1987.geojson').read_text())['features'][0]['geometry']);after=shape(json.loads((out/'observations/jrc-2021.geojson').read_text())['features'][0]['geometry']);self.assertAlmostEqual(after.difference(before).area,.0001,places=8);self.assertTrue(coverage.covers(after))
  self.assertEqual(self.run_import(a,b).returncode,0);self.assertEqual(len(json.loads((out/'research.json').read_text())['observations']),2)
 def test_rejects_mismatched_grid(self):
  a=self.raster('a.tif',[[1,1,1],[1,2,1]]);b=self.raster('b.tif',[[1,1,1],[1,2,1]],from_origin(110.1,31,.01,.01));r=self.run_import(a,b);self.assertNotEqual(r.returncode,0);self.assertIn('Grid/CRS mismatch',r.stderr)
 def test_rejects_unknown_class(self):
  a=self.raster('a.tif',[[1,5,1],[1,2,1]]);b=self.raster('b.tif',[[1,1,1],[1,2,1]]);r=self.run_import(a,b);self.assertNotEqual(r.returncode,0);self.assertIn('Unexpected classification',r.stderr)
 def test_rejects_no_common_observations(self):
  a=self.raster('a.tif',[[0,0,0],[0,0,0]]);b=self.raster('b.tif',[[1,1,1],[1,2,1]]);r=self.run_import(a,b);self.assertNotEqual(r.returncode,0);self.assertIn('No common valid',r.stderr)

 def test_projected_rasters_are_transformed_to_lon_lat(self):
  from rasterio.warp import transform_bounds
  from rasterio.transform import from_bounds
  tr=from_bounds(*transform_bounds('EPSG:4326','EPSG:3857',110,30.98,110.03,31),3,2)
  a=self.raster('a.tif',[[1,1,2],[1,1,1]],tr,'EPSG:3857');b=self.raster('b.tif',[[1,2,2],[1,1,1]],tr,'EPSG:3857')
  result=self.run_import(a,b);self.assertEqual(result.returncode,0,result.stderr)
  fc=json.loads((self.root/'out/observations/jrc-2021.geojson').read_text());g=shape(fc['features'][0]['geometry']);self.assertAlmostEqual(g.bounds[2],110.03,places=6);self.assertAlmostEqual(g.bounds[3],31,places=6)
 def test_dem_tiles_preserve_elevation_and_record_metadata(self):
  import sys
  from PIL import Image
  path=self.root/'dem.tif';out=self.root/'public';(out/'data').mkdir(parents=True);(out/'data/research.json').write_text('{"version":1,"observations":[],"archives":[],"terrain":null}')
  with rasterio.open(path,'w',driver='GTiff',height=120,width=160,count=1,dtype='float32',crs='EPSG:4326',transform=from_origin(105,34,.05,.05),nodata=-9999) as dst:dst.write(np.full((120,160),200,dtype='float32'),1)
  cmd=[sys.executable,str(ROOT/'scripts/import_dem.py'),str(path),'--source-url','https://example.org/SYNTHETIC-DEM','--license','Synthetic test only','--attribution','Test','--acquired','2026-11-01','--units','metres','--vertical-datum','Synthetic test','--bounds','110.1','30.1','110.2','30.2','--minzoom','7','--maxzoom','7','--output',str(out)]
  result=subprocess.run(cmd,capture_output=True,text=True);self.assertEqual(result.returncode,0,result.stderr)
  pixels=np.array(Image.open(next((out/'terrain').rglob('*.png'))));rgb=pixels[128,128].astype(float);height=rgb[0]*256+rgb[1]+rgb[2]/256-32768;self.assertAlmostEqual(height,200,places=1)
  self.assertEqual(json.loads((out/'data/research.json').read_text())['terrain']['bounds'],[110.1,30.1,110.2,30.2])
 def test_dem_voids_do_not_become_zero_height(self):
  import sys
  path=self.root/'empty-dem.tif'
  with rasterio.open(path,'w',driver='GTiff',height=10,width=10,count=1,dtype='float32',crs='EPSG:4326',transform=from_origin(105,34,.7,.7),nodata=-9999) as dst:dst.write(np.full((10,10),-9999,dtype='float32'),1)
  cmd=[sys.executable,str(ROOT/'scripts/import_dem.py'),str(path),'--source-url','https://example.org/SYNTHETIC-DEM','--license','Synthetic test only','--attribution','Test','--acquired','2026-11-01','--units','metres','--vertical-datum','Synthetic test','--bounds','110.1','30.1','110.2','30.2','--minzoom','7','--maxzoom','7','--output',str(self.root/'void-out')]
  result=subprocess.run(cmd,capture_output=True,text=True);self.assertNotEqual(result.returncode,0);self.assertIn('Incomplete elevation coverage',result.stderr)

if __name__=='__main__':unittest.main()
