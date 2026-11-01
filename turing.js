/* Dimensionless FitzHugh–Nagumo-type activator–inhibitor teaching model.
 * u_t=.1*(u-u^3-v+bias)+.16*Laplacian(u)
 * v_t=.2*(u-.8*v)+(.16*ratio)*Laplacian(v).
 * Signed fields are deviations, not nonnegative chemical concentrations.
 * No preset images. Directional modes only seed a weak initial perturbation.
 * Euler diffusion limit:
 * dx=.5, dt=.01; dt*Dv/dx^2 <= .2048 < 1/4.
 * Default domain is now 56^2 with 112^2 samples: one quarter of the area,
 * preserving the old .5 spatial spacing and .01 stable time step.
 */
(function(global){
 'use strict';
 class PatternModel {
  constructor(n=112,seed=7321){
   this.n=n;this.bias=0;this.ratio=20;this.initial='random';this.seed=seed;
   this.spacing=.5;this.length=n*this.spacing;this.scale=1/(this.spacing*this.spacing);this.dt=.04/this.scale;
   this.left=new Uint32Array(n*n);this.right=new Uint32Array(n*n);this.up=new Uint32Array(n*n);this.down=new Uint32Array(n*n);
   for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=y*n+x;this.left[i]=y*n+(x+n-1)%n;this.right[i]=y*n+(x+1)%n;this.up[i]=((y+n-1)%n)*n+x;this.down[i]=((y+1)%n)*n+x;}
   this.reset(seed);
  }
  reset(seed=this.seed){
   this.seed=seed>>>0;let s=this.seed;const random=()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296;};
   const size=this.n*this.n;this.u=new Float64Array(size);this.v=new Float64Array(size);this.a=new Float64Array(size);this.b=new Float64Array(size);
   let eq=0;for(let k=0;k<20;k++)eq-=(eq*eq*eq+.25*eq-this.bias)/(3*eq*eq+.25);
   this.equilibrium=eq;
   for(let y=0;y<this.n;y++)for(let x=0;x<this.n;x++){
    const i=y*this.n+x;
    const cycles=Math.max(1,Math.round(this.length/12)); // Select an allowed periodic wavelength near the same physical scale.
    const phase=this.initial==='parallel'?2*Math.PI*cycles*y/this.n:this.initial==='diagonal'?2*Math.PI*Math.max(1,Math.floor(cycles/Math.sqrt(2)))*(x+y)/this.n:0;
    const wave=this.initial==='random'?0:.025*Math.sin(phase);
    this.u[i]=eq+wave+.008*(random()-.5);this.v[i]=eq/.8+.4*wave+.008*(random()-.5);
   }
   this.t=0;this.failed=false;
  }
  step(count=1){
   const n=this.n,dt=this.dt,du=.16*this.scale,dv=du*this.ratio,bias=this.bias,left=this.left,right=this.right,top=this.up,bottom=this.down;
   for(let k=0;k<count;k++){
    const u=this.u,v=this.v,a=this.a,b=this.b;
    for(let i=0;i<n*n;i++){
     const l=left[i],r=right[i],up=top[i],dn=bottom[i];
     const U=u[i],V=v[i];
     a[i]=U+dt*(.1*(U-U*U*U-V+bias)+du*(u[l]+u[r]+u[up]+u[dn]-4*U));
     b[i]=V+dt*(.2*(U-.8*V)+dv*(v[l]+v[r]+v[up]+v[dn]-4*V));
     if(!Number.isFinite(a[i])||!Number.isFinite(b[i])||Math.abs(a[i])>1e3||Math.abs(b[i])>1e3){this.failed=true;return false;}
    }
    this.u=a;this.v=b;this.a=u;this.b=v;this.t+=dt;
   }return true;
  }
  stats(){let min=Infinity,max=-Infinity,sum=0,sq=0;for(const v of this.u){min=Math.min(min,v);max=Math.max(max,v);sum+=v;sq+=v*v;}const mean=sum/this.u.length;return {min,max,mean,sd:Math.sqrt(Math.max(0,sq/this.u.length-mean*mean)),t:this.t,failed:this.failed};}
 }
 // Compute without painting intermediate states. A bounded result is not called
 // stable unless both u and v change little across six consecutive windows.
 function solveFinal(model,options={},progress=()=>{}){
  const started=performance.now(),startT=model.t,limit=options.maxTime||4000,budget=options.budgetMs||12000;
  let lastU=model.u.slice(),lastV=model.v.slice(),stable=0,delta=Infinity;
  let unstable=false;
  for(let y=0;y<model.n&&!unstable;y++)for(let x=0;x<model.n;x++){
   const q=model.scale*(4-2*Math.cos(2*Math.PI*x/model.n)-2*Math.cos(2*Math.PI*y/model.n));
   const a=.1*(1-3*model.equilibrium*model.equilibrium)-.16*q,d=-.16-.16*model.ratio*q;
   if(a+d>0||a*d+.02<0){unstable=true;break;}
  }
  while(model.t-startT<limit){
   if(!model.step(Math.round(8/model.dt)))return {converged:false,failed:true,delta};
   let changeU=0,changeV=0,scaleU=1,scaleV=1;
   for(let i=0;i<model.u.length;i++){
    changeU=Math.max(changeU,Math.abs(model.u[i]-lastU[i]));changeV=Math.max(changeV,Math.abs(model.v[i]-lastV[i]));
    scaleU=Math.max(scaleU,Math.abs(model.u[i]));scaleV=Math.max(scaleV,Math.abs(model.v[i]));
   }
   delta=Math.max(changeU/scaleU,changeV/scaleV);lastU.set(model.u);lastV.set(model.v);
   // Do not mistake a slowly growing unstable uniform state for convergence.
   const mayBeStable=!unstable||model.stats().sd>.01;
   stable=(model.t-startT>=400&&delta<.005&&mayBeStable)?stable+1:0;
   if(stable>=6)return {converged:true,failed:false,delta};
   progress(model.t);
   if(performance.now()-started>=budget)break;
  }
  return {converged:false,failed:false,delta};
 }
 global.PatternModel=PatternModel;
 if(typeof module!=='undefined')module.exports={PatternModel,solveFinal};
 if(typeof document==='undefined')return;
 const funHref='index.html';
 document.querySelectorAll('[data-fun-home]').forEach(a=>a.href=funHref);
 const canvas=document.getElementById('pattern'),ctx=canvas.getContext('2d'),model=new PatternModel(),gain=document.getElementById('gain'),reach=document.getElementById('reach'),state=document.getElementById('state'),more=document.getElementById('more'),clock=document.getElementById('clock');
 const source=document.createElement('canvas');source.width=model.n;source.height=model.n;
 const sourceCtx=source.getContext('2d'),pixels=sourceCtx.createImageData(model.n,model.n);
 const pause=document.getElementById('pause'),finish=document.getElementById('finish'),speed=document.getElementById('speed'),display=document.getElementById('display');
 let worker=null,timer=null,generation=0,hasResult=false,playing=true,fastMode=false,lastStage='';
 const workerSource=PatternModel.toString()+'\n'+solveFinal.toString()+`\nonmessage=({data})=>{
  if(data.command==='start'){
   self.m=new PatternModel(data.n,data.seed);m.bias=data.bias;m.ratio=data.ratio;m.initial=data.initial;m.reset(data.seed);
   self.rate=data.speed;self.running=rate>0;self.stable=0;self.checked=0;self.sent=0;self.previousU=m.u.slice();self.previousV=m.v.slice();self.ceiling=4000;self.paceAt=performance.now();self.debt=0;
   self.unstable=false;
   for(let y=0;y<m.n&&!unstable;y++)for(let x=0;x<m.n;x++){
    const q=m.scale*(4-2*Math.cos(2*Math.PI*x/m.n)-2*Math.cos(2*Math.PI*y/m.n));
    const a=.1*(1-3*m.equilibrium*m.equilibrium)-.16*q,d=-.16-.16*m.ratio*q;
    if(a+d>0||a*d+.02<0){self.unstable=true;break;}
   }
   snapshot(running?'running':'paused');if(running)tick();
  }else if(data.command==='pause'){self.running=false;clearTimeout(self.timer);snapshot('paused');}
  else if(data.command==='resume'){if(!running&&rate>0){self.running=true;self.ceiling=m.t+4000;self.paceAt=performance.now();self.debt=0;tick();}else if(rate===0)snapshot('paused');}
  else if(data.command==='speed'){
   const wasZero=rate===0;self.rate=data.speed;self.paceAt=performance.now();self.debt=0;
   if(rate===0){self.running=false;clearTimeout(self.timer);snapshot('paused');}
   else if(wasZero&&!running){self.running=true;snapshot('running');tick();}
  }
  else if(data.command==='finish'){
   self.running=false;clearTimeout(self.timer);postMessage({busy:true});
   const result=solveFinal(m,{},t=>{if(performance.now()-self.sent>300){postMessage({progress:t});self.sent=performance.now();}});
   snapshot(result.failed?'failed':result.converged?'stable':'bounded');
  }
 };
 function snapshot(status){const u=Float32Array.from(m.u);postMessage({u,t:m.t,status,sd:m.stats().sd},[u.buffer]);self.sent=performance.now();}
 function tick(){
  if(!running)return;
  const now=performance.now(),until=now+12,quantum=16*m.dt;
  // Speed changes the number of stable steps per wall-clock second, not dt.
  self.debt=Math.min(32,debt+Math.min(.25,(now-paceAt)/1000)*rate*4);self.paceAt=now;
  while(debt>=quantum&&performance.now()<until){
   if(!m.step(16)){self.running=false;snapshot('failed');return;}
   self.debt-=quantum;
   if(m.t-self.checked>=8){
    let du=0,dv=0,su=1,sv=1;
    for(let i=0;i<m.u.length;i++){du=Math.max(du,Math.abs(m.u[i]-previousU[i]));dv=Math.max(dv,Math.abs(m.v[i]-previousV[i]));su=Math.max(su,Math.abs(m.u[i]));sv=Math.max(sv,Math.abs(m.v[i]));}
    const eligible=!unstable||m.stats().sd>.01;
    self.stable=(m.t>=400&&Math.max(du/su,dv/sv)<.005&&eligible)?stable+1:0;
    previousU.set(m.u);previousV.set(m.v);self.checked=m.t;
    if(stable>=6){self.running=false;snapshot('stable');return;}
   }
   if(m.t>=ceiling){self.running=false;snapshot('bounded');return;}
  }
  if(performance.now()-sent>=50)snapshot('running');
  self.timer=setTimeout(tick,debt>=quantum?0:8);
 }`;
 const workerURL=URL.createObjectURL(new Blob([workerSource],{type:'text/javascript'}));
 function paint(){
  for(let i=0;i<model.u.length;i++){
   // High contrast is a fixed display transfer function, not PDE sharpening.
   const sharp=display.value==='clear',range=sharp?.16:.8;
   let c=Math.min(1,Math.max(0,(model.u[i]+range)/(2*range)));
   if(sharp)c=c*c*(3-2*c);
   const j=4*i;
   pixels.data[j]=Math.round(249-218*c);pixels.data[j+1]=Math.round(228-189*c);pixels.data[j+2]=Math.round(179-143*c);pixels.data[j+3]=255;
  }
  sourceCtx.putImageData(pixels,0,0);
  // Smooth reconstruction on a Retina-sized display, without changing the PDE
  // equations. A smaller 56^2 domain retains the same spatial spacing.
  const size=Math.min(2048,Math.max(112,Math.round(canvas.getBoundingClientRect().width*(global.devicePixelRatio||1))));
  if(canvas.width!==size||canvas.height!==size){canvas.width=size;canvas.height=size;}
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(source,0,0,canvas.width,canvas.height);
  clock.textContent='t = '+model.t.toFixed(1)+' · '+model.n+' × '+model.n;
 }
 function calculate(){
  const id=++generation;if(worker)worker.terminate();
  canvas.setAttribute('aria-busy','true');more.hidden=true;state.textContent='准备生长动画…';
  playing=true;fastMode=false;pause.disabled=false;finish.disabled=false;pause.textContent='暂停';lastStage='';
  worker=new Worker(workerURL);
  worker.onmessage=({data})=>{
   if(id!==generation)return;
   if(data.busy){fastMode=true;pause.disabled=true;finish.disabled=true;state.textContent='正在快进，仍使用稳定小步长…';return;}
   if(data.progress!==undefined){clock.textContent='计算中 · t = '+data.progress.toFixed(0);return;}
   model.u=data.u;model.t=data.t;hasResult=true;paint();canvas.setAttribute('aria-busy','false');
   playing=data.status==='running';fastMode=false;pause.disabled=['stable','failed'].includes(data.status)||Number(speed.value)===0;finish.disabled=data.status==='failed';pause.textContent=playing?'暂停':'继续';
   const stage=data.status==='running'?(data.sd<.02?'微小扰动正在演化…':data.sd<.3?'花纹开始显现，浓淡差异正在增强…':'花纹正在生长、连接与重新排列…'):data.status==='stable'?(data.sd<.01?'已接近稳定的均匀状态':'花纹已基本稳定 · 可重播生长过程'):data.status==='paused'?'已暂停 · 可比较两种显示方式':data.status==='failed'?'达到数值限制，请调整参数后重试。':'当前结果尚未达到稳定判据，可继续计算。';
   if(stage!==lastStage){state.textContent=stage;lastStage=stage;}
   more.hidden=data.status!=='bounded';state.dataset.converged=String(data.status==='stable');state.dataset.status=data.status;
  };
  worker.onerror=()=>{if(id!==generation)return;state.textContent='计算线程无法运行，请重新打开页面。';canvas.setAttribute('aria-busy','false');worker.terminate();worker=null;};
  worker.postMessage({command:'start',n:model.n,seed:model.seed,bias:model.bias,ratio:model.ratio,initial:model.initial,speed:Number(speed.value)});
 }
 function restart(newSeed=false){
  clearTimeout(timer);generation++;if(worker){worker.terminate();worker=null;}
  model.bias=Number(gain.value);model.ratio=Number(reach.value);model.reset(newSeed?((Math.random()*4294967296)>>>0):model.seed);
  document.getElementById('gainValue').textContent=model.bias.toFixed(3);document.getElementById('reachValue').textContent=Math.sqrt(model.ratio).toFixed(2)+' 倍';
  document.getElementById('parameterSummary').textContent='当前：b = '+model.bias.toFixed(3)+'；r = '+model.ratio.toFixed(1)+'；Dᵤ = 0.16；Dᵥ = '+(.16*model.ratio).toFixed(2)+'。';
  hasResult=false;paint();state.textContent='准备从头演化…';state.dataset.status='starting';state.dataset.converged='false';pause.disabled=true;finish.disabled=true;more.hidden=true;canvas.setAttribute('aria-busy','true');timer=setTimeout(()=>calculate(),180);
 }
 const manualChange=()=>{document.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed','false'));restart();};
 gain.addEventListener('input',manualChange);reach.addEventListener('input',manualChange);document.getElementById('restart').addEventListener('click',()=>restart(true));
 const presets={spots:{bias:.12,ratio:20,initial:'random'},maze:{bias:0,ratio:20,initial:'random'},parallel:{bias:0,ratio:20,initial:'parallel'},diagonal:{bias:0,ratio:20,initial:'diagonal'}};
 document.querySelectorAll('[data-preset]').forEach(button=>button.addEventListener('click',()=>{
  const preset=presets[button.dataset.preset];gain.value=preset.bias;reach.value=preset.ratio;model.initial=preset.initial;
  document.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  document.getElementById('initialNote').textContent=preset.initial==='random'?'初始条件：均匀状态加微小随机扰动。':'初始条件：微小随机扰动＋微弱'+(preset.initial==='parallel'?'水平':'斜向')+'周期扰动；只引导方向，不预画最终条纹。';
  restart();
 }));
 document.getElementById('replay').addEventListener('click',()=>restart());
 pause.addEventListener('click',()=>{if(worker&&!fastMode)worker.postMessage({command:playing?'pause':'resume'});});
 finish.addEventListener('click',()=>{if(worker&&!fastMode)worker.postMessage({command:'finish'});});
 more.addEventListener('click',()=>{if(worker)worker.postMessage({command:'resume'});});
 speed.addEventListener('input',()=>{document.getElementById('speedValue').textContent=speed.value+' / 1000';if(worker)worker.postMessage({command:'speed',speed:Number(speed.value)});});
 display.addEventListener('change',()=>{paint();document.getElementById('colorNote').textContent=display.value==='clear'?'清晰花纹 · 固定高对比色标（仅改变显示）':'原始浓度 · 固定线性色标（连续过渡）';});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing&&worker)worker.postMessage({command:'pause'});});
 new ResizeObserver(()=>{if(hasResult&&canvas.getAttribute('aria-busy')!=='true')paint();}).observe(canvas);
 global.addEventListener('pagehide',e=>{clearTimeout(timer);if(worker)worker.terminate();if(!e.persisted)URL.revokeObjectURL(workerURL);});
 global.addEventListener('pageshow',e=>{if(e.persisted)restart();});
 restart();
})(typeof globalThis!=='undefined'?globalThis:this);
