/* Common seven-step descriptions. Does not read or modify simulation state. */
(function(root){'use strict';
const labels=['问题与边界','状态、输入与参数','时间、空间与随机性','作用机制与依据','方程与更新顺序','初始、边界与求解','检查、验证与 What if'];
function render(id,extra={}){
 const d=root.ModelMethodData?.profiles.find(x=>x.id===id);if(!d)return;
 let host=document.getElementById('model-method');
 if(!host){host=document.createElement('section');host.id='model-method';host.className='model-method';}
 host.replaceChildren();host.dataset.modelId=id;
 const add=(tag,text,parent=host)=>{const el=document.createElement(tag);el.textContent=text;parent.append(el);return el;};
 add('span',d.kind).className='method-kind';add('h2','怎样建立这个模型？');
 const intro=add('p','按同一套七步，从问题走到方程。');const link=add('a','查看建模方法与常见关系 →',intro);link.href='methodology.html#steps';
 const values=[d.question+' '+d.boundary,d.state+' '+d.params,d.representation,d.mechanism,d.formula,d.setup,d.check];
 const list=add('ol','');list.className='method-local-steps';
 labels.forEach((label,i)=>{const row=add('li','',list);add('h3',label,row);add(i===4?'pre':'p',values[i],row);});
 const question=add('div','');question.className='method-whatif';add('b','What if · 先预测，再改变一个条件',question);add('p',d.whatif,question);
 const relations=add('p','本模型的关系：');d.terms.forEach((term,i)=>{const a=add('a',({neighbor:'邻域',power:'距离权重',align:'方向对齐',cohere:'接近群体','target-speed':'目标跟随',threshold:'阈值',advect:'平流',diffuse:'扩散',balance:'收支',sine:'周期角度','linear-drag':'线性阻力',feedback:'反馈',nonlinear:'非线性',logistic:'密度制约',gradient:'梯度',decay:'衰减',reaction:'反应',random:'随机',phase:'相位耦合',probability:'概率',learn:'学习',kernel:'局部感知',reinforce:'强化'})[term]||term,relations);a.href='modeling.html#p-'+term;if(i<d.terms.length-1)relations.append(' · ');});
 if(extra.limits){const details=add('details','');add('summary','模型范围与其他实验的联系',details);add('p',extra.limits,details);if(extra.connection)add('p',extra.connection,details);}
 const old=document.getElementById('model-reading');
 if(old){old.replaceWith(host);}else{
  const math=location.pathname.endsWith('/extensions.html')?null:document.querySelector('[data-model-guide],#model-guide,#logistic-problem');
  if(math)math.before(host);else{const animation=document.querySelector('#world,#pattern');const panel=animation?.closest('.layout');if(panel)panel.after(host);else document.querySelector('main').append(host);}
 }
 return host;
}
root.ModelMethod={render};
if(typeof document==='undefined')return;
function init(){
 const select=document.getElementById('model-select');
 if(select){const cards=[...document.querySelectorAll('[data-model]')];function choose(id){select.value=id;for(const el of cards){el.hidden=id!=='all'&&el.dataset.model!==id;if(id!=='all'&&!el.hidden)el.open=true;}document.getElementById('model-status').textContent=id==='all'?'26 个模型 · 按同一套七步展开':'当前模型 · 七步完整对照';}
 select.addEventListener('change',()=>choose(select.value));
 document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#model-"]');if(a){choose(a.hash.slice(7));document.getElementById(a.hash.slice(1))?.scrollIntoView({block:'start'});}});
 function fromHash(){if(location.hash.startsWith('#model-')){const id=location.hash.slice(7);if(cards.some(x=>x.dataset.model===id))choose(id);}}
 fromHash();window.addEventListener('hashchange',fromHash);document.getElementById('print-method').addEventListener('click',()=>window.print());
 }else{const id=location.pathname.split('/').pop().replace(/\.html$/,'');if(id!=='extensions')render(id);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(globalThis);
