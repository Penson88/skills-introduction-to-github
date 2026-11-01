import type { ArchiveRecord, LayerId } from '../data/catalog';
import type { Observation } from './research';
export function residenceAt(record: ArchiveRecord, year: number): boolean {
 const r=record.residence;
 return !!(r&&record.evidence==='documented'&&record.coordinates&&r.fromYear<=year&&year<=r.toYear);
}
export function observationSequence(observations: Observation[],baseline?:Observation):Observation[]{
 if(!baseline?.geometry)return [];
 const series=observations.filter(o=>o.geometry&&o.year>=baseline.year&&o.coverageId===baseline.coverageId&&o.classification===baseline.classification&&o.resolution===baseline.resolution).sort((a,b)=>a.year-b.year);
 return series.length>=2?series:[];
}
export const periodYear=(layer:LayerId,earlier:number,current:number)=>layer==='before'?earlier:current;
export const reservoirBounds:[[number,number],[number,number]]=[[106.2,29.2],[111.6,31.5]];
export const damCoordinates:[number,number]=[111.0032,30.8235];
