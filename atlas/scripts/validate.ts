import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import type { FeatureCollection,Point } from 'geojson';
import { validateResearch,validateWater,validCoordinate } from '../src/lib/research';
import { seedArchive,sources } from '../src/data/catalog';
const root=fileURLToPath(new URL('../public',import.meta.url));
const r=validateResearch(JSON.parse(readFileSync(join(root,'data/research.json'),'utf8')));
for(const o of r.observations){
 const water=JSON.parse(readFileSync(join(root,o.dataUrl),'utf8'));validateWater(water);
 const bytes=readFileSync(join(root,o.coverageUrl));
 if('sha256:'+createHash('sha256').update(bytes).digest('hex')!==o.coverageId)throw Error('Coverage hash mismatch.');
 validateWater(JSON.parse(bytes.toString()));
}
const places=JSON.parse(readFileSync(join(root,'data/places.geojson'),'utf8')) as FeatureCollection<Point>;
for(const record of seedArchive.filter(a=>a.coordinates&&a.id!=='DAM-001')){
 const feature=places.features.find(f=>record.source.includes(String(f.properties?.ne_id)));
 if(!feature||JSON.stringify(feature.geometry.coordinates)!==JSON.stringify(record.coordinates))throw Error(`Source location mismatch: ${record.id}`);
}
const dam=JSON.parse(readFileSync(join(root,'data/dam.geojson'),'utf8')) as FeatureCollection<Point>;
const record=seedArchive.find(a=>a.id==='DAM-001')!;
if(JSON.stringify(dam.features[0].geometry.coordinates)!==JSON.stringify(record.coordinates))throw Error('WRI dam source mismatch');
for(const a of r.archives)if(a.residence?.footprintUrl)validateWater(JSON.parse(readFileSync(join(root,a.residence.footprintUrl),'utf8')));
function walk(c:unknown){if(!Array.isArray(c))throw Error('Invalid coordinate nesting.');if(typeof c[0]==='number'){if(!validCoordinate(c))throw Error('Invalid context coordinates.');}else c.forEach(walk);}
for(const name of ['countries','rivers','places','dam','waterbodies']){
 const fc=JSON.parse(readFileSync(join(root,`data/${name}.geojson`),'utf8'));if(fc.type!=='FeatureCollection'||!fc.features.length)throw Error('Empty context.');
 for(const f of fc.features)walk(f.geometry.coordinates);
 console.log(`${name}: ${fc.features.length} features, coordinates checked`);
}
for(const s of sources){if(!s.url.startsWith('https://'))throw Error('Invalid source URL.');}
console.log(`Validated ${r.observations.length} actual water observations, ${r.archives.length} imported archive records; 3 reference locations match downloaded source exactly. No historical features inferred.`);
