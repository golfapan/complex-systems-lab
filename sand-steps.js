/* Visible, legal single-toppling schedule for the existing open-boundary sandpile. */
(function(root){
'use strict';
const Base=typeof module!=='undefined'?require('./extra-models.js').Sandpile:root.ExtraModels.Sandpile;
class SandSteps extends Base {
 constructor(scenario='demo',size){
  const demo=scenario==='demo';super(size||(demo?9:48));this.scenario=scenario;
  if(demo){const c=this.n>>1;for(let y=c-1;y<=c+1;y++)for(let x=c-1;x<=c+1;x++)this.grid[y*this.n+x]=3;}
  this.initialMass=this.grid.reduce((a,b)=>a+b,0);this.phase='idle';this.queue=[];this.head=0;
  this.queued=new Uint8Array(this.grid.length);this.footprint=new Uint32Array(this.grid.length);
  this.currentTopplings=0;this.focus=(this.n>>1)*this.n+(this.n>>1);
  this.event={type:'intro',index:this.focus};
 }
 enqueue(i){if(this.grid[i]>=4&&!this.queued[i]){this.queued[i]=1;this.queue.push(i);}}
 add(){
  this.queue=[];this.head=0;this.queued.fill(0);this.footprint.fill(0);this.currentTopplings=0;
  const i=this.scenario==='demo'?(this.n>>1)*this.n+(this.n>>1):(this.rng.next()*this.grid.length)|0;
  const before=this.grid[i];this.grid[i]++;this.grains++;this.focus=i;this.enqueue(i);
  this.phase='added';this.event={type:'added',index:i,before,after:this.grid[i]};
 }
 prepare(){
  while(this.head<this.queue.length){const i=this.queue[this.head++];this.queued[i]=0;
   if(this.grid[i]>=4){this.focus=i;this.phase='ready';this.event={type:'ready',index:i,before:this.grid[i]};return;}
  }
  this.last=this.currentTopplings;if(this.last)this.sizes.push(this.last);if(this.sizes.length>2000)this.sizes.shift();
  this.phase='settled';this.event={type:'settled',index:this.focus,total:this.last};this.queue=[];this.head=0;
 }
 topple(){
  const i=this.focus,n=this.n,x=i%n,y=(i/n)|0,before=this.grid[i],targets=[];
  if(before<4)throw Error('Only an unstable cell may topple.');
  this.grid[i]-=4;this.currentTopplings++;this.footprint[i]++;
  for(const [dx,dy,label] of [[0,-1,'上'],[-1,0,'左'],[1,0,'右'],[0,1,'下']]){
   const xx=x+dx,yy=y+dy;
   if(xx<0||yy<0||xx>=n||yy>=n){this.lost++;targets.push({dx,dy,label,outside:true});continue;}
   const j=yy*n+xx,v=this.grid[j];this.grid[j]++;targets.push({dx,dy,label,index:j,before:v,after:this.grid[j]});this.enqueue(j);
  }
  this.enqueue(i);this.phase='transfer';this.event={type:'transfer',index:i,before,after:this.grid[i],targets};
 }
 step(){
  if(this.phase==='idle'||this.phase==='settled')this.add();
  else if(this.phase==='ready')this.topple();
  else this.prepare();
  return this.event;
 }
 finishCurrent(){
  if(this.phase==='idle')this.step();let budget=10000000;
  while(this.phase!=='settled'&&budget-->0)this.step();
  if(this.phase!=='settled')throw Error('Sandpile relaxation exceeded the calculation budget.');
 }
}
if(typeof module!=='undefined')module.exports=SandSteps;else root.SandSteps=SandSteps;
})(typeof globalThis!=='undefined'?globalThis:this);
