/* Teaching models in dimensionless units. No network or persistent state. */
(function(g){'use strict';
function rng(seed=73121){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return(s+.5)/4294967296}}
function binomial(n){if(!Number.isInteger(n)||n<0||n>200)throw Error('n range');const p=new Float64Array(n+1);p[0]=2**(-n);for(let k=0;k<n;k++)p[k+1]=p[k]*(n-k)/(k+1);return p}
function walk(n,N,seed=91231){if(!Number.isInteger(n)||n<1||n>120||!Number.isInteger(N)||N<1||N>65536)throw Error('walk range');const random=rng(seed),counts=new Uint32Array(n+1),path=[0];let sum=0,sq=0;for(let i=0;i<N;i++){let x=0;for(let j=0;j<n;j++){x+=random()<.5?-1:1;if(i===0)path.push(x)}counts[(x+n)/2]++;sum+=x;sq+=x*x}return{counts,path,mean:sum/N,msd:sq/N,pmf:binomial(n),n,N}}
function ensemble(n,N=1024,seed=22171){const random=rng(seed),states=new Float64Array(N),bins=new Uint32Array(40);for(let i=0;i<N;i++){let x=.201+(random()-.5)*2e-5;for(let j=0;j<n;j++)x=4*x*(1-x);states[i]=x;bins[Math.min(39,Math.floor(x*40))]++}return{states,bins,n,N}}
function quantum(phi,eta=1,basis='x'){if(!Number.isFinite(phi)||eta<0||eta>1||!['x','z'].includes(basis))throw Error('quantum parameters');const p=basis==='z'?.5:(1+eta*Math.cos(phi))/2;return{p,other:1-p,purity:(1+eta*eta)/2,re:eta*Math.cos(phi)/2,im:-eta*Math.sin(phi)/2}}
function shots(p,N=512,seed=8271){if(p<0||p>1||!Number.isInteger(N)||N<1)throw Error('shots range');const random=rng(seed);let count=0;for(let i=0;i<N;i++)if(random()<p)count++;return count}
function boost(ct,x,beta){if(![ct,x,beta].every(Number.isFinite)||Math.abs(beta)>=1)throw Error('boost range');const gamma=1/Math.sqrt(1-beta*beta);return{ct:gamma*(ct-beta*x),x:gamma*(x-beta*ct),gamma,s2:ct*ct-x*x}}
const api={rng,binomial,walk,ensemble,quantum,shots,boost};g.PhysicsModels=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
