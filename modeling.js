
/* Previously embedded physical chapters now have a dedicated page. */
(function(){if(typeof location==='undefined')return;const name=location.pathname.split('/').pop();if(!['modeling.html','methodology.html'].includes(name))return;const id=location.hash.slice(1);if(['physics','formula-origins','origins-title','coulomb','practice'].includes(id)||id.startsWith('origin-')){location.replace(new URL('physics-relations.html'+location.search+location.hash,location.href).href);}})();
/* Standalone relationship comparisons, not a new physics simulation. */
(function(){'use strict';
function value(kind,s){if(!Number.isFinite(s)||s<=0)throw new RangeError('Positive finite ratio required.');switch(kind){case'inverse':return 1/s;case'inverse2':return 1/(s*s);case'exp':return Math.exp(1-s);case'linear':return s;case'quadratic':return s*s;default:throw new RangeError('Unknown relationship');}}
function meanAngle(a,b){const r=Math.PI/180,x=Math.cos(a*r)+Math.cos(b*r),y=Math.sin(a*r)+Math.sin(b*r);return Math.hypot(x,y)<1e-10?null:Math.atan2(y,x)/r;}
if(typeof module==='object'&&module.exports)module.exports={value,meanAngle};
if(typeof document==='undefined')return;
const $=id=>document.getElementById(id);if(!$('relation-plot'))return;
let mode='distance';const scale=$('relation-scale'),a=$('angle-a'),b=$('angle-b');
const captions={distance:'三条关系都满足“距离越近，作用越强”，但强度随距离变化的方式不同。',speed:'两条关系都满足“越快阻力越大”。比较的是阻力大小，方向仍应反对相对速度。',alignment:'邻居朝向是圆周上的量。试试 179° 和 −179°，再试完全相反的 0° 和 180°。'};
function textResults(lines){$('compare-results').replaceChildren(...lines.map(s=>{const p=document.createElement('p');p.textContent=s;return p;}));}
function palette(){const el=document.createElement('span');el.style.visibility='hidden';el.style.position='absolute';document.body.append(el);const resolve=k=>{el.style.color='var('+k+')';return getComputedStyle(el).color;};const p={fg:resolve('--text'),muted:resolve('--muted'),line:resolve('--line'),colors:['--green','--violet','--blue'].map(resolve)};el.remove();return p;}
function draw(){
 $('scale-controls').hidden=mode==='alignment';$('angle-controls').hidden=mode!=='alignment';$('compare-description').textContent=captions[mode];
 document.querySelectorAll('[data-compare]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.compare===mode)));
 const canvas=$('relation-plot'),w=canvas.getBoundingClientRect().width,h=canvas.getBoundingClientRect().height,dpr=window.devicePixelRatio||1;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);const p=palette();ctx.font='13px system-ui';
 if(mode==='alignment'){
  const av=+a.value,bv=+b.value,avg=meanAngle(av,bv),naive=(av+bv)/2,cx=w/2,cy=h/2,r=Math.min(w,h)*.32;
  $('angle-a-out').textContent=String(av);$('angle-b-out').textContent=String(bv);
  $('curve-legend').innerHTML='<span>A 朝向</span><span>B 朝向（虚线）</span><span>圆周平均（粗线）</span>';
  ctx.strokeStyle=p.line;ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.moveTo(cx-r-12,cy);ctx.lineTo(cx+r+12,cy);ctx.moveTo(cx,cy-r-12);ctx.lineTo(cx,cy+r+12);ctx.stroke();ctx.fillStyle=p.muted;ctx.fillText('0°',cx+r+3,cy+20);ctx.fillText('90°',cx-10,cy-r-12);
  function arrow(deg,color,width,dash,len){const angle=deg*Math.PI/180,x=cx+len*Math.cos(angle),y=cy-len*Math.sin(angle);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(x-10*Math.cos(angle-.4),y+10*Math.sin(angle-.4));ctx.lineTo(x,y);ctx.lineTo(x-10*Math.cos(angle+.4),y+10*Math.sin(angle+.4));ctx.stroke();}
  arrow(av,p.colors[0],2,[],r);arrow(bv,p.colors[1],2,[6,4],r*.9);if(avg!==null)arrow(avg,p.colors[2],4,[],r*.72);
  textResults(['直接平均角度数值：('+av+'+'+bv+')/2='+naive.toFixed(1)+'°。','先平均方向向量：'+(avg===null?'向量和为零，没有唯一平均方向。':avg.toFixed(1)+'°。'),'方向是周期变量，±180° 是同一方向；邻居完全相反时不能凭空指定统一朝向。']);return;
 }
 const s=+scale.value,curves=mode==='distance'?[['inverse','1/s'],['inverse2','1/s²'],['exp','exp(1−s)']]:[['linear','s'],['quadratic','s²']];
 $('scale-out').textContent=s.toFixed(1);$('scale-label').textContent=mode==='distance'?'距离比例 s=r/r₀':'速率比例 s=|vrel|/v₀';
 $('curve-legend').replaceChildren(...curves.map(([k,name])=>{const span=document.createElement('span');span.textContent=name;return span;}));
 const left=45,right=w-18,top=30,bottom=h-42,ymax=mode==='distance'?4.4:9.8,px=x=>left+(x-.5)/2.5*(right-left),py=y=>bottom-y/ymax*(bottom-top);
 ctx.strokeStyle=p.line;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left,top);ctx.lineTo(left,bottom);ctx.lineTo(right,bottom);ctx.stroke();ctx.fillStyle=p.muted;
 [0,.5,1].forEach(r=>{const y=ymax*r;ctx.fillText(y.toFixed(1),4,py(y)+4);});[.5,1,2,3].forEach(x=>ctx.fillText(x.toFixed(1),px(x)-8,bottom+22));ctx.fillStyle=p.fg;ctx.fillText('归一化强度',left,18);ctx.fillText('比例 s',right-38,h-4);
 ctx.strokeStyle=p.line;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(px(s),top);ctx.lineTo(px(s),bottom);ctx.stroke();ctx.setLineDash([]);
 curves.forEach(([kind],i)=>{ctx.strokeStyle=p.colors[i];ctx.lineWidth=2.4;ctx.beginPath();for(let j=0;j<=200;j++){const x=.5+2.5*j/200,y=value(kind,x);if(j)ctx.lineTo(px(x),py(y));else ctx.moveTo(px(x),py(y));}ctx.stroke();ctx.fillStyle=p.colors[i];ctx.beginPath();ctx.arc(px(s),py(value(kind,s)),5,0,Math.PI*2);ctx.fill();});
 textResults(['当前比例 s='+s.toFixed(1)+'；各关系均以 s=1 时的强度为 1。',...curves.map(([kind,name])=>name+'：'+value(kind,s).toFixed(4)),mode==='distance'?'同一种单调趋势，对应不止一种幂次或函数；具体形式来自物理依据、设计假设或数据检验。':'线性与平方阻力适用条件不同；二者都必须按相对速度的反方向施加，不能只看正数曲线。']);
}
document.querySelectorAll('[data-compare]').forEach(btn=>btn.addEventListener('click',()=>{mode=btn.dataset.compare;draw();}));[scale,a,b].forEach(el=>el.addEventListener('input',draw));
const search=$('pattern-search'),group=$('pattern-group'),cards=[...document.querySelectorAll('[data-pattern]')];
function filter(){const q=search.value.trim().toLowerCase(),g=group.value;let count=0;for(const card of cards){const match=(g==='all'||g===card.dataset.pattern)&&card.textContent.toLowerCase().includes(q);card.hidden=!match;if(match)count++;}document.querySelectorAll('[data-pattern-group]').forEach(section=>section.hidden=![...section.querySelectorAll('[data-pattern]')].some(card=>!card.hidden));$('pattern-count').textContent=count+' / 26 类关系'+(count===0?'；可清空搜索或显示全部。':'');}
function clear(){search.value='';group.value='all';filter();}
search.addEventListener('input',filter);group.addEventListener('change',filter);$('pattern-clear').addEventListener('click',clear);
document.addEventListener('click',event=>{const anchor=event.target.closest('a[href^="#"]');if(anchor&&(anchor.hash.startsWith('#p-')||anchor.hash.startsWith('#group-')))clear();});
let oldWidth=0;new ResizeObserver(entries=>{const width=entries[0].contentRect.width;if(Math.abs(width-oldWidth)>.5){oldWidth=width;draw();}}).observe($('compare'));
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',draw);filter();draw();
})();
