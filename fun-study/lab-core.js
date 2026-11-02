/* Independent educational implementations. No external dependencies or records. */
(function(root){
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),wrap=(v,n)=>(v%n+n)%n;
function random(seed=20261102){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
class Boids {
 constructor(){this.p={separation:1.5,alignment:1.2,cohesion:.7,radius:85,speed:75,count:140};this.reset();}
 reset(){const r=random();this.birds=Array.from({length:this.p.count},()=>{const angle=r()*2*Math.PI;return{x:r()*1000,y:r()*700,vx:Math.cos(angle)*this.p.speed,vy:Math.sin(angle)*this.p.speed};});this.t=0;}
 step(dt=1/60){const p=this.p,next=[];for(let i=0;i<this.birds.length;i++){
  const b=this.birds[i];let ax=0,ay=0,cx=0,cy=0,sx=0,sy=0,count=0;
  for(let j=0;j<this.birds.length;j++){if(i===j)continue;const c=this.birds[j];let dx=c.x-b.x,dy=c.y-b.y;if(dx>500)dx-=1000;if(dx< -500)dx+=1000;if(dy>350)dy-=700;if(dy< -350)dy+=700;const d=Math.hypot(dx,dy);if(d<p.radius&&d>1e-9){ax+=c.vx;ay+=c.vy;cx+=dx;cy+=dy;count++;if(d<26){sx-=dx/(d*d);sy-=dy/(d*d);}}}
  let fx=0,fy=0;
  function steer(x,y,weight){const n=Math.hypot(x,y);if(n<1e-9||!weight)return;const dx=x/n*p.speed-b.vx,dy=y/n*p.speed-b.vy,norm=Math.hypot(dx,dy),scale=Math.min(1,120/Math.max(norm,1e-9));fx+=weight*dx*scale;fy+=weight*dy*scale;}
  if(count){steer(ax/count,ay/count,p.alignment);steer(cx/count,cy/count,p.cohesion);}steer(sx,sy,p.separation);
  const f=Math.hypot(fx,fy);if(f>220){fx*=220/f;fy*=220/f;}let vx=b.vx+fx*dt,vy=b.vy+fy*dt;const norm=Math.hypot(vx,vy)||1;vx=vx/norm*p.speed;vy=vy/norm*p.speed;
  next.push({x:wrap(b.x+vx*dt,1000),y:wrap(b.y+vy*dt,700),vx,vy});
 }this.birds=next;this.t+=dt;}
 order(){let x=0,y=0;for(const b of this.birds){const n=Math.hypot(b.vx,b.vy);x+=b.vx/n;y+=b.vy/n;}return Math.hypot(x,y)/this.birds.length;}
}
class Ant {
 constructor(rule='RL'){this.reset(rule);}
 reset(rule='RL'){if(!/^[RL]{2,12}$/.test(rule))throw Error('Rule must contain 2～12  R/L letters');this.rule=rule;this.cells=new Map();this.x=0;this.y=0;this.dir=0;this.steps=0;}
 step(count=1){for(let i=0;i<count;i++){const key=this.x+','+this.y,state=this.cells.get(key)||0;this.dir=wrap(this.dir+(this.rule[state]==='R'?1:-1),4);const next=(state+1)%this.rule.length;if(next)this.cells.set(key,next);else this.cells.delete(key);this.x+=[0,1,0,-1][this.dir];this.y+=[-1,0,1,0][this.dir];this.steps++;}}
}
const angleWrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
class Pendulum {
 constructor(){this.p={length:1,mass:1,damping:.12,kp:30,kd:6,limit:15,initial:15,control:1};this.reset();}
 reset(){this.state=[this.p.initial*Math.PI/180,0];this.t=0;this.history=[];this.record();}
 torque(state=this.state){return this.p.control?clamp(-this.p.kp*angleWrap(state[0])-this.p.kd*state[1],-this.p.limit,this.p.limit):0;}
 derivative(s){const p=this.p;return[s[1],(p.mass*9.81*p.length*Math.sin(s[0])-p.damping*s[1]+this.torque(s))/(p.mass*p.length*p.length)];}
 step(dt=1/240){const s=this.state,k1=this.derivative(s),k2=this.derivative(s.map((v,i)=>v+dt/2*k1[i])),k3=this.derivative(s.map((v,i)=>v+dt/2*k2[i])),k4=this.derivative(s.map((v,i)=>v+dt*k3[i]));this.state=s.map((v,i)=>v+dt/6*(k1[i]+2*k2[i]+2*k3[i]+k4[i]));this.t+=dt;if(!this.history.length||this.t-this.history.at(-1).t>=1/60-1e-8)this.record();}
 record(){this.history.push({t:this.t,theta:angleWrap(this.state[0]),omega:this.state[1]});while(this.history.length>1200)this.history.shift();}
 linear(){const p=this.p,active=p.control&&p.limit>0,I=p.mass*p.length*p.length,k=(active?p.kp:0)-p.mass*9.81*p.length,c=p.damping+(active?p.kd:0),disc=c*c-4*I*k;const re=-c/(2*I),extra=Math.sqrt(Math.abs(disc))/(2*I);return {I,k,c,disc,re,extra,stable:k>0&&c>0};}
 energy(){const p=this.p;return .5*p.mass*p.length*p.length*this.state[1]**2+p.mass*9.81*p.length*Math.cos(this.state[0]);}
}
// Periodic two-dimensional FFT for the streamfunction/vorticity solver.
class FFT {
 constructor(n){if(n<2||(n&(n-1)))throw Error('Power-of-two grid required');this.n=n;this.rev=new Uint32Array(n);for(let i=0;i<n;i++){let v=i,r=0;for(let k=0;k<Math.log2(n);k++){r=r*2+(v&1);v>>=1;}this.rev[i]=r;}}
 line(re,im,o,s,inv){const n=this.n;for(let i=0;i<n;i++){const j=this.rev[i];if(j>i){const a=o+i*s,b=o+j*s;[re[a],re[b]]=[re[b],re[a]];[im[a],im[b]]=[im[b],im[a]];}}
  for(let len=2;len<=n;len*=2){const t=(inv?2:-2)*Math.PI/len,wr=Math.cos(t),wi=Math.sin(t);for(let st=0;st<n;st+=len){let ar=1,ai=0;for(let k=0;k<len/2;k++){const a=o+(st+k)*s,b=o+(st+k+len/2)*s,br=re[b]*ar-im[b]*ai,bi=re[b]*ai+im[b]*ar;re[b]=re[a]-br;im[b]=im[a]-bi;re[a]+=br;im[a]+=bi;const nr=ar*wr-ai*wi;ai=ar*wi+ai*wr;ar=nr;}}}if(inv)for(let i=0;i<n;i++){re[o+i*s]/=n;im[o+i*s]/=n;}}
 transform(re,im,inv=false){for(let y=0;y<this.n;y++)this.line(re,im,y*this.n,1,inv);for(let x=0;x<this.n;x++)this.line(re,im,x,this.n,inv);}
}
class Fluid {
 constructor(n=128){this.n=n;this.fft=new FFT(n);this.p={viscosity:.04,strength:1};for(const key of ['omega','u','v','red','blue','wr','wi','ur','ui','vr','vi','tmp'])this[key]=new Float64Array(n*n);this.reset('dipole');}
 solve(dt=0){const N=this.n;this.wr.set(this.omega);this.wi.fill(0);this.fft.transform(this.wr,this.wi);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x,kx=(x<=N/2?x:x-N)*2*Math.PI/N,ky=(y<=N/2?y:y-N)*2*Math.PI/N,k2=kx*kx+ky*ky;if(!k2){this.wr[i]=this.wi[i]=this.ur[i]=this.ui[i]=this.vr[i]=this.vi[i]=0;continue;}
   const d=1+this.p.viscosity*dt*k2;this.wr[i]/=d;this.wi[i]/=d;const pr=this.wr[i]/k2,pi=this.wi[i]/k2,dx=x===N/2?0:kx,dy=y===N/2?0:ky;this.ur[i]=-dy*pi;this.ui[i]=dy*pr;this.vr[i]=dx*pi;this.vi[i]=-dx*pr;
  }this.fft.transform(this.ur,this.ui,true);this.fft.transform(this.vr,this.vi,true);this.fft.transform(this.wr,this.wi,true);this.u.set(this.ur);this.v.set(this.vr);this.omega.set(this.wr);
 }
 sample(field,x,y){const N=this.n;x=wrap(x,N);y=wrap(y,N);const x0=Math.floor(x),y0=Math.floor(y),a=x-x0,b=y-y0,x1=(x0+1)%N,y1=(y0+1)%N;return(1-b)*((1-a)*field[y0*N+x0]+a*field[y0*N+x1])+b*((1-a)*field[y1*N+x0]+a*field[y1*N+x1]);}
 advect(field,dt){const N=this.n;for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x;this.tmp[i]=this.sample(field,x-dt*this.u[i],y-dt*this.v[i]);}field.set(this.tmp);}
 step(dt=.2){this.advect(this.omega,dt);this.advect(this.red,dt);this.advect(this.blue,dt);this.solve(dt);this.t+=dt;}
 reset(kind='dipole'){this.omega.fill(0);this.red.fill(0);this.blue.fill(0);this.t=0;const N=this.n;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const xx=x/N,yy=y/N,i=y*N+x;
   if(kind==='shear'){this.omega[i]=.12*Math.cos(yy*2*Math.PI)+.012*Math.sin(xx*4*Math.PI)*Math.sin(yy*2*Math.PI);this.red[i]=Math.exp(-(((yy-.35)/.04)**2));this.blue[i]=Math.exp(-(((yy-.65)/.04)**2));}
   else if(kind==='mix'){this.omega[i]=.12*Math.sin(xx*4*Math.PI)*Math.sin(yy*4*Math.PI)+.03*Math.cos(xx*6*Math.PI+yy*2*Math.PI);this.red[i]=xx<.5?.85:0;this.blue[i]=xx>=.5?.85:0;}
   else {const a=Math.exp(-(((xx-.43)/.065)**2+((yy-.5)/.065)**2)),b=Math.exp(-(((xx-.57)/.065)**2+((yy-.5)/.065)**2));this.omega[i]=.18*(a+(kind==='orbit'?1:-1)*b);this.red[i]=a;this.blue[i]=b;}
  }this.solve();}
 inject(x,y,dx=0,dy=-1){const N=this.n,s=this.p.strength;for(let oy=-7;oy<=7;oy++)for(let ox=-7;ox<=7;ox++){const i=wrap(Math.round(y)+oy,N)*N+wrap(Math.round(x)+ox,N),g=Math.exp(-(ox*ox+oy*oy)/14);this.omega[i]+=s*.018*(dx*oy-dy*ox)*g;this.red[i]=clamp(this.red[i]+.6*g,0,1);this.blue[i]=clamp(this.blue[i]+.2*g,0,1);}this.solve();}
 energy(){let sum=0;for(let i=0;i<this.u.length;i++)sum+=this.u[i]**2+this.v[i]**2;return sum/(2*this.u.length);}
}
const api={Boids,Ant,Pendulum,Fluid,FFT,angleWrap};if(typeof module!=='undefined')module.exports=api;else root.FunModels=api;
})(typeof globalThis!=='undefined'?globalThis:this);
