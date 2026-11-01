"""Import a comparable pair of JRC Yearly History rasters. No downloading/authentication.
Input rasters must be regional crops on an identical grid with JRC classes 0..3.
Class 0 = no data; 1 = not water; 2 = seasonal; 3 = permanent.
"""
import argparse,datetime,hashlib,json
from pathlib import Path
import numpy as np
import rasterio
from rasterio.features import shapes
from rasterio.warp import transform_geom
from shapely.geometry import shape,mapping
from shapely.ops import unary_union
ROOT=Path(__file__).resolve().parents[1]
def polygonize(mask,transform,crs):
    pieces=[]
    for geom,value in shapes(mask.astype('uint8'),mask=mask,transform=transform):
        if value:
            g=shape(transform_geom(crs,'EPSG:4326',geom,precision=8))
            if not g.is_valid: raise ValueError('Invalid polygon after reprojection; inspect source, do not silently repair.')
            pieces.append(g)
    if not pieces:return {'type':'FeatureCollection','features':[]}
    merged=unary_union(pieces)
    if not merged.is_valid or merged.geom_type not in ['Polygon','MultiPolygon']:raise ValueError('Invalid union.')
    x0,y0,x1,y1=merged.bounds
    if not (105<=x0<x1<=113 and 28<=y0<y1<=33):raise ValueError('Crop rasters to Three Gorges study region (105..113 E, 28..33 N).')
    return {'type':'FeatureCollection','features':[{'type':'Feature','properties':{},'geometry':mapping(merged)}]}
def encode(obj):return json.dumps(obj,ensure_ascii=False,separators=(',',':')).encode()
def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--before',required=True,type=Path);p.add_argument('--after',required=True,type=Path)
    p.add_argument('--before-year',required=True,type=int);p.add_argument('--after-year',required=True,type=int)
    p.add_argument('--source-url',required=True);p.add_argument('--license',required=True);p.add_argument('--acquired',required=True,help='Actual source-file acquisition date YYYY-MM-DD')
    p.add_argument('--resolution',required=True,type=float,help='Documented native pixel resolution, metres')
    p.add_argument('--output',type=Path,default=ROOT/'public/data')
    args=p.parse_args()
    datetime.date.fromisoformat(args.acquired)
    if not 1984<=args.before_year<args.after_year<=2021:raise ValueError('Expected two ordered JRC v1.4 years within 1984–2021.')
    if not args.source_url.startswith('https://') or args.resolution<=0:raise ValueError('Provide HTTPS provenance and native resolution.')
    with rasterio.open(args.before) as a,rasterio.open(args.after) as b:
        if not a.crs or a.crs!=b.crs or a.transform!=b.transform or a.shape!=b.shape:raise ValueError('Grid/CRS mismatch. Export both observations on exactly the same grid; no automatic resampling.')
        if a.width*a.height>20_000_000:raise ValueError('Crop the rasters first; maximum 20 million pixels.')
        aa=a.read(1,masked=True);bb=b.read(1,masked=True)
        for arr in [aa,bb]:
            if not np.isin(arr.compressed(),[0,1,2,3]).all():raise ValueError('Unexpected classification. Only JRC annual classes 0,1,2,3 are supported.')
        valid=(~np.ma.getmaskarray(aa))&(~np.ma.getmaskarray(bb))&(aa.filled(0)>0)&(bb.filled(0)>0)
        if not valid.any():raise ValueError('No common valid observation coverage.')
        coverage=polygonize(valid,a.transform,a.crs)
        outputs=[]
        for year,raster,path in [(args.before_year,aa,args.before),(args.after_year,bb,args.after)]:
            water=polygonize(valid&np.isin(raster.filled(0),[2,3]),a.transform,a.crs)
            outputs.append((year,water,hashlib.sha256(path.read_bytes()).hexdigest()))
    out=args.output;folder=out/'observations';folder.mkdir(parents=True,exist_ok=True)
    coverage_bytes=encode(coverage);checksum=hashlib.sha256(coverage_bytes).hexdigest()
    coverage_name=f'coverage-{checksum}.geojson'
    (folder/coverage_name).write_bytes(coverage_bytes)
    manifest_path=out/'research.json'
    manifest=json.loads(manifest_path.read_text()) if manifest_path.exists() else {'version':1,'observations':[],'archives':[],'terrain':None}
    for year,water,input_hash in outputs:
        name=f'jrc-{year}.geojson'
        (folder/name).write_bytes(encode(water))
        record=dict(id=f'jrc-{year}',year=year,title=f'JRC annual water {year}',source='JRC Global Surface Water v1.4 — Yearly History',sourceUrl=args.source_url,license=args.license,dateRange=[f'{year}-01-01',f'{year}-12-31'],crs='OGC:CRS84',method='Classes 2 + 3; class 0 excluded; common valid-data footprint; no simplification; nearest grid unchanged; WGS84 reprojection',resolution=args.resolution,coverageId='sha256:'+checksum,coverageUrl='/data/observations/'+coverage_name,classification='annual-seasonal-and-permanent',dataUrl='/data/observations/'+name,inputSha256=input_hash,acquired=args.acquired,imported=datetime.date.today().isoformat())
        manifest['observations']=[o for o in manifest['observations'] if o['year']!=year]+[record]
    manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
    print('Imported years:',args.before_year,args.after_year,'| shared valid pixels:',int(valid.sum()),'| coverage SHA256:',checksum)
if __name__=='__main__':main()
