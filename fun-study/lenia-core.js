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
 
global.EN_LENIA={FFT2,ContinuousModel};
})(globalThis);
