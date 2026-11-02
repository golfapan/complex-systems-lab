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
 
global.EN_PATTERN={PatternModel,solveFinal};
})(globalThis);
