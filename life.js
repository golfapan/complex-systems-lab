/* Game of Life / Life-like cellular automata. Synchronous Moore-neighbour
 * updates; finite dead boundary by default, optional torus. No network or saves.
 * Pattern credits: LifeWiki; HighLife replicator also documented by D. Eppstein.
 */
(function(global){
 'use strict';
 function parseRule(text){
  const match=/^B([0-8]*)\/S([0-8]*)$/i.exec(text);
  if(!match)throw new Error('规则格式应为 B3/S23，数字只能为 0–8。');
  const mask=s=>[...s].reduce((m,c)=>m|(1<<Number(c)),0);
  return {birth:mask(match[1]),survive:mask(match[2])};
 }
 function ruleText(birth,survive){const digits=m=>Array.from({length:9},(_,i)=>i).filter(i=>m&(1<<i)).join('');return 'B'+digits(birth)+'/S'+digits(survive);}
 function decodeRLE(text){
  const body=text.split('\n').filter(s=>!s.startsWith('#')&&!/^x\s*=/.test(s)).join('').replace(/\s/g,'');
  const cells=[];let x=0,y=0,count='';
  for(const c of body){if(/\d/.test(c)){count+=c;continue;}const n=Number(count)||1;count='';if(c==='o'){for(let k=0;k<n;k++)cells.push([x+k,y]);x+=n;}else if(c==='b')x+=n;else if(c==='$'){y+=n;x=0;}else if(c==='!')break;else throw new Error('Invalid RLE');}
  return cells;
 }
 class LifeModel {
  constructor(width=160,height=112){this.width=width;this.height=height;this.cells=new Uint8Array(width*height);this.next=new Uint8Array(width*height);this.wrap=false;this.setRule('B3/S23');this.generation=0;this.changed=0;}
  setRule(text){const r=parseRule(text);this.birth=r.birth;this.survive=r.survive;}
  get rule(){return ruleText(this.birth,this.survive);}
  clear(){this.cells.fill(0);this.next.fill(0);this.generation=0;this.changed=0;}
  place(points,x,y){for(const [dx,dy] of points)if(x+dx>=0&&x+dx<this.width&&y+dy>=0&&y+dy<this.height)this.cells[(y+dy)*this.width+x+dx]=1;}
  step(count=1){
   const w=this.width,h=this.height;
   for(let k=0;k<count;k++){
    const cells=this.cells,next=this.next;let changed=0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
     let neighbours=0;
     for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(dx||dy){let xx=x+dx,yy=y+dy;if(this.wrap){xx=(xx+w)%w;yy=(yy+h)%h;}if(xx>=0&&xx<w&&yy>=0&&yy<h)neighbours+=cells[yy*w+xx];}
     const i=y*w+x,value=((cells[i]?this.survive:this.birth)>>neighbours)&1;next[i]=value;if(value!==cells[i])changed++;
    }
    this.cells=next;this.next=cells;this.generation++;this.changed=changed;
   }
  }
  get population(){let sum=0;for(const c of this.cells)sum+=c;return sum;}
  bounds(){let left=this.width,right=-1,top=this.height,bottom=-1;for(let y=0;y<this.height;y++)for(let x=0;x<this.width;x++)if(this.cells[y*this.width+x]){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}return right<0?null:{left,right,top,bottom};}
  random(density=.25,seed=20261102){let s=seed>>>0;this.clear();for(let i=0;i<this.cells.length;i++){s=(Math.imul(1664525,s)+1013904223)>>>0;this.cells[i]=s/4294967296<density?1:0;}}
 }
 const pulsar=[];for(const y of [0,5,7,12])for(const x of [2,3,4,8,9,10])pulsar.push([x,y]);for(const x of [0,5,7,12])for(const y of [2,3,4,8,9,10])pulsar.push([x,y]);
 const presets={
  gun:{name:'滑翔机枪',tag:'不断发射',rule:'B3/S23',zoom:2,cells:decodeRLE('24bo$22bobo$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o$2o8bo3bob2o4bobo$10bo5bo7bo$11bo3bo$12b2o!'),description:'Gosper 滑翔机枪：36 个活细胞组成的结构，每 30 代发射一枚滑翔机。没有额外的“发射”指令。'},
  glider:{name:'滑翔机',tag:'四代走一步',rule:'B3/S23',zoom:4,cells:decodeRLE('bo$2bo$3o!'),description:'5 个细胞组成的滑翔机：每 4 代恢复相同形状，并沿对角线移动一格。移动来自细胞的出生和死亡。'},
  pulsar:{name:'脉冲星',tag:'三代一循环',rule:'B3/S23',zoom:4,cells:pulsar,description:'48 个细胞构成的对称振荡器，每 3 代回到起始状态。可以用“单步”观察三个阶段。'},
  blinker:{name:'闪烁器',tag:'最简单的振荡',rule:'B3/S23',zoom:5,cells:decodeRLE('3o!'),description:'3 个细胞横着、竖着交替，每 2 代循环。最适合看清邻居数怎样决定下一代。'},
  ship:{name:'轻型太空船',tag:'横向移动',rule:'B3/S23',zoom:4,cells:decodeRLE('bo2bo$o$o3bo$4o!'),description:'9 个细胞构成的轻型太空船，每 4 代横向移动两格。与滑翔机比较不同的“移动方式”。'},
  r:{name:'R 五连块',tag:'小种子，大变化',rule:'B3/S23',zoom:2,cells:decodeRLE('b2o$2o$bo!'),description:'只有 5 个细胞，却会经历很长的复杂演化。不是每个小图案都会迅速消失或形成短周期。'},
  replicator:{name:'HighLife 复制器',tag:'换一条规则',rule:'B36/S23',zoom:3,cells:decodeRLE('2b3o$bo2bo$o3bo$o2bo$3o!'),description:'HighLife 多了一条“6 个邻居也会出生”的规则。这组 12 个细胞经过 12 代形成两份复制体；换回 Conway 再比较。'},
  random:{name:'随机世界',tag:'看秩序如何出现',rule:'B3/S23',zoom:1,cells:null,description:'随机撒入细胞，看哪些结构存活下来。调整初始密度并点“重新撒点”，比较不同的起点。'}
 };
 if(typeof module!=='undefined')module.exports={LifeModel,parseRule,ruleText,decodeRLE,presets};
 if(typeof document==='undefined')return;
 const model=new LifeModel(),canvas=document.getElementById('world'),ctx=canvas.getContext('2d'),speed=document.getElementById('speed'),zoom=document.getElementById('zoom'),density=document.getElementById('density'),status=document.getElementById('status'),play=document.getElementById('play');
 let running=true,selected='gun',seed=20261102,saved=null,accumulator=0,lastTime=0,view={x:0,y:0,w:160,h:112},stage='',drawnWidth=0,drawnHeight=0,colors=null;
 const paintProbe=document.createElement('span');paintProbe.hidden=true;document.body.append(paintProbe);
 function palette(){
  // Canvas does not resolve CSS custom properties/light-dark() itself.
  const resolve=name=>{paintProbe.style.color='var('+name+')';return getComputedStyle(paintProbe).color;};
  return {bg:resolve('--board'),live:resolve('--live'),grid:resolve('--grid')};
 }
 function ruleUI(){
  document.getElementById('ruleCode').textContent=model.rule;
  document.querySelectorAll('[data-rule-kind]').forEach(b=>b.setAttribute('aria-pressed',String(Boolean(model[b.dataset.ruleKind]&(1<<Number(b.dataset.neighbours))))));
  document.querySelectorAll('[data-rule]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.rule===model.rule)));
  document.getElementById('ruleWarning').hidden=model.rule===presets[selected].rule;
 }
 function setRunning(value){running=value;play.textContent=value?'暂停':'播放';play.setAttribute('aria-pressed',String(value));lastTime=0;accumulator=0;}
 function announce(text){if(text!==stage){status.textContent=text;stage=text;}}
 function setView(){
  const factor=Number(zoom.value);view.w=Math.round(model.width/factor);view.h=Math.round(model.height/factor);
  view.x=Math.max(0,Math.min(model.width-view.w,Math.round(model.width/2-view.w/2)));view.y=Math.max(0,Math.min(model.height-view.h,Math.round(model.height/2-view.h/2)));
  document.getElementById('zoomValue').textContent=factor.toFixed(1)+' 倍';
 }
 function render(){
  const width=canvas.getBoundingClientRect().width,ratio=global.devicePixelRatio||1;
  const W=Math.max(1,Math.round(width*ratio)),H=Math.round(W*model.height/model.width);
  if(canvas.width!==W||canvas.height!==H){canvas.width=W;canvas.height=H;}
  drawnWidth=W;drawnHeight=H;if(!colors)colors=palette();ctx.fillStyle=colors.bg;ctx.fillRect(0,0,W,H);
  const cw=W/view.w,ch=H/view.h;ctx.fillStyle=colors.live;
  for(let y=0;y<view.h;y++)for(let x=0;x<view.w;x++)if(model.cells[(view.y+y)*model.width+view.x+x]){
   const x1=Math.round(x*cw),y1=Math.round(y*ch);ctx.fillRect(x1,y1,Math.round((x+1)*cw)-x1,Math.round((y+1)*ch)-y1);
  }
  if(document.getElementById('grid').checked&&cw>=7*ratio){ctx.strokeStyle=colors.grid;ctx.lineWidth=ratio*.5;ctx.beginPath();for(let x=0;x<=view.w;x++){const px=Math.round(x*cw);ctx.moveTo(px,0);ctx.lineTo(px,H);}for(let y=0;y<=view.h;y++){const py=Math.round(y*ch);ctx.moveTo(0,py);ctx.lineTo(W,py);}ctx.stroke();}
  document.getElementById('generation').textContent=model.generation.toLocaleString();document.getElementById('population').textContent=model.population.toLocaleString();
  let visible=0;for(let y=0;y<view.h;y++)for(let x=0;x<view.w;x++)visible+=model.cells[(view.y+y)*model.width+view.x+x];
  document.getElementById('offscreen').hidden=visible===model.population;
  canvas.setAttribute('aria-label','生命游戏，第 '+model.generation+' 代，'+model.population+' 个活细胞。放大 '+zoom.value+' 倍。');
 }
 function snapshot(){saved={cells:model.cells.slice(),rule:model.rule,wrap:model.wrap,zoom:zoom.value,selected};}
 function loadPreset(key){
  selected=key;const p=presets[key];model.clear();model.setRule(p.rule);model.wrap=document.getElementById('wrap').checked;
  if(p.cells){const maxX=Math.max(...p.cells.map(c=>c[0])),maxY=Math.max(...p.cells.map(c=>c[1]));const x=Math.floor((model.width-maxX-1)/2)-(key==='gun'?8:0),y=Math.floor((model.height-maxY-1)/2)-(key==='gun'?10:0);model.place(p.cells,x,y);}else model.random(Number(density.value)/100,seed);
  zoom.value=p.zoom;setView();snapshot();ruleUI();
  document.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.preset===key)));
  document.getElementById('patternName').textContent=p.name;document.getElementById('description').textContent=p.description;setRunning(true);announce('正在演化 · 可暂停或单步观察');render();
 }
 function updateAfterStep(){
  if(model.population===0&&!(model.birth&1)){setRunning(false);announce('当前世界已无活细胞；仍可改单元或规则。');}
  else if(model.changed===0){setRunning(false);announce('当前状态已不再变化；振荡器和移动图案不会被误判为静止。');}
  else announce(running?'正在演化 · 可暂停或单步观察':'已暂停 · 单步查看下一代');render();
 }
 function setRule(text){model.setRule(text);setRunning(false);ruleUI();announce('规则已修改，当前图案保留；点播放观察新规则。');render();}
 for(const [key,p] of Object.entries(presets)){
  const b=document.createElement('button');b.type='button';b.dataset.preset=key;b.setAttribute('aria-pressed',String(key==='gun'));const name=document.createElement('span');name.textContent=p.name;const tag=document.createElement('small');tag.textContent=p.tag;b.append(name,tag);b.addEventListener('click',()=>loadPreset(key));document.getElementById('presets').append(b);
 }
 for(const kind of ['birth','survive'])for(let i=0;i<=8;i++){
  const b=document.createElement('button');b.type='button';b.textContent=String(i);b.dataset.ruleKind=kind;b.dataset.neighbours=i;b.setAttribute('aria-label',(kind==='birth'?'出生':'存活')+'：'+i+' 个活邻居');b.addEventListener('click',()=>{model[kind]^=1<<i;setRule(model.rule);});document.getElementById(kind).append(b);
 }
 document.querySelectorAll('[data-rule]').forEach(b=>b.addEventListener('click',()=>setRule(b.dataset.rule)));
 play.addEventListener('click',()=>{setRunning(!running);announce(running?'正在演化 · 可暂停或单步观察':'已暂停 · 点击格子可以增删细胞');});
 document.getElementById('step').addEventListener('click',()=>{setRunning(false);model.step();updateAfterStep();});
 document.getElementById('fast').addEventListener('click',()=>{setRunning(false);model.step(100);updateAfterStep();});
 document.getElementById('replay').addEventListener('click',()=>{
  model.clear();model.cells.set(saved.cells);model.setRule(saved.rule);model.wrap=saved.wrap;document.getElementById('wrap').checked=saved.wrap;zoom.value=saved.zoom;setView();ruleUI();setRunning(true);announce('从本预设的初始状态重播');render();
 });
 document.getElementById('clear').addEventListener('click',()=>{model.clear();setRunning(false);announce('画布已清空，点击格子画出你自己的起点。');render();});
 document.getElementById('scatter').addEventListener('click',()=>{seed=(Math.random()*4294967296)>>>0;loadPreset('random');});
 speed.addEventListener('input',()=>{document.getElementById('speedValue').textContent=speed.value+' 代／秒';accumulator=0;});
 density.addEventListener('input',()=>{document.getElementById('densityValue').textContent=density.value+'%';});
 zoom.addEventListener('input',()=>{setView();render();});
 document.getElementById('overview').addEventListener('click',()=>{zoom.value=1;setView();render();});
 document.getElementById('grid').addEventListener('change',render);
 document.getElementById('wrap').addEventListener('change',e=>{model.wrap=e.target.checked;setRunning(false);announce('边界方式已改变，点播放继续。');render();});
 canvas.addEventListener('click',e=>{
  const r=canvas.getBoundingClientRect(),x=view.x+Math.min(view.w-1,Math.max(0,Math.floor((e.clientX-r.left)/r.width*view.w))),y=view.y+Math.min(view.h-1,Math.max(0,Math.floor((e.clientY-r.top)/r.height*view.h)));
  model.cells[y*model.width+x]^=1;setRunning(false);announce('已修改一个细胞；点单步或播放看它的影响。');render();
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&running){setRunning(false);announce('离开页面已自动暂停，点播放继续。');}});
 new ResizeObserver(render).observe(canvas);global.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{colors=null;render();});
 function frame(time){
  if(!lastTime)lastTime=time;const elapsed=Math.min(.25,(time-lastTime)/1000);lastTime=time;
  if(running&&!document.hidden){accumulator+=elapsed*Number(speed.value);const steps=Math.min(15,Math.floor(accumulator));if(steps){model.step(steps);accumulator-=steps;updateAfterStep();}}
  requestAnimationFrame(frame);
 }
 loadPreset('gun');requestAnimationFrame(frame);
})(typeof globalThis!=='undefined'?globalThis:this);
