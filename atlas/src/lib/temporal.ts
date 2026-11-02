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
// Temporary local focus near the sourced dam locator. The user's unnamed road is not geocoded.
export const localBounds:[[number,number],[number,number]]=[[110.92,30.77],[111.09,30.88]];
export const localNavigationBounds:[[number,number],[number,number]]=[[110.82,30.67],[111.2,31.0]];
export function inLocalArea(coordinates:[number,number]):boolean {
 return coordinates[0]>=localNavigationBounds[0][0]&&coordinates[0]<=localNavigationBounds[1][0]&&coordinates[1]>=localNavigationBounds[0][1]&&coordinates[1]<=localNavigationBounds[1][1];
}
