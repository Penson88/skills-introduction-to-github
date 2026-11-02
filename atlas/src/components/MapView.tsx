import {damCoordinates, residenceAt, localNavigationBounds} from '../lib/temporal';
import { assetUrl } from '../lib/assets';
import { useEffect, useRef, useState } from 'react';
import maplibregl, { type Map as GLMap, type StyleSpecification, type GeoJSONSource } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import type { ArchiveRecord, Lang, LayerId } from '../data/catalog';
import type { Observation, Research } from '../lib/research';
export interface CameraTarget {center:[number,number];zoom:number;bounds?:[[number,number],[number,number]];seq:number}
interface Props {focus:LayerId;activeYear:number;contextPlaces:boolean;change?:FeatureCollection;lang:Lang; records:ArchiveRecord[]; layers:Record<LayerId,boolean>;labels:boolean;terrain:boolean;research:Research;before?:Observation;after?:Observation;opacity:number;compare:boolean;divider:number;target:CameraTarget;onSelect:(a:ArchiveRecord)=>void;onCamera:(z:number)=>void;onReady:()=>void;onError:(s:string)=>void}
const empty:FeatureCollection={type:'FeatureCollection',features:[]};
function style(research:Research):StyleSpecification{
 return {version:8,sources:{countries:{type:'geojson',data:assetUrl('/data/countries.geojson')},rivers:{type:'geojson',data:assetUrl('/data/rivers.geojson')},before:{type:'geojson',data:empty},after:{type:'geojson',data:empty},change:{type:'geojson',data:empty},residences:{type:'geojson',data:empty},...research.terrain?{elevation:{type:'raster-dem' as const,tiles:[assetUrl(research.terrain.tiles)],tileSize:256,encoding:research.terrain.encoding,minzoom:research.terrain.minzoom,maxzoom:research.terrain.maxzoom,attribution:research.terrain.attribution,bounds:research.terrain.bounds}}:{}},layers:[
 {id:'paper',type:'background',paint:{'background-color':'#91aaa5'}},
 {id:'land',type:'fill',source:'countries',paint:{'fill-color':'#eee7d5','fill-opacity':1}},
 {id:'china',type:'fill',source:'countries',filter:['==',['get','code'],'CHN'],paint:{'fill-color':'#e9e3d1'}},
 ...research.terrain?[{id:'hillshade',type:'hillshade' as const,source:'elevation',paint:{'hillshade-shadow-color':'#466660','hillshade-highlight-color':'#f5edda','hillshade-exaggeration':0.45}}]:[],
 {id:'borders',type:'line',source:'countries',paint:{'line-color':'#a6b4a0','line-width':0.65,'line-opacity':0.6}},
 {id:'tributaries',type:'line',source:'rivers',filter:['!=',['get','yangtze'],true],paint:{'line-color':'#8fa9a3','line-width':['interpolate',['linear'],['zoom'],3,0.4,9,1.3],'line-opacity':0.6}},
 {id:'yangtze-glow',type:'line',source:'rivers',filter:['==',['get','yangtze'],true],paint:{'line-color':'#f4edda','line-width':5,'line-opacity':0.65}},
 {id:'yangtze',type:'line',source:'rivers',filter:['==',['get','yangtze'],true],paint:{'line-color':'#567d78','line-width':['interpolate',['linear'],['zoom'],3,1.6,8,2.5]}},
 {id:'before-fill',type:'fill',source:'before',paint:{'fill-color':'#ca9d7d','fill-opacity':0.65}},
 {id:'before-line',type:'line',source:'before',paint:{'line-color':'#a36f53','line-width':1}},
 {id:'after-fill',type:'fill',source:'after',paint:{'fill-color':'#8eaaa4','fill-opacity':0.65}},
 {id:'after-line',type:'line',source:'after',paint:{'line-color':'#5c817c','line-width':1}},
 {id:'change-fill',type:'fill',source:'change',paint:{'fill-color':'#a36f53','fill-opacity':0.5}},
 {id:'residence-fill',type:'fill',source:'residences',paint:{'fill-color':'#294d47','fill-opacity':0.3}},
 {id:'residence-outline',type:'line',source:'residences',filter:['!=',['get','certainty'],'approximate'],paint:{'line-color':'#203e3c','line-width':1.2}},
 {id:'residence-approximate',type:'line',source:'residences',filter:['==',['get','certainty'],'approximate'],paint:{'line-color':'#203e3c','line-width':1.2,'line-dasharray':[3,3]}}

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
  try {m=new maplibregl.Map({container:container.current,style:style(p.research),center:p.target.center,zoom:p.target.zoom,minZoom:10.8,maxZoom:13,maxBounds:localNavigationBounds,attributionControl:{compact:true,customAttribution:'Natural Earth · Public domain | Dam: WRI · CC BY 4.0 | Context, not dated shorelines'},renderWorldCopies:false});} catch {setFailed(true);p.onError('WebGL could not start. Try a browser with hardware acceleration.');return;}
  map.current=m;
  m.addControl(new maplibregl.NavigationControl({showCompass:true,visualizePitch:false}),'bottom-right');
  m.addControl(new maplibregl.ScaleControl({unit:'metric'}),'bottom-left');
  m.on('load',()=>{setReady(true);latest.current.onReady();
   m.on('click','residence-fill',e=>{const id=e.features?.[0]?.properties?.archiveId;const record=latest.current.records.find(a=>a.id===id);if(record)latest.current.onSelect(record);});
   m.on('mouseenter','residence-fill',()=>{m.getCanvas().style.cursor='pointer';});m.on('mouseleave','residence-fill',()=>{m.getCanvas().style.cursor='';});
  });
  m.on('move',()=>{latest.current.onCamera(m.getZoom());const c=comparison.current;if(c)c.jumpTo({center:m.getCenter(),zoom:m.getZoom(),bearing:m.getBearing(),pitch:m.getPitch()});});
  m.on('error',e=>{latest.current.onError(e.error?.message||'A geographic source could not be loaded.');});
  const ro=new ResizeObserver(()=>{m.resize();comparison.current?.resize();});ro.observe(container.current);
  return()=>{ro.disconnect();setReady(false);map.current=null;m.remove();};
 // The catalogue is loaded before this component is mounted.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[p.research]);
 useEffect(()=>{const m=map.current;if(!ready||!m)return;const duration=p.target.seq===0||window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:1800;if(p.target.bounds)m.fitBounds(p.target.bounds,{padding:35,duration});else m.flyTo({center:p.target.center,zoom:Math.max(10.8,p.target.zoom),duration,essential:false});},[p.target,ready]);
 useEffect(()=>{
  const m=map.current;if(!m||!ready)return;
  const markers:maplibregl.Marker[]=[];const cityElements:HTMLElement[]=[];
  if(p.labels)for(const a of p.records){
   if(!a.coordinates||a.id==='DAM-001'||a.evidence==='source-lead')continue;
   const residence=residenceAt(a,p.activeYear)&&p.layers[p.focus];
   if(!residence&&!(p.contextPlaces&&a.evidence==='context'&&!a.residence))continue;
   const el=document.createElement('button');el.className=`place-marker ${a.certainty==='approximate'?'approximate':''}`;el.title=a.title[p.lang]+(a.residence?` · ${a.residence.fromYear}–${a.residence.toYear}`:' · '+(p.lang==='en'?'undated context':'未标注年代的参照'));if(a.residence)el.classList.add('residence-marker');el.setAttribute('aria-label',a.title[p.lang]);el.textContent=a.title[p.lang].split(' · ')[0];el.onclick=()=>latest.current.onSelect(a);
   cityElements.push(el);markers.push(new maplibregl.Marker({element:el,anchor:'left',offset:[8,0]}).setLngLat(a.coordinates).addTo(m));
  }
  const dam=p.records.find(a=>a.id==='DAM-001');
  const el=document.createElement('button');el.className='dam-marker';el.setAttribute('aria-label',p.lang==='en'?'Three Gorges Dam, WRI inventory location':'三峡大坝，WRI 数据库定位');el.innerHTML='<span>＋</span><small>'+ (p.lang==='en'?'THREE GORGES DAM<br/>WRI INVENTORY POINT':'三峡大坝<br/>WRI 数据库定位')+'</small>';el.onclick=()=>{if(dam)latest.current.onSelect(dam);};
  markers.push(new maplibregl.Marker({element:el}).setLngLat(damCoordinates).addTo(m));
  const showCities=()=>cityElements.forEach(el=>{el.style.display=m.getZoom()<5?'none':'';});showCities();m.on('zoom',showCities);
  return()=>{m.off('zoom',showCities);markers.forEach(x=>x.remove());};
 },[p.records,p.lang,p.labels,p.layers,p.focus,p.activeYear,p.contextPlaces,ready]);
 useEffect(()=>{
  const m=map.current;if(!ready||!m)return;
  function apply(m:GLMap,side:'main'|'comparison'){
   if(!m.isStyleLoaded())return;
   (m.getSource('before') as GeoJSONSource)?.setData(p.before?.geometry||empty);
   (m.getSource('after') as GeoJSONSource)?.setData(p.after?.geometry||empty);
   (m.getSource('change') as GeoJSONSource)?.setData(p.change||empty);
   const residences=p.records.filter(a=>residenceAt(a,p.activeYear)&&a.residence?.footprint).flatMap(a=>a.residence!.footprint!.features.map(f=>({...f,properties:{...f.properties,archiveId:a.id,certainty:a.certainty}})));
   (m.getSource('residences') as GeoJSONSource)?.setData({type:'FeatureCollection',features:residences});
   for(const id of ['residence-fill','residence-outline','residence-approximate'])m.setLayoutProperty(id,'visibility',p.layers[p.focus]?'visible':'none');
   m.setLayoutProperty('change-fill','visibility',p.layers.settlements&&!p.compare?'visible':'none');

   const beforeVisible=(p.layers.before||p.layers.settlements)&&(!p.compare||side==='main');
   const afterVisible=(p.layers.after||p.layers.settlements)&&(!p.compare||side==='comparison');
   for(const id of ['before-fill','before-line'])m.setLayoutProperty(id,'visibility',beforeVisible?'visible':'none');
   for(const id of ['after-fill','after-line'])m.setLayoutProperty(id,'visibility',afterVisible?'visible':'none');
   for(const id of ['before-fill','after-fill'])m.setPaintProperty(id,'fill-opacity',p.opacity);
   if(m.getLayer('hillshade'))m.setLayoutProperty('hillshade','visibility',p.terrain?'visible':'none');
  }
  apply(m,'main');if(comparison.current)apply(comparison.current,'comparison');
 },[p.before,p.after,p.change,p.records,p.activeYear,p.focus,p.layers,p.opacity,p.compare,p.terrain,ready]);
 useEffect(()=>{
  if(!p.compare||!secondary.current||!map.current||!ready)return;
  const main=map.current;
  const c=new maplibregl.Map({container:secondary.current,style:style(p.research),center:main.getCenter(),zoom:main.getZoom(),bearing:main.getBearing(),pitch:main.getPitch(),interactive:false,minZoom:10.8,maxZoom:13,maxBounds:localNavigationBounds,attributionControl:false,renderWorldCopies:false});comparison.current=c;
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
