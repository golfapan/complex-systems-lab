/* Single-channel Lenia-type teaching model, independently implemented.
 * Ring kernel + Gaussian growth + projected Euler; NOT Conway interpolation.
 * FFT only accelerates periodic convolution. No external code, seed or service.
 */
(function(global){
 'use strict';
 class FFT2 {
  constructor(n){if(n<2||(n&(n-1)))throw Error('FFT size must be power of 2');this.n=n;this.rev=new Uint32Array(n);const bits=Math.log2(n);for(let i=0;i<n;i++){let v=i,r=0;for(let k=0;k<bits;k++){r=(r<<1)|(v&1);v>>=1;}this.rev[i]=r;}}
  line(re,im,offset,stride,inverse){
   const n=this.n;for(let i=0;i<n;i++){const j=this.rev[i];if(j>i){const a=offset+i*stride,b=offset+j*stride;[re[a],re[b]]=[re[b],re[a]];[im[a],im[b]]=[im[b],im[a]];}}
   for(let len=2;len<=n;len*=2){const theta=(inverse?2:-2)*Math.PI/len,wr=Math.cos(theta),wi=Math.sin(theta);for(let start=0;start<n;start+=len){let ar=1,ai=0;for(let k=0;k<len/2;k++){const a=offset+(start+k)*stride,b=offset+(start+k+len/2)*stride;const br=re[b]*ar-im[b]*ai,bi=re[b]*ai+im[b]*ar;re[b]=re[a]-br;im[b]=im[a]-bi;re[a]+=br;im[a]+=bi;const nr=ar*wr-ai*wi;ai=ar*wi+ai*wr;ar=nr;}}}
   if(inverse)for(let i=0;i<n;i++){const j=offset+i*stride;re[j]/=n;im[j]/=n;}
  }
  transform(re,im,inverse=false){for(let y=0;y<this.n;y++)this.line(re,im,y*this.n,1,inverse);for(let x=0;x<this.n;x++)this.line(re,im,x,this.n,inverse);}
 }
 class ContinuousModel {
  constructor(n=128){this.n=n;this.fft=new FFT2(n);this.a=new Float64Array(n*n);this.potential=new Float64Array(n*n);this.growth=new Float64Array(n*n);this.workR=new Float64Array(n*n);this.workI=new Float64Array(n*n);this.kernel=new Float64Array(n*n);this.kr=new Float64Array(n*n);this.ki=new Float64Array(n*n);this.mu=.15;this.sigma=.025;this.dt=.1;this.t=0;this.steps=0;this.setRadius(10);}
  setRadius(radius){
   if(radius<=0||radius>this.n/2)throw Error('Invalid radius');this.radius=radius;let total=0;
   for(let y=0;y<this.n;y++)for(let x=0;x<this.n;x++){const xx=x>this.n/2?x-this.n:x,yy=y>this.n/2?y-this.n:y,d=Math.hypot(xx,yy)/radius;const value=d<1?Math.exp(-.5*((d-.5)/.15)**2):0;this.kernel[y*this.n+x]=value;total+=value;}
   for(let i=0;i<this.kernel.length;i++)this.kernel[i]/=total;
   this.kr.set(this.kernel);this.ki.fill(0);this.fft.transform(this.kr,this.ki);
  }
  field(){
   this.workR.set(this.a);this.workI.fill(0);this.fft.transform(this.workR,this.workI);
   for(let i=0;i<this.a.length;i++){const r=this.workR[i],v=this.workI[i];this.workR[i]=r*this.kr[i]-v*this.ki[i];this.workI[i]=r*this.ki[i]+v*this.kr[i];}
   this.fft.transform(this.workR,this.workI,true);
   for(let i=0;i<this.a.length;i++){const u=Math.min(1,Math.max(0,this.workR[i]));this.potential[i]=u;this.growth[i]=2*Math.exp(-.5*((u-this.mu)/this.sigma)**2)-1;}
  }
  step(count=1){for(let k=0;k<count;k++){this.field();for(let i=0;i<this.a.length;i++)this.a[i]=Math.min(1,Math.max(0,this.a[i]+this.dt*this.growth[i]));this.t+=this.dt;this.steps++;}}
  seed(kind='blob',seed=20261102){
   this.a.fill(0);let s=seed>>>0;const random=()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296;};
   const N=this.n;
   for(let y=0;y<N;y++)for(let x=0;x<N;x++){
    const xx=x-N/2,yy=y-N/2,r=Math.hypot(xx,yy);let v=0;
    if(kind==='ring')v=.65*Math.exp(-.5*((r-8)/2)**2);
    else if(kind==='twins')v=.8*Math.exp(-((xx-12)**2+yy*yy)/20)+.8*Math.exp(-((xx+12)**2+yy*yy)/20);
    else if(kind==='noise')v=Math.abs(xx)<20&&Math.abs(yy)<20?random()*.65:0;
    else v=.8*Math.exp(-(xx*xx+yy*yy)/20)*(1+.03*Math.sin(.6*xx+.3*yy));
    this.a[y*N+x]=Math.min(1,v);
   }this.t=0;this.steps=0;this.field();
  }
  stats(){let total=0,max=0;for(const v of this.a){total+=v;max=Math.max(max,v);}return {total,max,mean:total/this.a.length,t:this.t,steps:this.steps};}
 }
 if(typeof module!=='undefined')module.exports={FFT2,ContinuousModel};
 if(typeof document==='undefined')return;
 const model=new ContinuousModel(),canvas=document.getElementById('world'),ctx=canvas.getContext('2d'),buffer=document.createElement('canvas');buffer.width=buffer.height=model.n;
 const bctx=buffer.getContext('2d'),pixels=bctx.createImageData(model.n,model.n),speed=document.getElementById('speed'),mu=document.getElementById('mu'),sigma=document.getElementById('sigma'),radius=document.getElementById('radius'),dt=document.getElementById('dt'),play=document.getElementById('play'),status=document.getElementById('status');
 let running=true,kind='blob',seed=20261102,last=0,debt=0,drawAt=0,probe={x:64,y:64},extent=64,view='a',palette=null,lastMessage='';
 const probeColor=document.createElement('span');probeColor.hidden=true;document.body.append(probeColor);
 function color(name){probeColor.style.color='var('+name+')';const rgb=getComputedStyle(probeColor).color.match(/[\d.]+/g);return rgb.slice(0,3).map(Number);}
 function setRunning(value){running=value;last=0;debt=0;play.textContent=value?'暂停':'继续';play.setAttribute('aria-pressed',String(value));}
 function message(text){if(text!==lastMessage){status.textContent=text;lastMessage=text;}}
 function curve(){
  const width=340,height=150,left=35,right=326,top=12,bottom=126,span=1;
  const x=u=>left+u/span*(right-left),y=g=>bottom-(g+1)/2*(bottom-top);let path='';
  for(let i=0;i<=500;i++){const u=i/500*span,g=2*Math.exp(-.5*((u-model.mu)/model.sigma)**2)-1;path+=(i?'L':'M')+x(u).toFixed(2)+','+y(g).toFixed(2);}
  document.getElementById('growthPath').setAttribute('d',path);document.getElementById('peakLine').setAttribute('x1',x(model.mu));document.getElementById('peakLine').setAttribute('x2',x(model.mu));
  const u=model.potential[probe.y*model.n+probe.x];document.getElementById('sampleDot').setAttribute('cx',x(u));document.getElementById('sampleDot').setAttribute('cy',y(2*Math.exp(-.5*((u-model.mu)/model.sigma)**2)-1));
 }
 function render(){
  if(!palette)palette={low:color('--low'),high:color('--high'),negative:color('--negative')};
  const field=view==='u'?model.potential:view==='g'?model.growth:model.a;
  for(let i=0;i<field.length;i++){
   const amount=view==='g'?Math.abs(field[i]):Math.max(0,Math.min(1,field[i]));const high=view==='g'&&field[i]<0?palette.negative:palette.high;
   for(let c=0;c<3;c++)pixels.data[4*i+c]=Math.round(palette.low[c]*(1-amount)+high[c]*amount);pixels.data[4*i+3]=255;
  }bctx.putImageData(pixels,0,0);
  const size=Math.max(128,Math.min(1600,Math.round(canvas.getBoundingClientRect().width*(global.devicePixelRatio||1))));if(canvas.width!==size){canvas.width=canvas.height=size;}
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';const start=(model.n-extent)/2;
  ctx.drawImage(buffer,start,start,extent,extent,0,0,size,size);
  const px=(probe.x-start+.5)/extent*size,py=(probe.y-start+.5)/extent*size;ctx.strokeStyle='rgb('+palette.high.join(',')+')';ctx.lineWidth=2*(global.devicePixelRatio||1);ctx.beginPath();ctx.arc(px,py,5*(global.devicePixelRatio||1),0,2*Math.PI);ctx.stroke();
  if(document.getElementById('range').checked){ctx.setLineDash([5,5]);ctx.beginPath();ctx.arc(px,py,model.radius/extent*size,0,2*Math.PI);ctx.stroke();ctx.setLineDash([]);}
  const stats=model.stats(),i=probe.y*model.n+probe.x;
  document.getElementById('time').textContent=model.t.toFixed(2);document.getElementById('activity').textContent=stats.total.toFixed(1);document.getElementById('steps').textContent=model.steps;
  document.getElementById('sample').textContent='所选点：a = '+model.a[i].toFixed(3)+'；U = '+model.potential[i].toFixed(3)+'；G(U) = '+model.growth[i].toFixed(3);
  curve();
  if(stats.max<1e-8&&2*Math.exp(-.5*(model.mu/model.sigma)**2)-1<=0){setRunning(false);message('当前活性已接近零，可改参数或重播；并非每组条件都能维持结构。');}
 }
 function parameters(){model.mu=Number(mu.value);model.sigma=Number(sigma.value);model.dt=Number(dt.value);if(model.radius!==Number(radius.value))model.setRadius(Number(radius.value));for(const [id,v] of [['muValue',model.mu.toFixed(3)],['sigmaValue',model.sigma.toFixed(3)],['radiusValue',model.radius+' 格'],['dtValue',model.dt.toFixed(2)]])document.getElementById(id).textContent=v;model.field();render();}
 function reset(){model.seed(kind,seed);probe={x:64,y:64};debt=0;last=0;setRunning(true);message('连续演化中 · 柔和颜色表示 0～1 的活性，不是生死两色。');render();}
 const presets={blob:{kind:'blob',mu:.15,sigma:.025,radius:10},ring:{kind:'ring',mu:.15,sigma:.025,radius:10},twins:{kind:'twins',mu:.15,sigma:.025,radius:10},fade:{kind:'blob',mu:.4,sigma:.012,radius:10},noise:{kind:'noise',mu:.15,sigma:.025,radius:10}};
 document.querySelectorAll('[data-preset]').forEach(button=>button.addEventListener('click',()=>{const p=presets[button.dataset.preset];kind=p.kind;mu.value=p.mu;sigma.value=p.sigma;radius.value=p.radius;parameters();reset();document.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
 [mu,sigma,radius,dt].forEach(input=>input.addEventListener('input',()=>{setRunning(false);parameters();document.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed','false'));message('参数已改变，当前状态保留；继续演化可观察影响，也可从头重播。');}));
 play.addEventListener('click',()=>{if(Number(speed.value)===0){speed.value=10;document.getElementById('speedValue').textContent='10 / 1000';}setRunning(!running);model.field();render();message(running?'连续演化中…':'已暂停；点击图中任意位置查看该点的邻域和增长率。');});
 document.getElementById('replay').addEventListener('click',reset);
 document.getElementById('step').addEventListener('click',()=>{setRunning(false);model.step();model.field();message('已推进一个数值小步；t 增加 Δt，而不是康威的一整代。');render();});
 document.getElementById('perturb').addEventListener('click',()=>{setRunning(false);const i=probe.y*model.n+probe.x;model.a[i]=Math.min(1,model.a[i]+.01);model.field();message('所选位置增加了 0.01 活性，其他位置不变；继续观察小扰动的影响。');render();});
 speed.addEventListener('input',()=>{document.getElementById('speedValue').textContent=speed.value+' / 1000';debt=0;last=0;if(Number(speed.value)===0){setRunning(false);model.field();render();message('速度为 0，已暂停。');}else setRunning(true);});
 document.getElementById('view').addEventListener('change',e=>{view=e.target.value;render();});document.getElementById('zoom').addEventListener('change',e=>{extent=Number(e.target.value);render();});document.getElementById('range').addEventListener('change',render);
 canvas.addEventListener('click',e=>{const r=canvas.getBoundingClientRect(),start=(model.n-extent)/2;probe={x:Math.min(127,Math.max(0,Math.floor(start+(e.clientX-r.left)/r.width*extent))),y:Math.min(127,Math.max(0,Math.floor(start+(e.clientY-r.top)/r.height*extent)))};render();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){setRunning(false);message('离开页面已暂停，返回后点继续。');}});new ResizeObserver(render).observe(canvas);global.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{palette=null;render();});
 function frame(now){if(!last)last=now;const elapsed=Math.min(.2,(now-last)/1000);last=now;
  if(running&&Number(speed.value)>0&&!document.hidden){debt=Math.min(5,debt+elapsed*Number(speed.value)*.5);const deadline=performance.now()+10;let count=0;while(debt>=model.dt&&performance.now()<deadline&&count<30){model.step();debt-=model.dt;count++;}if(count&&now-drawAt>50){model.field();render();drawAt=now;}}
  requestAnimationFrame(frame);
 }
 parameters();reset();requestAnimationFrame(frame);
})(typeof globalThis!=='undefined'?globalThis:this);
