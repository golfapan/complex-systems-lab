/* Plain HTML typography for reviewed course notation. No equation engine,
 * network dependency, evaluation of formulas, or simulation-state changes. */
(function () {
  'use strict';
  const bounds = [
    ['∫ₜ₀ᵗ', '∫', 't₀', 't'], ['∫ₓˣ⁺ʰ', '∫', 'x', 'x+h'],
    ['∫ₐᵍ⁽ˣ⁾', '∫', 'a', 'g(x)'], ['∫₀ˣ²', '∫', '0', 'x²'],
    ['∫₋∞^∞', '∫', '−∞', '∞'], ['∫₀^Δt', '∫', '0', 'Δt'],
    ['∫₀^Δ', '∫', '0', 'Δ'], ['∫₀²π', '∫', '0', '2π'],
    ['∫₀∞', '∫', '0', '∞'], ['∫₁∞', '∫', '1', '∞'],
    ['∫₀ˣ', '∫', '0', 'x'], ['∫ₐˣ', '∫', 'a', 'x'],
    ['∫ₐᵇ', '∫', 'a', 'b'], ['∫ₜᵀ', '∫', 't', 'T'],
    ['∫₀ᵗ', '∫', '0', 't'], ['∫₀ᵀ', '∫', '0', 'T'],
    ['∫₀ᴿ', '∫', '0', 'R'], ['∫₀ᴸ', '∫', '0', 'L'],
    ['∫₀ᶻ', '∫', '0', 'z'], ['∫₀¹', '∫', '0', '1'],
    ['∫₀³', '∫', '0', '3'],
    // A domain/path belongs below the operator, not above as an exponent.
    ['∯∂V', '∯', '∂V', ''], ['∮∂D', '∮', '∂D', ''],
    ['∮∂S', '∮', '∂S', ''], ['∯∂Ω', '∯', '∂Ω', ''],
    ['∫∂M', '∫', '∂M', ''], ['∭Ω', '∭', 'Ω', ''],
    ['∫Ω', '∫', 'Ω', ''], ['∫γ', '∫', 'γ', ''],
    ['∬ᴰ', '∬', 'D', ''], ['∬ᴿ', '∬', 'R', ''], ['∬ˢ', '∬', 'S', ''],
    ['∫ᶜ', '∫', 'C', ''], ['∮ᶜ', '∮', 'C', ''],
    ['∫ᴹ', '∫', 'M', ''], ['∫ᵥ', '∫', 'V', '']
  ].sort((a, b) => b[0].length - a[0].length);
  const names = new Set(['Tr', 'min', 'max', 'lim', 'dV']);
  const indexedSymbols = new Map([['fθ', ['f', 'θ']], ['pθ', ['p', 'θ']], ['qφ', ['q', 'φ']], ['pφ', ['p', 'φ']]]);
  function scriptValue(text, start) {
    const open = text[start], close = { '{': '}', '(': ')', '[': ']' }[open];
    if (close) {
      const stack = [close];
      for (let i = start + 1; i < text.length && i - start < 180; i++) {
        const c = text[i];
        if ('{(['.includes(c)) stack.push({ '{': '}', '(': ')', '[': ']' }[c]);
        else if (c === stack[stack.length - 1]) {
          stack.pop();
          if (!stack.length) return { value: text.slice(start + 1, i), end: i + 1 };
        }
      }
      return null;
    }
    const m = text.slice(start).match(/^(?:[−+]?\d+|[A-Za-zΑ-Ωα-ω]+|∞)/);
    return m ? { value: m[0], end: start + m[0].length } : null;
  }
  function parts(text) {
    const out = [], raw = value => {
      if (!value) return;
      if (out.length && out[out.length - 1].kind === 'text') out[out.length - 1].value += value;
      else out.push({ kind: 'text', value });
    };
    let mark = 0, i = 0;
    while (i < text.length) {
      const indexed = indexedSymbols.get(text.slice(i, i + 2));
      if (indexed && (i === 0 || !/[A-Za-zΑ-Ωα-ω]/.test(text[i - 1]))) {
        raw(text.slice(mark, i)); raw(indexed[0]);
        out.push({ kind: 'scripts', lower: indexed[1], upper: '' });
        i += 2; mark = i; continue;
      }
      const bound = bounds.find(b => text.startsWith(b[0], i));
      if (bound) {
        raw(text.slice(mark, i));
        out.push({ kind: 'integral', sign: bound[1], lower: bound[2], upper: bound[3] });
        i += bound[0].length; mark = i; continue;
      }
      if ('∫∬∭∮∯'.includes(text[i])) {
        raw(text.slice(mark, i));
        out.push({ kind: 'integral', sign: text[i], lower: '', upper: '' });
        i++; mark = i; continue;
      }
      // Reviewed uses: equilibrium/optimal/dimensionless stars and conjugation.
      // Preserve multiplication/convolution such as K*u and A*B.
      if (text[i] === '*' && /[A-Za-zΑ-Ωα-ω]$/.test(text.slice(0, i)) && !/[A-Za-zΑ-Ωα-ω]/.test(text[i + 1] || '')) {
        raw(text.slice(mark, i)); out.push({ kind: 'scripts', lower: '', upper: '*' });
        i++; mark = i; continue;
      }
      if (text[i] === '_' || text[i] === '^') {
        const before = text.slice(0, i);
        // A hat, an existing power or a bold Unicode letter still belongs to
        // the base: β̂_MLE, σ²_ε, 𝐱_i. Explicit braces also disambiguate dx^{μ}
        // and juxtaposed coefficients such as ρC_{D}; technical snake_case
        // identifiers without a mathematical base remain plain text.
        const word = before.match(/([A-Za-zΑ-Ωα-ω∂∇Σ\u{1D400}-\u{1D7CB}]+)[\p{M}⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾†′″₀-₉]*$/u)?.[1];
        const explicit = text[i + 1] === '{';
        const allowed = word ? explicit || [...word].length === 1 || names.has(word) || (/[Α-Ωα-ω∂∇Σ]/.test(word) && /[A-Za-z]$/.test(word)) : /[)\]]$/.test(before);
        const first = allowed ? scriptValue(text, i + 1) : null;
        if (first && first.value) {
          raw(text.slice(mark, i));
          const node = { kind: 'scripts', lower: '', upper: '' };
          node[text[i] === '_' ? 'lower' : 'upper'] = first.value;
          let end = first.end;
          if ((text[end] === '_' || text[end] === '^') && text[end] !== text[i]) {
            const second = scriptValue(text, end + 1);
            if (second) { node[text[end] === '_' ? 'lower' : 'upper'] = second.value; end = second.end; }
          }
          out.push(node); i = end; mark = i; continue;
        }
      }
      i++;
    }
    raw(text.slice(mark)); return out;
  }
  function layoutParts(text, formula = false) {
    const input = parts(text);
    if (!formula && !input.some(p => p.kind === 'integral')) return input;
    const out = []; let inIntegral = false, afterIntegral = false;
    const token = /[ \t\u2009\u202f]*([=≈≃≡∝])[ \t\u2009\u202f]*|[ \t\u2009\u202f]*(d\p{L}(?:\([^()\n]{1,24}\))?)(?:(?!\p{L})|(?=d\p{L}(?:d\p{L})*(?!\p{L})))/gu;
    for (const item of input) {
      if (item.kind !== 'text') {
        out.push(item);
        if (item.kind === 'integral') { inIntegral = true; afterIntegral = true; }
        continue;
      }
      let value = item.value;
      if (afterIntegral) value = value.replace(/^[ \t\u00a0\u2009\u202f]+/u, '');
      afterIntegral = false;
      let start = 0;
      for (const match of value.matchAll(token)) {
        const preceding = value.slice(start, match.index);
        if (/[\n。；]/u.test(preceding)) inIntegral = false;
        if (match[2] && (!inIntegral || value[match.index - 1] === '/')) continue;
        if (preceding) out.push({ kind: 'text', value: preceding });
        out.push({ kind: match[1] ? 'relation' : 'differential', value: match[1] || match[2] });
        if (match[1]) inIntegral = false;
        start = match.index + match[0].length;
      }
      if (start < value.length) out.push({ kind: 'text', value: value.slice(start) });
    }
    return out;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { parts, bounds, layoutParts };
  if (typeof document === 'undefined') return;
  const skip = 'script,style,math,svg,pre,code,textarea,input,select,option,title,sup,sub,.text-math,[data-math-plain]';
  function scriptElement(tag, value) {
    const el = document.createElement(tag); el.textContent = value; return el;
  }
  function fragment(items) {
    const f = document.createDocumentFragment(); let group = null;
    const append = el => (group || f).append(el);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'relation') group = null;
      if (item.kind === 'integral' && !group) {
        let end = i + 1;
        while (end < items.length && items[end].kind !== 'relation' && !(items[end].kind === 'text' && /[\n。；]/u.test(items[end].value))) {
          if (items[end].kind === 'differential') break;
          end++;
        }
        if (end < items.length && items[end].kind === 'differential') {
          group = document.createElement('span'); group.className = 'text-math math-integral-term'; f.append(group);
        }
      }
      if (item.kind === 'text') { append(document.createTextNode(item.value)); continue; }
      const el = document.createElement('span'); el.className = 'text-math';
      if (item.kind === 'integral') {
        el.classList.add('math-integral');
        const sign = document.createElement('span'); sign.className = 'math-integral-sign'; sign.textContent = item.sign;
        const limits = document.createElement('span'); limits.className = 'math-integral-limits';
        limits.append(scriptElement('sup', item.upper), scriptElement('sub', item.lower));
        el.append(sign);
        if (item.lower || item.upper) el.append(limits);
      } else if (item.kind === 'relation' || item.kind === 'differential') {
        el.classList.add('math-' + item.kind); el.textContent = item.value;
      } else if (item.lower && item.upper) {
        el.classList.add('math-script-pair');
        el.append(scriptElement('sup', item.upper), scriptElement('sub', item.lower));
      } else {
        el.classList.add('math-script'); el.append(scriptElement(item.upper ? 'sup' : 'sub', item.upper || item.lower));
      }
      append(el);
      if (item.kind === 'differential' && items[i + 1]?.kind !== 'differential') group = null;
    }
    return f;
  }
  function textNode(node) {
    if (!node.parentElement || node.parentElement.closest(skip)) return;
    const formula = !!node.parentElement.closest('.formula,.mathline,.math-block,.physics-formula,.formula-line');
    if (!/[∫∬∭∮∯_^*]|[fpq][θφ]/.test(node.data) && !(formula && /[=≈≃≡∝]/.test(node.data))) return;
    const result = layoutParts(node.data, formula);
    if (result.some(p => p.kind !== 'text')) node.replaceWith(fragment(result));
  }
  function scan(root) {
    if (root.nodeType === 3) { textNode(root); return; }
    if (root.nodeType !== 1 || root.closest(skip)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(textNode);
  }
  function init() {
    scan(document.body);
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'characterData') textNode(record.target);
        else record.addedNodes.forEach(scan);
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();

/* Reviewed Chinese/English terminology for local Fun Study reading pages.
 * Display only: no edits to equations, controls, simulation state, or source data.
 * Shared by existing Chinese pages through math-text.js; English/Share copies are excluded.
 */
(function(){
'use strict';
if(!/^zh/i.test(document.documentElement.lang)||/\/(English|Share|Retiehe)\//i.test(location.pathname))return;
const pairs=[["拉普拉斯算子", "Laplacian"], ["拉普拉斯变换", "Laplace transform"], ["奇异值分解", "singular value decomposition"], ["刚性求解器", "stiff solver"], ["灵敏度分析", "sensitivity analysis"], ["交叉注意力", "cross-attention"], ["雅可比矩阵", "Jacobian matrix"], ["规范不变性", "gauge invariance"], ["规范自由度", "gauge freedom"], ["本构关系", "constitutive relation"], ["本构模型", "constitutive model"], ["正规方程", "normal equations"], ["特征分解", "eigendecomposition"], ["张成空间", "span"], ["正交投影", "orthogonal projection"], ["数值刚性", "numerical stiffness"], ["刚性问题", "stiff problem"], ["刚性方程", "stiff equation"], ["刚性系统", "stiff system"], ["离散伴随", "discrete adjoint"], ["连续伴随", "continuous adjoint"], ["伴随变量", "adjoint variable"], ["伴随方程", "adjoint equation"], ["自动微分", "automatic differentiation"], ["反向传播", "backpropagation"], ["截断误差", "truncation error"], ["向后误差", "backward error"], ["迎风格式", "upwind scheme"], ["残差连接", "residual connection"], ["方程残差", "equation residual"], ["代理模型", "surrogate model"], ["降阶模型", "reduced-order model"], ["模型降阶", "model order reduction"], ["闭合关系", "closure relation"], ["系统辨识", "system identification"], ["可辨识性", "identifiability"], ["可观测性", "observability"], ["可检测性", "detectability"], ["可稳定性", "stabilizability"], ["鲁棒控制", "robust control"], ["零阶保持", "zero-order hold"], ["状态估计", "state estimation"], ["数字孪生", "digital twin"], ["混合系统", "hybrid system"], ["不变测度", "invariant measure"], ["中心流形", "center manifold"], ["渐近展开", "asymptotic expansion"], ["粗糙路径", "rough path"], ["延迟嵌入", "delay embedding"], ["词元嵌入", "token embedding"], ["位置编码", "positional encoding"], ["自注意力", "self-attention"], ["表征学习", "representation learning"], ["似然函数", "likelihood function"], ["后验分布", "posterior distribution"], ["先验分布", "prior distribution"], ["置信区间", "confidence interval"], ["可信区间", "credible interval"], ["可交换性", "exchangeability"], ["混杂因素", "confounder"], ["倾向评分", "propensity score"], ["工具变量", "instrumental variable"], ["梯度下降", "gradient descent"], ["散度定理", "divergence theorem"], ["协变导数", "covariant derivative"], ["幺正演化", "unitary evolution"], ["幺正矩阵", "unitary matrix"], ["自伴算符", "self-adjoint operator"], ["密度算符", "density operator"], ["非侵入式", "non-intrusive"], ["参数反演", "parameter inversion"], ["参数辨识", "parameter identification"], ["嵌入表示", "embedding"], ["内在几何", "intrinsic geometry"], ["外在曲率", "extrinsic curvature"], ["本征函数", "eigenfunction"], ["本征模态", "eigenmode"], ["弱形式", "weak form"], ["强形式", "strong form"], ["黏性解", "viscosity solution"], ["适定性", "well-posedness"], ["正则性", "regularity"], ["正则化", "regularization"], ["条件数", "condition number"], ["广义逆", "generalized inverse"], ["舒尔补", "Schur complement"], ["零空间", "null space"], ["配点法", "collocation method"], ["伴随法", "adjoint method"], ["可控性", "controllability"], ["可达性", "reachability"], ["鲁棒性", "robustness"], ["观测器", "observer"], ["软测量", "soft sensing"], ["不动点", "fixed point"], ["吸引子", "attractor"], ["吸引域", "basin of attraction"], ["极限环", "limit cycle"], ["遍历性", "ergodicity"], ["慢流形", "slow manifold"], ["正规形", "normal form"], ["词嵌入", "word embedding"], ["编码器", "encoder"], ["解码器", "decoder"], ["过平滑", "oversmoothing"], ["过拟合", "overfitting"], ["反事实", "counterfactual"], ["辛结构", "symplectic structure"], ["辛积分", "symplectic integration"], ["作用量", "action"], ["变分法", "calculus of variations"], ["测地线", "geodesic"], ["等变性", "equivariance"], ["退相干", "decoherence"], ["侵入式", "intrusive"], ["硬约束", "hard constraint"], ["软约束", "soft constraint"], ["硬构造", "hard constraint enforcement"], ["软惩罚", "soft penalty"], ["本征值", "eigenvalue"], ["生成元", "generator"], ["弱式", "weak form"], ["强式", "strong form"], ["弱解", "weak solution"], ["熵解", "entropy solution"], ["秩亏", "rank deficiency"], ["伪逆", "pseudoinverse"], ["配点", "collocation points"], ["伴随", "adjoint"], ["残差", "residual"], ["前馈", "feedforward"], ["混叠", "aliasing"], ["联锁", "interlock"], ["分岔", "bifurcation"], ["涌现", "emergence"], ["流形", "manifold"], ["摄动", "perturbation"], ["分词", "tokenization"], ["表征", "representation"], ["混杂", "confounding"], ["梯度", "gradient"], ["散度", "divergence"], ["旋度", "curl"], ["泛函", "functional"], ["挠率", "torsion"], ["纠缠", "entanglement"], ["降阶", "model reduction"], ["联络", "connection"], ["鞍点", "saddle point"], ["环量", "circulation"], ["涡量", "vorticity"], ["驻相", "stationary phase"], ["驻定", "stationary"], ["刚性", "numerical stiffness"], ["病态", "ill-conditioned"]];
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const pattern=new RegExp(pairs.map(p=>escape(p[0])).join('|'),'g');
const glossary=new Map(pairs),seen=new Set(),added=[];
const skip='script,style,svg,math,canvas,pre,code,textarea,input,button,select,option,nav,footer,a,h1,h2,h3,h4,h5,h6,summary,sup,sub,[contenteditable=true],[data-study-term],.formula,.equation,.math,.physics-formula,.mathline,.math-block,.formula-line,.text-math,[data-math-plain]';
const eligible='p,li,dt,dd,td,th,figcaption,blockquote,.lead';
function hasEnglish(text,en){
 const aliases=[en];
 if(en==='automatic differentiation')aliases.push('autodiff');
 if(en==='singular value decomposition')aliases.push('SVD');
 if(en==='zero-order hold')aliases.push('ZOH');
 if(en==='word embedding'||en==='token embedding')aliases.push('embedding');
 return aliases.some(a=>new RegExp('\\b'+escape(a)+'\\b','i').test(text));
}
function annotate(node){
 const parent=node.parentElement;if(!parent||parent.closest(skip)||!parent.closest(eligible))return;
 const original=node.data;pattern.lastIndex=0;let m,last=0;const edits=[];
 while((m=pattern.exec(original))){
  const zh=m[0],en=glossary.get(zh);if(seen.has(en))continue;
  // Do not treat the ordinary phrase 伴随着 as the technical adjoint.
  if(zh==='伴随'&&/^[着同]/.test(original.slice(m.index+zh.length)))continue;
  const context=parent.closest(eligible).textContent;
  if(zh==='刚性'&&(!/数值|求解器|显式|隐式|步长|时间尺度|模态|算法|积分/.test(context)||/^(圆管|杆|体|支撑|结构)/.test(original.slice(m.index+zh.length))))continue;
  if(zh==='病态'&&!/条件数|矩阵|优化|数值/.test(context))continue;
  // Existing English in the same paragraph/cell already provides the bilingual label.
  if(hasEnglish(context,en)){seen.add(en);continue;}
  seen.add(en);edits.push({start:m.index,end:m.index+zh.length,zh,en});
 }
 if(!edits.length)return;
 const f=document.createDocumentFragment();
 for(const e of edits){
  f.append(document.createTextNode(original.slice(last,e.start)));
  const span=document.createElement('span');span.dataset.studyTerm=e.zh;
  span.append(document.createTextNode(e.zh+'（'));
  const english=document.createElement('span');english.lang='en';english.textContent=e.en;english.style.overflowWrap='anywhere';span.append(english,document.createTextNode('）'));f.append(span);last=e.end;added.push({zh:e.zh,en:e.en});
 }
 f.append(document.createTextNode(original.slice(last)));node.replaceWith(f);
}
function scan(root){
 if(root.nodeType===3){annotate(root);return;}
 if(root.nodeType!==1||root.closest(skip))return;
 const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];while(w.nextNode())nodes.push(w.currentNode);nodes.forEach(annotate);
}
function init(){
 scan(document.body);
 const observer=new MutationObserver(records=>{for(const r of records){if(r.type==='characterData')annotate(r.target);else r.addedNodes.forEach(scan);}});
 observer.observe(document.body,{subtree:true,childList:true,characterData:true});
 window.StudyTerms={version:'2026-11-06',get annotations(){return added.slice();},get glossary(){return pairs.slice();}};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
