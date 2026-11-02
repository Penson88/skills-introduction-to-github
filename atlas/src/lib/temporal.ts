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
// User-supplied latitude/longitude, received 2026-11-02. Renderer order is longitude, latitude.
export const selectedLocation:[number,number]=[110.999284,30.825152];
export const localBounds:[[number,number],[number,number]]=[[110.914284,30.770152],[111.084284,30.880152]];
export const localNavigationBounds:[[number,number],[number,number]]=[[110.809284,30.665152],[111.189284,31.005152]];
export function inLocalArea(coordinates:[number,number]):boolean {
 return coordinates[0]>=localNavigationBounds[0][0]&&coordinates[0]<=localNavigationBounds[1][0]&&coordinates[1]>=localNavigationBounds[0][1]&&coordinates[1]<=localNavigationBounds[1][1];
}
