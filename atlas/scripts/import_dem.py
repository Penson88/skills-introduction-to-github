"""Build local Terrarium DEM tiles from a licensed, georeferenced regional GeoTIFF.
No inundation modelling. Source URL, acquisition date and license are mandatory.
Does not download DEMs or infer licensing. Preserve original DEM metadata separately.
"""
import argparse,datetime,json,math
from pathlib import Path
import numpy as np
import rasterio
from rasterio.warp import reproject,Resampling,transform_bounds
from rasterio.transform import from_bounds
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
R=20037508.342789244
def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('raster',type=Path);p.add_argument('--source-url',required=True);p.add_argument('--license',required=True);p.add_argument('--attribution',required=True);p.add_argument('--units',choices=['metres'],required=True);p.add_argument('--vertical-datum',required=True);p.add_argument('--acquired',required=True);p.add_argument('--minzoom',type=int,default=7);p.add_argument('--bounds',nargs=4,type=float,required=True,metavar=('WEST','SOUTH','EAST','NORTH'));p.add_argument('--maxzoom',type=int,default=9);p.add_argument('--output',type=Path,default=ROOT/'public');a=p.parse_args()
 if not a.source_url.startswith('https://') or not 5<=a.minzoom<=a.maxzoom<=11:raise ValueError('Source must be HTTPS; maxzoom must be 5..11.')
 datetime.date.fromisoformat(a.acquired)
 count=0
 with rasterio.open(a.raster) as src:
  if not src.crs:raise ValueError('DEM CRS missing.')
  if src.nodata is None:raise ValueError('DEM must declare no-data explicitly; set from product metadata before import.')
  # DEM must use metre elevations. The importer does not infer vertical datum or units.
  x0,y0,x1,y1=transform_bounds(src.crs,'EPSG:4326',*src.bounds)
  if not (104<=x0<x1<=114 and 27<=y0<y1<=34):raise ValueError('Provide a regional DEM crop, not a global raster.')
  if not (x0<=a.bounds[0]<a.bounds[2]<=x1 and y0<=a.bounds[1]<a.bounds[3]<=y1):raise ValueError('Requested bounds must be within the DEM.')
  west,south,east,north=transform_bounds('EPSG:4326','EPSG:3857',*a.bounds)
  for z in range(a.minzoom,a.maxzoom+1):
   n=2**z;span=2*R/n
   for x in range(max(0,int((west+R)/span)),min(n-1,int((east+R)/span))+1):
    for y in range(max(0,int((R-north)/span)),min(n-1,int((R-south)/span))+1):
     dem=np.full((256,256),np.nan,dtype='float32')
     dst=from_bounds(x*span-R,R-(y+1)*span,(x+1)*span-R,R-y*span,256,256)
     reproject(rasterio.band(src,1),dem,src_transform=src.transform,src_crs=src.crs,src_nodata=src.nodata,dst_transform=dst,dst_crs='EPSG:3857',dst_nodata=np.nan,resampling=Resampling.bilinear)
     valid=np.isfinite(dem)
     if not valid.all():raise ValueError('Incomplete elevation coverage in requested tile. Supply a larger, void-free DEM or narrower bounds; never substitute zero elevation.')
     # Transparent no-data preserves unknown terrain; never fill missing elevations.
     encoded=np.clip((np.where(valid,dem,0)+32768)*256,0,16777215).astype('uint32')
     rgba=np.stack([(encoded>>16)&255,(encoded>>8)&255,encoded&255,np.where(valid,255,0)],axis=-1).astype('uint8')
     f=a.output/'terrain'/str(z)/str(x)/f'{y}.png';f.parent.mkdir(parents=True,exist_ok=True);Image.fromarray(rgba).save(f);count+=1
  metadata={'sourceUrl':a.source_url,'license':a.license,'attribution':a.attribution,'acquired':a.acquired,'crs':str(src.crs),'inputBounds':list(src.bounds),'verticalDatum':a.vertical_datum,'units':a.units,'processing':'Bilinear reprojection to Web Mercator Terrarium tiles; transparent no-data; no vertical conversion','minzoom':a.minzoom,'maxzoom':a.maxzoom}
 (a.output/'terrain'/'provenance.json').write_text(json.dumps(metadata,indent=2))
 # Explicitly update manifest only after all tiles exist.
 manifest=a.output/'data'/'research.json';r=json.loads(manifest.read_text());r['terrain']={'tiles':'/terrain/{z}/{x}/{y}.png','encoding':'terrarium','attribution':a.attribution,'sourceUrl':a.source_url,'minzoom':a.minzoom,'maxzoom':a.maxzoom,'bounds':a.bounds};manifest.write_text(json.dumps(r,indent=2));print('Built',count,'regional DEM tiles. Inspect hillshade, voids and vertical metadata before publication.')
if __name__=='__main__':main()
