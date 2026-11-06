/* Independent escape-time fractal explorer. Doubles, finite iteration budget. */
(function(root){
'use strict';
function escape(x,y,limit=700,mode='mandelbrot',cr=0,ci=0){
 let zx=mode==='julia'?x:0,zy=mode==='julia'?y:0;
 if(mode!=='julia'){
  cr=x;ci=y;const q=(x-.25)**2+y*y;
  if(q*(q+x-.25)<=.25*y*y||(x+1)**2+y*y<=.0625)return{escaped:false,n:limit,smooth:limit};
 }
 const radius2=Math.max(4,cr*cr+ci*ci);
 for(let n=1;n<=limit;n++){const next=zx*zx-zy*zy+cr;zy=2*zx*zy+ci;zx=next;const r2=zx*zx+zy*zy;if(r2>radius2)return{escaped:true,n,smooth:n+1-Math.log2(Math.log(Math.sqrt(r2)))};}
 return{escaped:false,n:limit,smooth:limit};
}
function pixel(view,x,y,width,height){return{x:view.x+((x+.5)/width-.5)*view.span,y:view.y+(.5-(y+.5)/height)*view.span*height/width};}
function point(view,fx,fy,aspect){return{x:view.x+(fx-.5)*view.span,y:view.y+(.5-fy)*view.span/aspect};}
const MIN_SPAN=3.4e-10,MAX_SPAN=16;
function zoom(view,factor,fx=.5,fy=.5,aspect=1.5){const anchor=point(view,fx,fy,aspect),span=Math.max(MIN_SPAN,Math.min(MAX_SPAN,view.span/factor));return{...view,span,x:anchor.x-(fx-.5)*span,y:anchor.y-(.5-fy)*span/aspect};}
function color(result,palette='jewel'){
 if(!result.escaped)return[8,13,27];
 const t=result.smooth*.024;
 const palettes={jewel:[[.51,.47,.5],[.49,.47,.48],[1,1,1],[.02,.19,.40]],ocean:[[.44,.54,.58],[.38,.42,.40],[1,1,1],[.42,.23,.10]],fire:[[.58,.40,.25],[.42,.38,.25],[1,1,1],[0,.12,.25]]};
 const [a,b,c,d]=palettes[palette]||palettes.jewel;return a.map((v,i)=>Math.round(255*Math.max(0,Math.min(1,v+b[i]*Math.cos(2*Math.PI*(c[i]*t+d[i]))))));
}
const api={escape,pixel,point,zoom,color,MIN_SPAN,MAX_SPAN};if(typeof module!=='undefined')module.exports=api;else root.FractalCore=api;
if(typeof document==='undefined')return;
const $=id=>document.getElementById(id),canvas=$('world'),ctx=canvas.getContext('2d',{alpha:false});
let view={x:-.55,y:0,span:3.4,mode:'mandelbrot',cr:-.8,ci:.156},history=[],worker=null,job=0,timer=null,tourTimer=null,touring=false,drag=null,ready=false,resizeTimer=null,workerFailed=false;
let completed=null;const cache=document.createElement('canvas'),cacheCtx=cache.getContext('2d');
const presets={whole:{x:-.55,y:0,span:3.4,mode:'mandelbrot'},seahorse:{x:-.745,y:.186,span:.035,mode:'mandelbrot'},spiral:{x:-.743643887037151,y:.13182590420533,span:.008,mode:'mandelbrot'},elephant:{x:.275,y:.008,span:.055,mode:'mandelbrot'},mini:{x:-1.754877666,y:0,span:.13,mode:'mandelbrot'},julia:{x:0,y:0,span:3.4,mode:'julia',cr:-.8,ci:.156}};
function status(s){$('status').textContent=s;}
function stopTour(){touring=false;clearTimeout(tourTimer);$('tour').textContent='螺旋放大之旅';$('tour').setAttribute('aria-pressed','false');}
function remember(v=view){history.push({...v});if(history.length>80)history.shift();$('back').disabled=!history.length;}
function sync(){const magnification=3.4/view.span;$('mode').value=view.mode;$('cr').value=view.cr;$('ci').value=view.ci;$('juliaControls').hidden=view.mode!=='julia';$('zoomValue').textContent=magnification<1000?magnification.toFixed(1)+' ×':magnification.toExponential(2)+' ×';$('centerValue').textContent=view.x.toPrecision(15)+' '+(view.y<0?'−':'+')+' '+Math.abs(view.y).toPrecision(15)+' i';$('formulaMode').textContent=view.mode==='mandelbrot'?'Mandelbrot：z₀ = 0，每个像素改变 c':'填充 Julia：c 固定，每个像素改变 z₀';$('baseValue').textContent=$('iterations').value;$('back').disabled=!history.length;document.querySelectorAll('[data-preset]').forEach(b=>{const p=presets[b.dataset.preset],match=view.mode===p.mode&&view.x===p.x&&view.y===p.y&&view.span===p.span&&(p.mode!=='julia'||view.cr===p.cr&&view.ci===p.ci);b.setAttribute('aria-pressed',String(match));});}
function preview(){ctx.fillStyle='#080d1b';ctx.fillRect(0,0,canvas.width,canvas.height);if(!completed||completed.mode!==view.mode||completed.cr!==view.cr||completed.ci!==view.ci)return;const scale=completed.span/view.span,dx=(completed.x-view.x)/view.span*canvas.width+(1-scale)*canvas.width/2,dy=(view.y-completed.y)/view.span*canvas.width+(1-scale)*canvas.height/2;ctx.drawImage(cache,dx,dy,canvas.width*scale,canvas.height*scale);}
function render(){clearTimeout(timer);timer=null;clearTimeout(tourTimer);const id=++job;ready=false;sync();preview();const iterations=Math.min(5000,Number($('iterations').value)+Math.max(0,Math.round(Math.log2(3.4/view.span)*90)));$('actualIterations').textContent=iterations;const request={id,width:canvas.width,height:canvas.height,view:{...view},iterations,palette:$('palette').value};status('计算中… 0%');$('progress').value=0;
 if(worker)worker.postMessage(request);else fallback(request);
}
function queue(){clearTimeout(timer);job++;ready=false;preview();sync();timer=setTimeout(render,100);}
function receive(data){if(data.id!==job)return;if(data.error){status('计算未完成：'+data.error);stopTour();return;}if(data.pixels){const image=new ImageData(new Uint8ClampedArray(data.pixels),data.width,data.rows);ctx.putImageData(image,0,data.y);}const pc=Math.round(data.progress*100);$('progress').value=pc;status('计算中… '+pc+'%');if(data.done){ready=true;cache.width=canvas.width;cache.height=canvas.height;cacheCtx.drawImage(canvas,0,0);completed={...view};status('已完成 · 点击放大，拖动平移；滚轮围绕指针缩放。'+(view.span<=MIN_SPAN*1.001?' 已到本版双精度放大上限。':''));if(touring){if(view.span<=MIN_SPAN*1.001)stopTour();else tourTimer=setTimeout(()=>{view=zoom(view,1.7);render();},600);}}}
// file:// or Worker-unavailable fallback uses the same maths in short row slices.
function fallback(req){let y=0;const tick=()=>{if(req.id!==job)return;const rows=Math.min(4,req.height-y),pixels=new Uint8ClampedArray(req.width*rows*4);for(let j=0;j<rows;j++)for(let x=0;x<req.width;x++){const p=pixel(req.view,x,y+j,req.width,req.height),rgb=color(escape(p.x,p.y,req.iterations,req.view.mode,req.view.cr,req.view.ci),req.palette),i=(j*req.width+x)*4;pixels.set(rgb,i);pixels[i+3]=255;}receive({id:req.id,width:req.width,rows,y,pixels:pixels.buffer,progress:(y+rows)/req.height,done:y+rows===req.height});y+=rows;if(y<req.height)setTimeout(tick,0);};tick();}
try{worker=new Worker('fractal-worker.js');worker.onmessage=e=>receive(e.data);worker.onerror=()=>{if(workerFailed)return;workerFailed=true;worker.terminate();worker=null;render();};}catch(e){worker=null;}
function change(next,save=true){stopTour();if(save)remember();view=next;render();}
for(const b of document.querySelectorAll('[data-preset]'))b.addEventListener('click',()=>{change({...view,...presets[b.dataset.preset]});b.setAttribute('aria-pressed','true');});
$('in').addEventListener('click',()=>change(zoom(view,2)));$('out').addEventListener('click',()=>change(zoom(view,.5)));$('home').addEventListener('click',()=>change({...view,...presets.whole}));$('back').addEventListener('click',()=>{if(history.length){stopTour();view=history.pop();render();}});
$('mode').addEventListener('change',()=>change({...view,mode:$('mode').value,x:$('mode').value==='julia'?0:-.55,y:0,span:3.4}));
for(const id of ['cr','ci'])$(id).addEventListener('change',()=>{const cr=Number($('cr').value),ci=Number($('ci').value);if(!Number.isFinite(cr)||!Number.isFinite(ci)||Math.abs(cr)>8||Math.abs(ci)>8){status('Julia 参数需为 −8 到 8 的有限数字。');sync();return;}change({...view,cr,ci});});
for(const id of ['iterations','palette','quality'])$(id).addEventListener(id==='iterations'?'input':'change',()=>{stopTour();if(id==='quality')resize();else queue();});
$('pick').addEventListener('click',()=>{if(view.mode!=='mandelbrot'){status('请先切到 Mandelbrot 视图，再从图上选择 c。');return;}$('pick').setAttribute('aria-pressed',$('pick').getAttribute('aria-pressed')==='true'?'false':'true');status($('pick').getAttribute('aria-pressed')==='true'?'请点击 Mandelbrot 图中的一个位置，用该坐标作为 c 生成 Julia 图。':'已取消选点。');});
$('tour').addEventListener('click',()=>{if(touring){stopTour();return;}remember();view={...view,...presets.spiral,span:.02};touring=true;$('tour').textContent='停止放大之旅';$('tour').setAttribute('aria-pressed','true');render();});
canvas.addEventListener('wheel',e=>{e.preventDefault();stopTour();const r=canvas.getBoundingClientRect(),factor=Math.pow(2,Math.max(-1,Math.min(1,-e.deltaY*.005)));if(!timer)remember();view=zoom(view,factor,(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height,1.5);queue();},{passive:false});
canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;stopTour();clearTimeout(timer);timer=null;job++;canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,view:{...view},moved:false};canvas.style.cursor='grabbing';});
canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect(),p=point(view,(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height,1.5);$('cursorValue').textContent=p.x.toPrecision(12)+' '+(p.y<0?'−':'+')+' '+Math.abs(p.y).toPrecision(12)+' i';if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>4)drag.moved=true;if(drag.moved){view={...drag.view,x:drag.view.x-dx/r.width*drag.view.span,y:drag.view.y+dy/r.width*drag.view.span};preview();sync();}});
canvas.addEventListener('pointerup',e=>{if(!drag)return;const old=drag;drag=null;canvas.style.cursor='crosshair';const r=canvas.getBoundingClientRect(),fx=(e.clientX-r.left)/r.width,fy=(e.clientY-r.top)/r.height;if(old.moved){remember(old.view);render();return;}if($('pick').getAttribute('aria-pressed')==='true'&&view.mode==='mandelbrot'){const c=point(view,fx,fy,1.5);$('pick').setAttribute('aria-pressed','false');change({...view,mode:'julia',cr:c.x,ci:c.y,x:0,y:0,span:3.4});}else change(zoom(view,e.shiftKey?.5:2,fx,fy,1.5));});
canvas.addEventListener('pointercancel',()=>{if(drag){view=drag.view;drag=null;render();}canvas.style.cursor='crosshair';});
canvas.addEventListener('keydown',e=>{if(['+','=','-','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();if(e.key==='+'||e.key==='=')change(zoom(view,2));else if(e.key==='-')change(zoom(view,.5));else{const d=view.span*.15;change({...view,x:view.x+(e.key==='ArrowRight'?d:e.key==='ArrowLeft'?-d:0),y:view.y+(e.key==='ArrowUp'?d:e.key==='ArrowDown'?-d:0)});}}});
function resize(){const width=Math.min(Number($('quality').value),Math.max(480,Math.round(canvas.getBoundingClientRect().width*Math.min(2,devicePixelRatio||1)))),height=Math.round(width/1.5);if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}render();}
new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(resize,120);}).observe(canvas);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopTour();});window.addEventListener('pagehide',e=>{stopTour();if(!e.persisted)worker?.terminate();});resize();
})(typeof globalThis!=='undefined'?globalThis:this);
