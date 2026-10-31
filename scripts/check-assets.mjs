import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
async function files(directory){
  const result=[];
  for(const entry of await readdir(directory,{withFileTypes:true})){
    const filename=path.join(directory,entry.name);
    if(entry.isDirectory())result.push(...await files(filename));else result.push(filename);
  }
  return result;
}
const expected=new Set();
for(const filename of [...await files(path.join(root,'src')),path.join(root,'index.html')]){
  const source=await readFile(filename,'utf8');
  for(const match of source.matchAll(/['"`(](\/(?:assets\/|favicon-)[^'"`)\s?#]+)/g))expected.add(match[1]);
}
const manifest=JSON.parse(await readFile(path.join(root,'scripts/gallery-manifest.json'),'utf8'));
for(const record of manifest.records){
  for(const image of [...record.variants.thumbnails,record.variants.lightbox]){
    expected.add(image.path);expected.add(image.fallback_path);
  }
}
for(const category of ['all','training','zcc','moments']){
  const count=manifest.records.filter(row=>category==='all'||row.category===category).length;
  for(let offset=0;offset<Math.max(1,count);offset+=6)expected.add(`/gallery-data/v1/${category}-${offset}.json`);
}
const actual=new Set((await files(path.join(root,'public'))).map(filename=>'/'+path.relative(path.join(root,'public'),filename).split(path.sep).join('/')));
const missing=[...expected].filter(filename=>!actual.has(filename));
const unused=[...actual].filter(filename=>!expected.has(filename));
if(missing.length||unused.length){console.error(JSON.stringify({missing,unused},null,2));process.exitCode=1;}
else console.log(`All ${actual.size} public files are referenced; no missing or unused assets.`);
