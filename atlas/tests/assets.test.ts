import {describe,it,expect} from 'vitest';
import {assetUrl} from '../src/lib/assets';
describe('deployment asset paths',()=>{
 it('keeps geographic files under the GitHub project directory',()=>{
  expect(assetUrl('/data/research.json','https://penson88.github.io/skills-introduction-to-github/')).toBe('https://penson88.github.io/skills-introduction-to-github/data/research.json');
 });
 it('also supports root hosting and preserves tile coordinates',()=>{
  expect(assetUrl('/data/rivers.geojson','https://atlas.example/')).toBe('https://atlas.example/data/rivers.geojson');
  expect(assetUrl('/terrain/{z}/{x}/{y}.png','https://atlas.example/project/')).toBe('https://atlas.example/project/terrain/{z}/{x}/{y}.png');
 });
 it('preserves licensed external HTTPS asset URLs',()=>{
  expect(assetUrl('https://tiles.example/{z}/{x}/{y}.png','https://atlas.example/')).toBe('https://tiles.example/{z}/{x}/{y}.png');
 });
});
