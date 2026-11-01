import { assetUrl } from '../lib/assets';
import { useEffect, useRef, useState } from 'react';
import maplibregl, { type Map as GLMap, type StyleSpecification, type GeoJSONSource } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import type { ArchiveRecord, Lang, LayerId } from '../data/catalog';
import type { Observation, Research } from '../lib/research';
export interface CameraTarget {center:[number,number];zoom:number;seq:number}
interface Props {lang:Lang; records:ArchiveRecord[]; layers:Record<LayerId,boolean>;labels:boolean;terrain:boolean;research:Research;before?:Observation;after?:Observation;opacity:number;compare:boolean;divider:number;target:CameraTarget;onSelect:(a:ArchiveRecord)=>void;onCamera:(z:number)=>void;onReady:()=>void;onError:(s:string)=>void}
const empty:FeatureCollection={type:'FeatureCollection',features:[]};
function style(research:Research):StyleSpecification{
 return {version:8,sources:{countries:{type:'geojson',data:assetUrl('/data/countries.geojson')},rivers:{type:'geojson',data:assetUrl('/data/rivers.geojson')},window:{type:'geojson',data:{type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[[106.2,29.2],[111.6,29.2],[111.6,31.5],[106.2,31.5],[106.2,29.2]]]}}},before:{type:'geojson',data:empty},after:{type:'geojson',data:empty},...research.terrain?{elevation:{type:'raster-dem' as const,tiles:[assetUrl(research.terrain.tiles)],tileSize:256,encoding:research.terrain.encoding,minzoom:research.terrain.minzoom,maxzoom:research.terrain.maxzoom,attribution:research.terrain.attribution,bounds:research.terrain.bounds}}:{}},layers:[
 {id:'paper',type:'background',paint:{'background-color':'#91aaa5'}},
 {id:'land',type:'fill',source:'countries',paint:{'fill-color':'#eee7d5','fill-opacity':1}},
 {id:'china',type:'fill',source:'countries',filter:['==',['get','code'],'CHN'],paint:{'fill-color':'#e9e3d1'}},
 ...research.terrain?[{id:'hillshade',type:'hillshade' as const,source:'elevation',paint:{'hillshade-shadow-color':'#466660','hillshade-highlight-color':'#f5edda','hillshade-exaggeration':0.45}}]:[],
 {id:'borders',type:'line',source:'countries',paint:{'line-color':'#a6b4a0','line-width':0.65,'line-opacity':0.6}},
 {id:'tributaries',type:'line',source:'rivers',filter:['!=',['get','yangtze'],true],paint:{'line-color':'#8fa9a3','line-width':['interpolate',['linear'],['zoom'],3,0.4,9,1.3],'line-opacity':0.6}},
 {id:'yangtze-glow',type:'line',source:'rivers',filter:['==',['get','yangtze'],true],paint:{'line-color':'#f4edda','line-width':5,'line-opacity':0.65}},
 {id:'yangtze',type:'line',source:'rivers',filter:['==',['get','yangtze'],true],paint:{'line-color':'#567d78','line-width':['interpolate',['linear'],['zoom'],3,1.6,8,2.5]}},
 {id:'study-window',type:'line',source:'window',maxzoom:6,paint:{'line-color':'#ad795e','line-width':1,'line-dasharray':[4,4],'line-opacity':0.6}},
 {id:'before-fill',type:'fill',source:'before',paint:{'fill-color':'#ca9d7d','fill-opacity':0.65}},
 {id:'before-line',type:'line',source:'before',paint:{'line-color':'#a36f53','line-width':1}},
 {id:'after-fill',type:'fill',source:'after',paint:{'fill-color':'#8eaaa4','fill-opacity':0.65}},
 {id:'after-line',type:'line',source:'after',paint:{'line-color':'#5c817c','line-width':1}}
 ]};
}
export default function MapView(p:Props){
 const container=useRef<HTMLDivElement>(null),secondary=useRef<HTMLDivElement>(null),map=useRef<GLMap|null>(null),comparison=useRef<GLMap|null>(null);
 const latest=useRef(p);latest.current=p;
 const [ready,setReady]=useState(false);
 const [failed,setFailed]=useState(false);
 useEffect(()=>{
  if(!container.current)return;
  let m:GLMap;
  try {m=new maplibregl.Map({container:container.current,style:style(p.research),center:[107,33],zoom:3.5,minZoom:2,maxZoom:13,attributionControl:{compact:true,customAttribution:'Natural Earth · Public domain | Context linework, not dated shorelines'},renderWorldCopies:false});} catch {setFailed(true);p.onError('WebGL could not start. Try a browser with hardware acceleration.');return;}
  map.current=m;
  m.addControl(new maplibregl.NavigationControl({showCompass:true,visualizePitch:false}),'bottom-right');
  m.addControl(new maplibregl.ScaleControl({unit:'metric'}),'bottom-left');
  m.on('load',()=>{setReady(true);latest.current.onReady();});
  m.on('move',()=>{latest.current.onCamera(m.getZoom());const c=comparison.current;if(c)c.jumpTo({center:m.getCenter(),zoom:m.getZoom(),bearing:m.getBearing(),pitch:m.getPitch()});});
  m.on('error',e=>{latest.current.onError(e.error?.message||'A geographic source could not be loaded.');});
  const ro=new ResizeObserver(()=>{m.resize();comparison.current?.resize();});ro.observe(container.current);
  return()=>{ro.disconnect();setReady(false);map.current=null;m.remove();};
 // The catalogue is loaded before this component is mounted.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[p.research]);
 useEffect(()=>{const m=map.current;if(!ready||!m)return;const duration=p.target.seq===0||window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:1800;if(p.target.zoom<5)m.fitBounds([[73,18],[135,54]],{padding:35,duration});else m.flyTo({center:p.target.center,zoom:p.target.zoom,duration,essential:false});},[p.target,ready]);
 useEffect(()=>{
  const m=map.current;if(!m||!ready)return;
  const markers:maplibregl.Marker[]=[];const cityElements:HTMLElement[]=[];
  if(p.labels)for(const a of p.records){
   if(!a.coordinates||a.evidence==='source-lead'||a.category==='settlements'&&!p.layers.settlements)continue;
   const el=document.createElement('button');el.className=`place-marker ${a.certainty==='approximate'?'approximate':''}`;el.title=a.title[p.lang];el.setAttribute('aria-label',a.title[p.lang]);el.textContent=a.title[p.lang].split(' · ')[0];el.onclick=()=>latest.current.onSelect(a);
   cityElements.push(el);markers.push(new maplibregl.Marker({element:el,anchor:'left',offset:[8,0]}).setLngLat(a.coordinates).addTo(m));
  }
  // A rounded locator is not a surveyed dam footprint or archival settlement.
  const el=document.createElement('button');el.className='dam-marker';el.setAttribute('aria-label',p.lang==='en'?'Three Gorges Dam vicinity, approximate':'三峡大坝附近，位置近似');el.innerHTML='<span>＋</span><small>'+ (p.lang==='en'?'THREE GORGES DAM<br/>APPROXIMATE VICINITY':'三峡大坝<br/>近似区域定位')+'</small>';el.onclick=()=>latest.current.onError(p.lang==='en'?'Dam locator: approximately 111° E, 30.8° N. Editorial orientation only; source verification pending. Not a surveyed footprint.':'大坝定位：约东经111°、北纬30.8°。仅作区域导航，来源核验待完成，不是测量边界。');
  markers.push(new maplibregl.Marker({element:el}).setLngLat([111,30.8]).addTo(m));
  const showCities=()=>cityElements.forEach(el=>{el.style.display=m.getZoom()<5?'none':'';});showCities();m.on('zoom',showCities);
  return()=>{m.off('zoom',showCities);markers.forEach(x=>x.remove());};
 },[p.records,p.lang,p.labels,p.layers.settlements,ready]);
 useEffect(()=>{
  const m=map.current;if(!ready||!m)return;
  function apply(m:GLMap,side:'main'|'comparison'){
   if(!m.isStyleLoaded())return;
   (m.getSource('before') as GeoJSONSource)?.setData(p.before?.geometry||empty);
   (m.getSource('after') as GeoJSONSource)?.setData(p.after?.geometry||empty);
   const beforeVisible=p.layers.before&&(!p.compare||side==='main');
   const afterVisible=p.layers.after&&(!p.compare||side==='comparison');
   for(const id of ['before-fill','before-line'])m.setLayoutProperty(id,'visibility',beforeVisible?'visible':'none');
   for(const id of ['after-fill','after-line'])m.setLayoutProperty(id,'visibility',afterVisible?'visible':'none');
   for(const id of ['before-fill','after-fill'])m.setPaintProperty(id,'fill-opacity',p.opacity);
   if(m.getLayer('hillshade'))m.setLayoutProperty('hillshade','visibility',p.terrain?'visible':'none');
  }
  apply(m,'main');if(comparison.current)apply(comparison.current,'comparison');
 },[p.before,p.after,p.layers,p.opacity,p.compare,p.terrain,ready]);
 useEffect(()=>{
  if(!p.compare||!secondary.current||!map.current||!ready)return;
  const main=map.current;
  const c=new maplibregl.Map({container:secondary.current,style:style(p.research),center:main.getCenter(),zoom:main.getZoom(),bearing:main.getBearing(),pitch:main.getPitch(),interactive:false,attributionControl:false,renderWorldCopies:false});comparison.current=c;
  c.on('load',()=>{
   const v=latest.current;(c.getSource('after') as GeoJSONSource).setData(v.after?.geometry||empty);
   for(const id of ['before-fill','before-line'])c.setLayoutProperty(id,'visibility','none');
   c.setPaintProperty('after-fill','fill-opacity',v.opacity);
   if(c.getLayer('hillshade'))c.setLayoutProperty('hillshade','visibility',v.terrain?'visible':'none');
  });c.on('error',e=>latest.current.onError(e.error.message));
  return()=>{comparison.current=null;c.remove();};
 },[p.compare,p.research,ready]);
 return <><div ref={container} className="map-canvas" data-testid="geographic-map"/>{p.compare&&<div ref={secondary} className="comparison-map" style={{clipPath:`inset(0 0 0 ${p.divider}%)`}}/>}{!ready&&!failed&&<div className="map-loading" role="status">{p.lang==='en'?'Loading geographic context…':'正在载入地理数据…'}</div>}{failed&&<div className="map-loading">{p.lang==='en'?'Map unavailable · WebGL required. Sources and archive remain accessible.':'地图不可用 · 需要 WebGL。仍可查看来源与档案。'}</div>}</>;
}
