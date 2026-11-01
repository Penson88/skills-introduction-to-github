import { assetUrl } from './assets';
import type { FeatureCollection, Polygon, MultiPolygon, Position } from 'geojson';
import area from '@turf/area';
import difference from '@turf/difference';
import { featureCollection } from '@turf/helpers';
import {seedArchive, type ArchiveRecord } from '../data/catalog';
export interface Observation {
 id:string; year:number; title:string; sourceUrl:string; source:string; license:string;
 dateRange:[string,string]; crs:'OGC:CRS84'; method:string; resolution:number;
 coverageId:string; coverageUrl:string; classification:'annual-seasonal-and-permanent';
 dataUrl:string; geometry?:FeatureCollection<Polygon|MultiPolygon>;
}
export interface Research {version:1;observations:Observation[];archives:ArchiveRecord[];terrain:null|{tiles:string;encoding:'terrarium'|'mapbox';attribution:string;sourceUrl:string;minzoom:number;maxzoom:number;bounds:[number,number,number,number]}}
export const emptyResearch:Research={version:1,observations:[],archives:[],terrain:null};
const link=(s:unknown)=>typeof s==='string'&&/^https:\/\//.test(s);
const local=(s:unknown)=>typeof s==='string'&&/^\/data\/[\w/.-]+\.geojson$/.test(s)&&!s.includes('..');
export function validCoordinate(c:unknown):c is [number,number]{return Array.isArray(c)&&c.length>=2&&Number.isFinite(c[0])&&Number.isFinite(c[1])&&Math.abs(c[0])<=180&&Math.abs(c[1])<=90;}
export function validateWater(fc:unknown):asserts fc is FeatureCollection<Polygon|MultiPolygon>{
 const f=fc as FeatureCollection<Polygon|MultiPolygon>;
 if(f?.type!=='FeatureCollection'||!Array.isArray(f.features))throw Error('Expected a GeoJSON FeatureCollection.');
 for(const feature of f.features){
  const g=feature.geometry;
  if(!g||!['Polygon','MultiPolygon'].includes(g.type))throw Error('Water geometry must be polygonal.');
  const polygons=g.type==='Polygon'?[g.coordinates]:g.coordinates;
  for(const p of polygons) for(const ring of p){
   if(ring.length<4||JSON.stringify(ring[0])!==JSON.stringify(ring.at(-1)))throw Error('Unclosed polygon ring.');
   for(const c of ring)if(!validCoordinate(c)||c[0]<105||c[0]>113||c[1]<28||c[1]>33)throw Error('Geometry outside study region / invalid CRS.');
  }
 }
}
export function validateResearch(value:unknown):Research{
 const r=value as Research;
 if(r?.version!==1||!Array.isArray(r.observations)||!Array.isArray(r.archives))throw Error('Invalid research manifest.');
 const ids=new Set<string>(seedArchive.map(a=>a.id)); const seenYears=new Set<number>();
 for(const o of r.observations){
  if(!o.id||ids.has(o.id)||seenYears.has(o.year)||!Number.isInteger(o.year)||o.year<1984||o.year>2021||!link(o.sourceUrl)||!o.source||!o.license||!o.method||!o.resolution||o.resolution<=0||o.crs!=='OGC:CRS84'||!/^sha256:[a-f0-9]{64}$/.test(o.coverageId)||!local(o.coverageUrl)||!local(o.dataUrl)||o.classification!=='annual-seasonal-and-permanent'||!Array.isArray(o.dateRange)||o.dateRange.length!==2||o.dateRange.some(d=>!/^\d{4}-\d{2}-\d{2}$/.test(d)||!Number.isFinite(Date.parse(d))||new Date(d).toISOString().slice(0,10)!==d)||o.dateRange[0]>o.dateRange[1]||!o.dateRange.every(d=>d.startsWith(String(o.year))))throw Error(`Invalid observation metadata: ${o.id}`);
  ids.add(o.id); seenYears.add(o.year);
 }
 for(const a of r.archives){
  if(!a.id||ids.has(a.id)||!a.title?.en||!a.title?.zh||!a.summary?.en||!a.summary?.zh||!a.notes?.en||!a.notes?.zh||!a.period?.en||!a.period?.zh||!a.impact?.en||!a.impact?.zh||!a.source||!link(a.sourceUrl)||!a.rights||!['geography','settlements','engineering','resettlement','official','ecology'].includes(a.category)||!['source-located','approximate','unlocated'].includes(a.certainty)||!['context','source-lead','documented'].includes(a.evidence)||a.coordinates&&!validCoordinate(a.coordinates)||a.certainty==='unlocated'&&a.coordinates||a.certainty!=='unlocated'&&!a.coordinates||a.coordinates&&a.evidence==='source-lead'||a.category==='settlements'&&a.evidence!=='documented')throw Error(`Invalid archive metadata: ${a.id}`);
  if(a.residence){
   const h=a.residence;
   if(a.evidence!=='documented'||!a.coordinates||!Number.isInteger(h.fromYear)||!Number.isInteger(h.toYear)||h.fromYear>h.toYear||!link(h.sourceUrl)||!h.method||!['town-location','residential-footprint'].includes(h.kind)||h.footprintUrl&&!local(h.footprintUrl)||h.kind==='residential-footprint'&&!h.footprintUrl)throw Error(`Invalid dated residence evidence: ${a.id}`);
  }
  if(a.media?.some(m=>!['image','video','audio'].includes(m.kind)||!link(m.url)||!m.rights||!m.caption?.en||!m.caption?.zh))throw Error(`Invalid archive media: ${a.id}`);
  ids.add(a.id);
 }
 if(r.terrain&&(!r.terrain.tiles||!r.terrain.attribution||!link(r.terrain.sourceUrl)||!['mapbox','terrarium'].includes(r.terrain.encoding)||!Number.isInteger(r.terrain.minzoom)||!Number.isInteger(r.terrain.maxzoom)||r.terrain.minzoom<0||r.terrain.maxzoom<r.terrain.minzoom||!Array.isArray(r.terrain.bounds)||r.terrain.bounds.length!==4||!validCoordinate(r.terrain.bounds.slice(0,2))||!validCoordinate(r.terrain.bounds.slice(2))||r.terrain.bounds[0]>=r.terrain.bounds[2]||r.terrain.bounds[1]>=r.terrain.bounds[3]))throw Error('Invalid terrain metadata.');
 return r;
}
export function comparable(a?:Observation,b?:Observation){return !!(a&&b&&a.year<b.year&&a.coverageId===b.coverageId&&a.classification===b.classification&&a.resolution===b.resolution&&a.geometry&&b.geometry);}
export function changedWater(a:Observation,b:Observation){
 if(!comparable(a,b))throw Error('Comparable observations on a common valid footprint are required.');
 const before=a.geometry!.features,after=b.geometry!.features;
 if(!after.length)return {geometry:featureCollection<Polygon|MultiPolygon>([]),km2:0};
 if(!before.length)return {geometry:b.geometry!,km2:area(b.geometry!)/1e6};
 // Union of each mask is performed by the importer; a single multipart feature is expected.
 if(before.length!==1||after.length!==1)throw Error('Import masks as dissolved multipart polygons.');
 const result=difference(featureCollection([...after,...before]));
 return {geometry:featureCollection(result?[result]:[]),km2:result?area(result)/1e6:0};
}
export async function loadResearch(signal?:AbortSignal):Promise<Research>{
 const response=await fetch(assetUrl('/data/research.json'),{signal});if(!response.ok)throw Error('Research catalogue could not be loaded.');
 const r=validateResearch(await response.json());
 const coverages=new Map<string,Promise<FeatureCollection<Polygon|MultiPolygon>>>();
 function getCoverage(o:Observation){
  if(!coverages.has(o.coverageUrl))coverages.set(o.coverageUrl,(async()=>{
   const res=await fetch(assetUrl(o.coverageUrl),{signal});if(!res.ok)throw Error('Missing valid-data coverage.');
   const bytes=await res.arrayBuffer();const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
   if('sha256:'+hash!==o.coverageId)throw Error('Coverage checksum mismatch.');
   const fc=JSON.parse(new TextDecoder().decode(bytes));validateWater(fc);if(fc.features.length!==1)throw Error('Expected dissolved, nonempty coverage.');return fc;
  })());return coverages.get(o.coverageUrl)!;
 }
 await Promise.all(r.observations.map(async o=>{
  const res=await fetch(assetUrl(o.dataUrl),{signal});if(!res.ok)throw Error(`Missing water file: ${o.id}`);
  const fc=await res.json();validateWater(fc);if(fc.features.length>1)throw Error('Water masks must be dissolved by the importer.');
  const coverage=await getCoverage(o);
  if(fc.features.length){const outside=difference(featureCollection([...fc.features,...coverage.features]));if(outside&&area(outside)>1)throw Error('Water extends outside valid-data coverage.');}
  o.geometry=fc;
 }));
 await Promise.all(r.archives.filter(a=>a.residence?.footprintUrl).map(async a=>{
  const res=await fetch(assetUrl(a.residence!.footprintUrl!),{signal});if(!res.ok)throw Error(`Missing residence footprint: ${a.id}`);
  const fc=await res.json();validateWater(fc);if(!fc.features.length)throw Error(`Empty residence footprint: ${a.id}`);a.residence!.footprint=fc;
 }));return r;
}
export function boundsOfCoordinates(coords:Position[]){return coords.reduce((b,c)=>[Math.min(b[0],c[0]),Math.min(b[1],c[1]),Math.max(b[2],c[0]),Math.max(b[3],c[1])],[180,90,-180,-90]);}
