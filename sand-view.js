(function(root){
'use strict';
const colors=['#1e3796','#62657a','#a7945d','#ebc341'],pending='#ef8d32',active='#ef88b6',trail='#5ce3d1';
const $=s=>document.querySelector(s);
function draw(ctx,m){
 const n=m.n,cell=ctx.canvas.width/n,left=0,e=m.event;
 for(let i=0;i<m.grid.length;i++){
  const x=left+(i%n)*cell,y=Math.floor(i/n)*cell,h=m.grid[i];
  ctx.fillStyle=h>=4?pending:colors[h];ctx.fillRect(x,y,cell,cell);
  if(n<=12){ctx.strokeStyle='#14231f66';ctx.lineWidth=1;ctx.strokeRect(x,y,cell,cell);}
  if(m.footprint[i]){ctx.strokeStyle=trail;ctx.lineWidth=n<=12?3:1.4;ctx.strokeRect(x+1.5,y+1.5,cell-3,cell-3);}
  if(n<=12){ctx.fillStyle=h===0?'#ffffff':'#101a18';ctx.font=`bold ${Math.round(cell*.38)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(h,x+cell/2,y+cell/2);}
 }
 const x=left+(e.index%n+.5)*cell,y=(Math.floor(e.index/n)+.5)*cell;
 ctx.strokeStyle=e.type==='transfer'?active:e.type==='ready'?pending:'#fff';ctx.lineWidth=n<=12?5:3;
 ctx.strokeRect(x-cell/2+3,y-cell/2+3,cell-6,cell-6);
 if(e.type==='transfer'){
  for(const t of e.targets){const ex=x+t.dx*cell*.75,ey=y+t.dy*cell*.75,sx=x+t.dx*cell*.28,sy=y+t.dy*cell*.28;
   ctx.strokeStyle=active;ctx.fillStyle=active;ctx.lineWidth=n<=12?4:2;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.stroke();
   const a=Math.atan2(t.dy,t.dx),len=n<=12?10:5;ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex-len*Math.cos(a-.5),ey-len*Math.sin(a-.5));ctx.lineTo(ex-len*Math.cos(a+.5),ey-len*Math.sin(a+.5));ctx.closePath();ctx.fill();
  }
 }
 ctx.textAlign='left';ctx.textBaseline='alphabetic';
}
function describe(m){const e=m.event,row=Math.floor(e.index/m.n)+1,col=e.index%m.n+1,pos=`第${row}行、第${col}列`;
 if(e.type==='intro')return m.scenario==='demo'?'准备：中心和八个邻格各有3粒。点“下一小步”，先在中心加1粒。':'准备：每格2粒。点“下一小步”在随机位置加1粒。';
 if(e.type==='added')return `① 加一粒：${pos}，${e.before}→${e.after}粒。${e.after>=4?'已达到阈值，下一步标出待倾倒格。':'未满4粒，下一步检查是否稳定。'}`;
 if(e.type==='ready')return `② 待倾倒：橙色框内的${pos}有${e.before}粒。下一步本格减4，向上、下、左、右各送1粒。`;
 if(e.type==='transfer')return `③ 正在展示第${m.currentTopplings}次倾倒：粉框${pos}，${e.before}→${e.after}粒；四个方向各送1粒。${e.targets.some(t=>t.outside)?'越过边缘的沙已计入流失。':'邻格收到沙后若达到4粒，会接着倾倒。'}`;
 return e.total?`④ 本场结束：共${e.total}次倾倒，青色边框保留本场足迹。所有格子都少于4粒；这时才允许加下一粒。`:'④ 已稳定：这粒沙没有触发倾倒。下一步才会加另一粒。';
}
function update(m){
 $('#sand-phase').textContent=describe(m);$('#sand-scenario-note').textContent=m.scenario==='demo'?'9×9教学起点：中心3×3区域各3粒，其余各2粒；每次在中心加沙。用于看清连锁，不代表长期随机统计。':'48×48原始随机模式：初始每格2粒；前一场结束后，才在随机格加下一粒。';
 const e=m.event,n=m.n,x=e.index%n,y=(e.index/n)|0,cells=[];
 for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
  const cross=dx===0||dy===0,xx=x+dx,yy=y+dy,center=dx===0&&dy===0;
  if(!cross){cells.push('<div class="sand-empty" aria-hidden="true"></div>');continue;}
  const outside=xx<0||yy<0||xx>=n||yy>=n,t=e.targets?.find(t=>t.dx===dx&&t.dy===dy);
  let label=center?'本格':dy===-1?'上邻格':dy===1?'下邻格':dx===-1?'左邻格':'右邻格';
  let value=outside?'边界外':String(m.grid[yy*n+xx]),kind=center&&e.type==='transfer'?'sand-active':'';
  if(center&&e.type==='transfer')value=`${e.before} → ${e.after}`;
  else if(center&&e.type==='added')value=`${e.before} → ${e.after}`;
  else if(e.type==='transfer'&&t){value=outside?'流出1粒':`${t.before} → ${t.after}`;label+=outside?'':' +1';kind='sand-received';}
  cells.push(`<div class="sand-local-cell ${kind}"><small>${label}</small><b>${value}</b></div>`);
 }
 $('#sand-local').innerHTML=cells.join('');$('#sand-inspector-title').textContent=e.type==='transfer'?'这一次：本格减4，四邻各加1':'观察当前格与它的四个邻居';
 $('#sand-finish').disabled=m.phase==='idle'||m.phase==='settled';
 $('#sand-counter').textContent=`本场已倾倒 ${m.currentTopplings} 次 · 其中不同格子 ${m.footprint.reduce((a,b)=>a+(b>0),0)} 个`;
 $('#world').setAttribute('aria-label',`沙堆${n}乘${n}格。${describe(m)}`);
}
root.SandView={draw,update,describe};
})(globalThis);
