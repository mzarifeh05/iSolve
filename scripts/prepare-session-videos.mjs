import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const [sourceDirectory,ffmpeg='ffmpeg',ffprobe='ffprobe']=process.argv.slice(2);
if(!sourceDirectory)throw new Error('Usage: node scripts/prepare-session-videos.mjs "SOURCE_DIRECTORY" ["FFMPEG_EXECUTABLE" "FFPROBE_EXECUTABLE"]');
const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.join(root,'public/assets/sessions');
await mkdir(output,{recursive:true});
function run(binary,args){
  const result=spawnSync(binary,args,{encoding:'utf8',windowsHide:true,maxBuffer:4*1024*1024});
  if(result.error)throw result.error;
  if(result.status!==0)throw new Error(result.stderr||`${binary} exited with ${result.status}`);
  return result.stdout;
}
function probe(filename){return JSON.parse(run(ffprobe,['-v','error','-show_streams','-show_format','-of','json',filename]));}
const sources=[
  {id:'session-explanation',source:'explaining during sessions.mp4',posterTime:2,
    title_en:'New ideas, explained together',title_ar:'أفكار جديدة، نفهمها معًا',
    description_en:'An explanation at the front of the room, with everyone following along. There is always room for a question.',
    description_ar:'شرح أمام القاعة، والجميع يتابع. وهناك دائمًا مساحة للسؤال.'},
  {id:'practical-solution',source:'trainee during practical solution.mp4',posterTime:3,
    // The supplied landscape file contains portrait footage between black bars.
    // Remove only those verified empty bars; retain the complete recorded frame.
    crop:'608:1080:656:0',
    title_en:'Your turn to try',title_ar:'الآن دورك لتجرّب',
    description_en:'From listening to doing: a trainee works through a solution on a laptop during the session.',
    description_ar:'من الاستماع إلى التطبيق: متدرّب يعمل على حلّ المسألة على حاسوبه خلال الجلسة.'},
];
const clips=[],report=[];
for(const item of sources){
  const input=path.join(sourceDirectory,item.source);
  const hash=createHash('sha256').update(await readFile(input)).digest('hex');
  const stem=`${item.id}-${hash.slice(0,12)}`;
  const target=path.join(output,`${stem}.mp4`);
  const filters=[...(item.crop?[`crop=${item.crop}`]:[]),"scale='min(720,iw)':-2",'fps=30'];
  run(ffmpeg,['-hide_banner','-loglevel','error','-y','-i',input,'-map','0:v:0','-map','0:a:0?',
    '-vf',filters.join(','),'-c:v','libx264','-preset','medium','-crf','24','-pix_fmt','yuv420p',
    '-c:a','aac','-b:a','96k','-movflags','+faststart','-map_metadata','-1','-map_chapters','-1',target]);
  const frame=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-ss',String(item.posterTime),'-i',target,
    '-frames:v','1','-vf','scale=480:-2','-f','image2pipe','-vcodec','png','pipe:1'],{windowsHide:true,maxBuffer:8*1024*1024});
  if(frame.error||frame.status!==0)throw frame.error||new Error(frame.stderr.toString());
  await Promise.all([
    sharp(frame.stdout).webp({quality:82}).toFile(path.join(output,`${stem}-poster.webp`)),
    sharp(frame.stdout).jpeg({quality:82,mozjpeg:true}).toFile(path.join(output,`${stem}-poster.jpg`)),
  ]);
  const info=probe(target),video=info.streams.find(stream=>stream.codec_type==='video');
  const original=probe(input);
  const {source:_source,crop:_crop,posterTime:_time,...content}=item;
  const clip={...content,src:`/assets/sessions/${stem}.mp4`,poster:`/assets/sessions/${stem}-poster.webp`,
    posterFallback:`/assets/sessions/${stem}-poster.jpg`,width:video.width,height:video.height,duration:Number(info.format.duration)};
  clips.push(clip);
  report.push({...clip,source_filename:item.source,content_hash:hash,source_bytes:(await stat(input)).size,
    source_duration:Number(original.format.duration),bytes:(await stat(target)).size,
    poster_bytes:(await stat(path.join(output,`${stem}-poster.webp`))).size,
    poster_fallback_bytes:(await stat(path.join(output,`${stem}-poster.jpg`))).size,
    video_codec:video.codec_name,audio_codec:info.streams.find(stream=>stream.codec_type==='audio')?.codec_name,
    crop:item.crop||null});
}
await writeFile(path.join(root,'src/data/sessionVideos.js'),`// Prepared local clips. No video is requested until its play button is activated.\nexport const sessionVideos=${JSON.stringify(clips,null,2)};\n`);
await writeFile(path.join(root,'docs/session-video-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.map(({id,source_bytes,bytes,width,height,duration})=>({id,source_bytes,bytes,width,height,duration}))));
