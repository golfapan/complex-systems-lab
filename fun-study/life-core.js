/* Game of Life / Life-like cellular automata. Synchronous Moore-neighbour
 * updates; finite dead boundary by default, optional torus. No network or saves.
 * Pattern credits: LifeWiki; HighLife replicator also documented by D. Eppstein.
 */
(function(global){
 'use strict';
 function parseRule(text){
  const match=/^B([0-8]*)\/S([0-8]*)$/i.exec(text);
  if(!match)throw new Error('Use rule format B3/S23，digits must be 0–8。');
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

global.EN_LIFE={LifeModel,parseRule,ruleText,decodeRLE};
})(globalThis);
