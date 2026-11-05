/* Selected English reading sources, checked 2026-11-03.
 * Credit applies to model ideas and explanations. Local simulations retain their
 * own parameters and numerical methods; source articles are linked, not copied.
 * Indexed author/repository pages can restrict automated retrieval. */
(function(root){'use strict';
const CE='https://www.complexity-explorables.org/';
const pend='https://underactuated.mit.edu/pend.html';
const cart='https://underactuated.mit.edu/acrobot.html';
const chaos='https://ocw.mit.edu/courses/8-09-classical-mechanics-iii-fall-2014/a3b977a17091d225ee1870d100c7a308_MIT8_09F14_Chapter_7.pdf';
const fhn='https://lcnwww.epfl.ch/gerstner/SPNM/node22.html';
const bark='https://warwick.ac.uk/fac/sci/maths/people/staff/dwight_barkley/home_page/papers/barkley_-_1991_-_phys_d_nonlinear_phenom.pdf';
const jones='https://uwe-repository.worktribe.com/output/980579/characteristics-of-pattern-formation-and-evolution-in-approximations-of-physarum-transport-networks';
const nca='https://distill.pub/2020/growing-ca/';
const wolfram='https://www.wolframscience.com/nks/';
const topics={
turing:['Hopfed Turingles',CE+'explorables/hopfed-turingles/','Dirk Brockmann · Complexity Explorables','激活、抑制与扩散的入门讲解。本页采用同类方程的固定教学参数。',[
 ['相平面与 FitzHugh–Nagumo 模型',fhn,'EPFL · Gerstner & Kistler'],
 ['The Chemical Basis of Morphogenesis','https://www.damtp.cam.ac.uk/user/gold/pdfs/teaching/old_literature/Turing1952.pdf','Alan Turing · 1952 原论文 PDF']]],
life:['Conway’s Game of Life',CE+'explorables/nah-dah-dah-nah-nah-opus-1984/','Dirk Brockmann · Complexity Explorables','中文从邻居计数与生死规则入门；预设和边界按本页设置。',[
 ['LifeWiki：规则与图案库','https://conwaylife.com/wiki/Conway%27s_Game_of_Life','查滑翔机、振荡器与更多图案'],
 ['二维元胞自动机',wolfram+'chap-5--two-dimensions-and-beyond/','Stephen Wolfram · 更多规则与图案']]],
continuous:['Lenia', 'https://chakazul.github.io/lenia.html','Bert Chan · 模型作者','中文介绍连续活性、邻域感知与增长。本页使用几何种子的教学变体。',[
 ['Lenia: Biology of Artificial Life','https://arxiv.org/abs/1812.05433','Bert Chan · 原论文'],
 ['Growing Neural Cellular Automata',nca,'拓宽：从手写局部规则走向学习规则']]],
boids:['Boids: Background and Update','https://red3d.com/cwr/boids/','Craig Reynolds · Boids 模型作者','分离、对齐、聚拢的原始模型介绍；本页采用二维实现。',[
 ['Horde of the Flies',CE+'explorables/horde-of-the-flies/','拓宽：Vicsek 的对齐与噪声'],
 ['Ride my Kuramotocycle!',CE+'explorables/ride-my-kuramotocycle/','拓宽：从方向对齐到相位同步']]],
ant:['The Industrious Ant of Langton','https://www2.udec.cl/~angajardo/langton/','Anahí Gajardo 等 · DIM–CMM 研究团队','中文按读色、转向、改色、前进介绍规则；原站提供研究结果与参考资料。',[
 ['Complexity of Langton’s Ant','https://arxiv.org/abs/nlin/0306022','Gajardo、Moreira、Goles · 研究论文'],
 ['A New Kind of Science',wolfram,'Stephen Wolfram · 离散规则与复杂图案']]],
fluid:['Fluid Animation: Papers and Tutorials','https://www.josstam.com/publications','Jos Stam · 流体动画方法作者','方法背景参考半拉格朗日与 Fourier 求解；本页使用周期涡量—流函数模型。',[
 ['Navier–Stokes 数值教程','https://jsdokken.com/dolfinx-tutorial/stable/chapter2/ns_code2.html','Jørgen S. Dokken · 圆柱流、边界与基准'],
 ['Rayleigh–Bénard 对流','https://www.comsol.com/model/rayleigh-benard-106061','COMSOL · 温度与流动的耦合']]],
pendulum:['The Simple Pendulum',pend,'Russ Tedrake · MIT Underactuated Robotics','中文介绍重力、阻尼与反馈；本页角度从直立向上量起。',[
 ['Cart-Pole 与欠驱动控制',cart,'Russ Tedrake · MIT · 摆起与平衡'],
 ['Chaos and Non-Linear Dynamics',chaos,'MIT 8.09 · 混沌与非线性讲义 PDF']]],
fractal:['Unveiling the Mandelbrot Set','https://plus.maths.org/unveiling-mandelbrot-set','Robert L. Devaney · Plus / 剑桥大学 Millennium Mathematics Project','中文介绍复数迭代、参数平面与初值平面；显示与计算预算按本页设置。',[
 ['The Complex Geometry of the Mandelbrot Set','https://math.bu.edu/people/bob/papers/prague.pdf','Robert L. Devaney · 更深入的几何分析 PDF'],
 ['Logistic Map',CE+'flongs/logistic/','拓宽：实数迭代、倍周期与分岔']]],
logistic:['The Logistic Map',CE+'flongs/logistic/','Dirk Brockmann · Complexity Explorables','建模简介据此缩写，保留繁殖、竞争、归一化的主线。',[
 ['Logistic Equation','https://www.ocw.mit.edu/courses/18-s997-introduction-to-matlab-programming-fall-2011/pages/fractals-and-chaos/logistic-equation/','MIT OCW · 迭代与长期轨道绘图'],
 ['Population Dynamics – Part 4','https://nrich.maths.org/problems/population-dynamics-part-4','Cambridge NRICH · 推导与平衡点']]],
double:['Double Trouble',CE+'explorables/double-trouble/','Dirk Brockmann · Complexity Explorables','中文介绍耦合双摆与邻近初值；本页使用固定参数和 10⁻⁶ rad 的影子偏差。',[
 ['The Simple Pendulum',pend,'Russ Tedrake · MIT · 从单摆理解动力学'],
 ['Chaos and Non-Linear Dynamics',chaos,'MIT 8.09 · 相空间与敏感依赖 PDF']]],
driven:['Chaos and Non-Linear Dynamics',chaos,'MIT OCW · 8.09 Classical Mechanics III','参考受迫摆、截面与混沌的讲解；本页采用固定频率的周期力矩。',[
 ['Chaotic Solutions to the Driven Pendulum','https://lampz.tugraz.at/~hadley/physikm/apps/numerical_integration/pendulum.en.php','TU Graz · 方程与交互演示'],
 ['The Simple Pendulum',pend,'Russ Tedrake · MIT · 单摆的分析方法']]],
lorenz:['Lorenz Attractor and Chaos','https://ocw.mit.edu/courses/res-18-009-learn-differential-equations-up-close-with-gilbert-strang-and-cleve-moler-fall-2015/resources/lorenz-attractor-and-chaos/','Gilbert Strang & Cleve Moler · MIT OCW','中文介绍三变量耦合与轨迹分离；本页采用经典参数。',[
 ['Chaos and Non-Linear Dynamics',chaos,'MIT 8.09 · Lorenz 方程与混沌 PDF'],
 ['The Logistic Map',CE+'flongs/logistic/','拓宽：连续与离散混沌的比较']]],
gray:['Reaction-Diffusion Tutorial','https://karlsims.com/rd.html','Karl Sims · 作者教程','中文沿补给、反应、移除、扩散讲解；本页扩散系数和差分模板采用本地设置。',[
 ['Complex Patterns in a Simple System','https://arxiv.org/abs/patt-sol/9304003','John E. Pearson · Gray–Scott 图案论文'],
 ['Hopfed Turingles',CE+'explorables/hopfed-turingles/','拓宽：另一类反应—扩散机制']]],
excitable:['A Model for Fast Computer Simulation of Waves in Excitable Media',bark,'Dwight Barkley · 1991 原论文 PDF','中文介绍激发、恢复和螺旋波；本页用固定网格上的 Euler 方法求解。',[
 ['Linear Stability Analysis of Rotating Spiral Waves','https://warwick.ac.uk/fac/sci/maths/people/staff/dwight_barkley/home_page/papers/barkley_-_1992_-_phys._rev._lett..pdf','Dwight Barkley · 旋转波稳定性 PDF'],
 ['Phase Plane Analysis',fhn,'EPFL · 快慢变量与局部稳定性']]],
vicsek:['Horde of the Flies',CE+'explorables/horde-of-the-flies/','Dirk Brockmann · Complexity Explorables','中文按恒速粒子、局部对齐、角噪声介绍 Vicsek 模型。',[
 ['Boids','https://red3d.com/cwr/boids/','Craig Reynolds · 对比分离、对齐、聚拢'],
 ['Novel Type of Phase Transition in a System of Self-Driven Particles','https://arxiv.org/abs/cond-mat/0611743','Vicsek 等 · 原始模型论文']]],
kuramoto:['Ride my Kuramotocycle!',CE+'explorables/ride-my-kuramotocycle/','Dirk Brockmann & Steven Strogatz · Complexity Explorables','中文按相位、天然频率、耦合与序参量介绍同步。',[
 ['From Kuramoto to Crawford','https://web.mit.edu/~jadbabai/www/ESE680/Strogatz_Kuramoto.pdf','Steven Strogatz · 同步综述 PDF'],
 ['Growing Neural Cellular Automata',nca,'拓宽：另一类局部作用与整体组织']]],
ca:['A New Kind of Science',wolfram,'Stephen Wolfram · 在线全文','中文介绍三格邻域、规则编号与同步更新；原书包含大量规则图案。',[
 ['CellularAutomaton Documentation','https://reference.wolfram.com/language/ref/CellularAutomaton.html','Wolfram · 规则编码与计算文档'],
 ['Conway’s Game of Life',CE+'explorables/nah-dah-dah-nah-nah-opus-1984/','拓宽：从一维规则到二维世界']]],
dla:['Particularly Stuck',CE+'explorables/particularly-stuck/','Dirk Brockmann · Complexity Explorables','中文介绍随机游走与不可逆粘附；本页采用有限方格上的四邻规则。',[
 ['Diffusion-Limited Aggregation','https://harvest.aps.org/v2/journals/articles/10.1103/PhysRevLett.47.1400/fulltext','T. A. Witten & L. M. Sander · 原论文 PDF'],
 ['The Complex Geometry of the Mandelbrot Set','https://math.bu.edu/people/bob/papers/prague.pdf','拓宽：另一类分形几何']]],
sand:['The Abelian Sandpile','https://www.complexityexplorer.org/explore/virtual-laboratory/152-the-abelian-sandpile','Santa Fe Institute · Complexity Explorer','中文介绍加沙、阈值与连锁倾倒；本页采用开放边界。',[
 ['Self-Organized Criticality: An Explanation of 1/f Noise','https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.59.381','Bak、Tang、Wiesenfeld · 原论文'],
 ['I Sing Well-Tempered',CE+'explorables/i-sing-well-tempered/','拓宽：Ising 模型与临界现象']]],
ising:['I Sing Well-Tempered',CE+'explorables/i-sing-well-tempered/','Dirk Brockmann · Complexity Explorables','中文介绍能量、温度与翻转概率；本页采用四邻耦合。',[
 ['Self-Organized Criticality','https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.59.381','拓宽：沙堆中的临界性'],
 ['Horde of the Flies',CE+'explorables/horde-of-the-flies/','拓宽：非平衡群体中的有序与无序']]],
cylinder:['Flow Past a Cylinder – DFG 2D-3 Benchmark','https://jsdokken.com/dolfinx-tutorial/stable/chapter2/ns_code2.html','Jørgen S. Dokken · FEniCSx Tutorial','主题与基准参考；本页使用格子 Boltzmann 方法，参数按本地设置。',[
 ['On Pressure and Velocity Boundary Conditions for the Lattice Boltzmann BGK Model','https://arxiv.org/abs/comp-gas/9611001','Qisu Zou & Xiaoyi He · 边界方法论文'],
 ['Fluid Animation: Publications','https://www.josstam.com/publications','Jos Stam · 数值流体与动画方法']]],
convection:['Rayleigh–Bénard','https://www.comsol.com/model/rayleigh-benard-106061','COMSOL · 官方模型与文档','参考温差、浮力与临界 Ra 的主题；本页采用二维自由滑移教学模型。',[
 ['Lorenz Attractor and Chaos','https://ocw.mit.edu/courses/res-18-009-learn-differential-equations-up-close-with-gilbert-strang-and-cleve-moler-fall-2015/resources/lorenz-attractor-and-chaos/','MIT OCW · 对流缩减模型与混沌'],
 ['Rayleigh–Bénard Convection: Dynamics and Structure in the Physical Space','https://arxiv.org/abs/math/0611316','Tian Ma & Shouhong Wang · 分岔与流动结构']]],
cart:['Acrobots, Cart-Poles, and Quadrotors',cart,'Russ Tedrake · MIT Underactuated Robotics','中文介绍能量摆起与局部平衡；角度从下垂量起，控制参数按本页设置。',[
 ['The Simple Pendulum',pend,'Russ Tedrake · MIT · 能量与相图'],
 ['Trajectory Optimization','https://underactuated.mit.edu/trajopt.html','Russ Tedrake · MIT · 拓宽到轨迹规划']]],
nca:['Growing Neural Cellular Automata',nca,'Alexander Mordvintsev、Ettore Randazzo、Eyvind Niklasson、Michael Levin · Distill','中文介绍共享局部网络与训练；本页采用 4 通道圆盘目标的小型演示。',[
 ['Lenia','https://chakazul.github.io/lenia.html','Bert Chan · 手写连续局部规则'],
 ['Growing Neural Cellular Automata – Notebook','https://colab.research.google.com/github/google-research/self-organising-systems/blob/master/notebooks/growing_ca.ipynb','原作者团队 · 可运行研究代码']]],
aco:['Ant Colony Optimization','https://www.scholarpedia.org/article/Ant_colony_optimization','Marco Dorigo · 模型研究者 / Scholarpedia','中文介绍信息素、概率选路与蒸发；本页采用旅行商问题的 Ant System 型演示。',[
 ['ACO: Publications','https://iridia.ulb.ac.be/~mdorigo/ACO/publications.html','Marco Dorigo · 论文与专著入口'],
 ['About ACO','https://iridia.ulb.ac.be/~mdorigo/ACO/about.html','作者团队 · 起源与方法背景']]],
physarum:['Characteristics of Pattern Formation and Evolution in Approximations of Physarum Transport Networks',jones,'Jeff Jones · UWE / Artificial Life (2010)','中文介绍感知、沉积、扩散和衰减；本页使用简化粒子规则。',[
 ['原论文全文 PDF','https://uwe-repository.worktribe.com/OutputFile/980585','Jeff Jones · 模型、实验与图案参数'],
 ['Influences on the Formation and Evolution of Physarum-Inspired Networks','https://uwe-repository.worktribe.com/index.php/output/985963/influences-on-the-formation-and-evolution-of-physarum-polycephalum-inspired-emergent-transport-networks','Jeff Jones · 后续网络形成研究']]]
};
function render(id){
 const d=topics[id];if(!d)return;
 let top=document.getElementById('topic-origin'),bottom=document.getElementById('topic-further');
 if(!top){top=document.createElement('section');top.id='topic-origin';top.className='topic-origin';top.setAttribute('aria-label','英文原文与致谢');document.querySelector('.story-card').before(top);}
 if(!bottom){bottom=document.createElement('section');bottom.id='topic-further';bottom.className='topic-further';bottom.setAttribute('aria-labelledby','topic-further-title');const f=document.querySelector('footer');if(f)f.before(bottom);else document.querySelector('main').append(bottom);}
 function add(parent,tag,value){const x=document.createElement(tag);x.textContent=value;parent.append(x);return x;}
 function link(parent,title,url){const a=add(parent,'a',title+' ↗');a.href=url;a.target='_blank';a.rel='noopener';return a;}
 top.replaceChildren();bottom.replaceChildren();
 add(top,'span','英文原文 · 主要参考').className='origin-label';link(top,d[0],d[1]).className='origin-link';
 add(top,'p',d[2]).className='origin-credit';add(top,'p',d[3]).className='origin-note';
 add(bottom,'h2','延伸阅读').id='topic-further-title';
 const list=add(bottom,'ul','');for(const [title,url,note] of d[4]){const li=add(list,'li','');link(li,title,url);add(li,'p',note);}
}
root.TopicSources={topics,render};
if(typeof document!=='undefined'){const id=location.pathname.split('/').pop().replace(/\.html$/,'');if(topics[id])render(id);}
})(typeof globalThis!=='undefined'?globalThis:this);

/* Model-specific reading bridges. Teaching notes describe the local implementation;
   they do not change model parameters, simulation state, or the Boids/Logistic pages. */
(function(root){
'use strict';
const notes={
  "double": {
    "question": "几乎相同的两套双摆，何时开始明显分离？",
    "define": "每套记录 θ₁、ω₁、θ₂、ω₂；θ 从下垂量起，ω=θ̇。影子系统的第一角度多 10⁻⁶ rad。",
    "build": "两杆相互耦合。用动能 T 和势能 V 构造 L=T−V，q=(θ₁,θ₂)；Lagrange 方程给出两角加速度。",
    "formula": "本页单位质量与单位杆长下：T=ω₁²+ω₂²/2+ω₁ω₂ cos(θ₁−θ₂)\nV=−g(2cosθ₁+cosθ₂)；q=(θ₁,θ₂)，L=T−V\nd/dt(∂L/∂q̇)−∂L/∂q=0 → 两角加速度的耦合方程",
    "params": "固定两质量、两杆长均为 1，g=9.81。初角 2.1、2 rad 用于观察大幅运动，阻尼和外力均为 0。",
    "setup": "两份系统从零角速度出发，用 RK4、h=0.005 同步计算。绿线显示末端轨迹，粉色显示影子摆。",
    "observe": "先看重合，再看分离及下方状态距离。该距离是有限时间诊断；能量守恒和轨道可预测性分别检查。"
  },
  "driven": {
    "question": "周期性的推动，为什么会产生复杂响应？",
    "define": "θ 为相对下垂的角度，ω=θ̇；t 为无量纲时间，F 为驱动幅值。影子初角偏移 10⁻⁶。",
    "build": "重力拉回摆臂，阻尼消耗运动，周期外力补充能量；sinθ 保留大幅运动的非线性。",
    "formula": "θ̈ = −sinθ − 0.5θ̇ + F cos(2t/3)\n驱动周期 T=2π/(2/3)=3π",
    "params": "F 可调 0–1.6，先比较 0.3 与 1.2。阻尼固定 0.5，驱动角频率为 2/3、周期为 3π。",
    "setup": "初始 θ=0.2、ω=0；RK4、h=0.01。每个驱动周期采样一次角度和角速度，形成 Poincaré 截面。",
    "observe": "看响应节奏和两轨迹分离。同周期稳定响应趋向一个截面点，倍周期出现多个点；复杂散点需结合长期分析。"
  },
  "lorenz": {
    "question": "三个确定方程，怎样产生难以长期预测的轨道？",
    "define": "(x,y,z) 是对流缩减模型的三种模式幅度；t 为无量纲时间，σ、ρ、β 为参数。",
    "build": "σ(y−x) 让 x 跟随 y；ρx 驱动 y，−xz 限制 y；xy 产生 z，−βz 使 z 衰减。交叉乘积形成非线性耦合。",
    "formula": "ẋ=σ(y−x)；ẏ=x(ρ−z)−y；ż=xy−βz\n本页 σ=10，ρ=28，β=8/3",
    "params": "固定经典参数 σ=10、ρ=28、β=8/3，用于展示双翼吸引子。",
    "setup": "从 (1,1,1) 与 x 多 10⁻⁶ 的影子起点出发；RK4、h=0.01。主图显示 x−z 投影。",
    "observe": "观察两轨迹何时转向不同翼，并看状态距离。它们可保持在同一有界区域内，同时逐渐分离。"
  },
  "gray": {
    "question": "一块小扰动，怎样长成分裂的斑点？",
    "define": "u(x,y,t) 是被补给物质的浓度，v 是生成物浓度；F 为补给率，k 为额外移除率。主图显示 v。",
    "build": "反应 uv² 消耗 u、产生 v，已有 v 促进反应；F(1−u) 补充 u，(F+k)v 移除 v，扩散连接邻近区域。",
    "formula": "uₜ=0.16∇²u−uv²+F(1−u)\nvₜ=0.08∇²v+uv²−(F+k)v",
    "params": "默认 F=0.0367、k=0.0649，扩散系数为 0.16、0.08。这组教学参数用于展示斑点生长；每次只改 F 或 k 比较。",
    "setup": "112×112 周期网格，背景 u=1、v=0，中心放入反应物与微扰。五点差分，h=1，Euler Δt=1。",
    "observe": "看中心斑块扩展、分裂或消退。比较同一模型时间的形态；判断场是否趋稳要看整幅变化。"
  },
  "excitable": {
    "question": "一轮激发经过后，为什么需要等待恢复？",
    "define": "u 表示快速激发，v 表示恢复状态；a、b 决定阈值，ε 决定快慢尺度。",
    "build": "u 越过阈值后快速上升，并推动 v 增加；v 提高再次激发的门槛，随后逐渐回落。u 扩散使兴奋传播。",
    "formula": "uₜ=∇²u+u(1−u)[u−(v+b)/a]/ε\nvₜ=u−v；a=0.75，b=0.01，ε=0.02",
    "params": "固定 a=0.75、b=0.01、ε=0.02，用于展示 Barkley 螺旋波；较小 ε 使激发快于恢复。",
    "setup": "112×112 周期网格，用分段 u、v 制造断波。五点差分、h=1、Euler Δt=0.01。",
    "observe": "跟随波头看它怎样卷转，观察波后的恢复区。持续转动的螺旋是一种有组织的动态。"
  },
  "vicsek": {
    "question": "只有邻居对齐与走偏，整体方向能否形成？",
    "define": "每个粒子记录位置与朝向 θᵢ；n 为离散步，η 为角噪声宽度。邻居是 25 格内的粒子，包含自身。",
    "build": "把邻居方向变成单位向量求和，取合成方向，再加均匀角噪声；全部粒子按新朝向恒速前进。",
    "formula": "θᵢⁿ⁺¹=arg Σ邻居 exp(iθⱼⁿ)+ξᵢ，ξᵢ∈[−η/2,η/2]\n位置ⁿ⁺¹=位置ⁿ+1.3(cosθᵢⁿ⁺¹,sinθᵢⁿ⁺¹)",
    "params": "η 默认 0.3，可调 0–6.28；速度 1.3 格/步、粒子数 180、感知半径 25 固定。比较 η=0.3 与 5。",
    "setup": "180×180 周期区域，固定种子生成起点与随机序列；先算全部朝向，再一起移动。",
    "observe": "看分散方向是否渐渐一致。P=|Σexp(iθᵢ)|/N 接近 1 表示整体对齐；P 较小时再观察局部群体。"
  },
  "kuramoto": {
    "question": "天然快慢不同的振子，怎样形成共同节奏？",
    "define": "θᵢ 为相位，ωᵢ 为天然角频率，K 为耦合强度，N=80 为振子数。R 表示相位一致度，ψ 为合成相位。",
    "build": "振子按天然频率前进，同时被 sin(θⱼ−θᵢ) 拉向共同相位：超前者减速，落后者加速。",
    "formula": "θ̇ᵢ=ωᵢ+(K/N)Σⱼsin(θⱼ−θᵢ)\nR exp(iψ)=(1/N)Σⱼexp(iθⱼ)，故耦合项=KR sin(ψ−θᵢ)",
    "params": "K 默认 1.5，可调 0–4，先比较 0 与 2。天然频率采用固定的均值 0、标准差尺度 0.7 的高斯样本。",
    "setup": "初相位散布圆周，全连接耦合；根据同一时刻的均值场，用 Euler Δt=0.03 更新。",
    "observe": "看圆点聚拢与 R 的变化。相位集中用 R 衡量，长期锁频用平均转速衡量。"
  },
  "ca": {
    "question": "八条开关规则，怎样生成丰富的时空图案？",
    "define": "aᵢⁿ 是第 n 代第 i 格的 0/1 状态。左、中、右三格形成八种邻域，编码 k=4aᵢ₋₁+2aᵢ+aᵢ₊₁。",
    "build": "每种邻域对应一个输出位，八个输出位合成 0–255 的规则编号；按编号查出下一代中心格状态。",
    "formula": "aᵢⁿ⁺¹=(rule >> k) & 1\n“>> k”取出编号右移 k 位的结果，“& 1”只保留最低二进制位。",
    "params": "默认 Rule 30，比较 90、110、184。固定中央一个亮点，只改规则编号，观察规则的影响。",
    "setup": "301 格组成周期环，每步同步更新一代；每行是一代，时间向下，保留最近 300 行。",
    "observe": "比较规则产生的三角形、条带与不规则纹理。沿行向下追踪演化，留意周期边界带来的回卷。"
  },
  "dla": {
    "question": "随机游走怎样长出枝杈？",
    "define": "C(i,j)∈{0,1} 记录团簇占据状态，另记游走粒子位置；R 为团簇最大半径。",
    "build": "粒子等概率向四邻走动，接触团簇四邻域即永久粘附。突出尖端更容易接触来粒，枝间凹槽受到遮蔽。",
    "formula": "游走位移∈{(1,0),(−1,0),(0,1),(0,−1)}，各概率 1/4\n若新位置四邻有 C=1，则该格 C←1，重新发射下一颗粒子。",
    "params": "160×160 网格，中心一个种子；从 R+6 发射，走出 R+18 则重发。这两个距离用于控制计算范围。",
    "setup": "固定随机种子，每批最多 3000 次游走尝试；团簇接近边缘时停止。",
    "observe": "比较尖端和凹槽的新增粒子。下图记录团簇粒子数，结合主图看分枝怎样延长。"
  },
  "sand": {
    "question": "只加一粒沙，怎样触发大片连锁？",
    "define": "hᵢ 是格点 i 的沙粒数；达到 4 就倾倒。雪崩规模 S 是一次加沙后发生的总倾倒次数。",
    "build": "满格减四，四邻各加一；邻居满后继续传递。边缘沙粒流出，前一次雪崩结束后再加下一粒。",
    "formula": "hᵢ≥4 ⇒ hᵢ←hᵢ−4；每个域内四邻 hⱼ←hⱼ+1\n一次雪崩结束条件：所有 hᵢ<4。",
    "params": "默认9×9教学模式：中心3×3各3粒，其余2粒，在中心加沙。另有48×48随机模式，初始每格2粒。均采用开放边界与阈值4。",
    "setup": "每个可见阶段单独展示：加1粒、标出待倒格、本格减4并向四邻各送1粒。前一场完全结束才可加下一粒；可跳过本场慢动作。",
    "observe": "粉框和箭头标记刚发生的倾倒，橙色表示达到阈值、等待倾倒，青框保留本场足迹。所有格低于4才稳定；教学起点的少量事件不用于判定临界分布。"
  },
  "ising": {
    "question": "邻居偏好一致，热扰动怎样打散这种秩序？",
    "define": "sᵢ=±1 表示两个方向，H 为总能量，T 为无量纲温度，N 为格子数，m=Σsᵢ/N 为磁化。",
    "build": "同向邻居降低能量。翻转若使能量下降就接受；若升高 ΔE，以 exp(−ΔE/T) 概率接受。",
    "formula": "H=−Σ相邻对 sᵢsⱼ；ΔE=2sᵢΣ四邻sⱼ\nP接受=min(1,exp(−ΔE/T))；本页 J=kB=1、外场为 0。",
    "params": "T 默认 2.2，可调 0.1–5，先比较 1 与 4。取 J=kB=1、外场为 0，温度决定接受扰动的概率。",
    "setup": "72×72 周期网格，从随机正负自旋开始；每个 sweep 随机尝试 N 次翻转。",
    "observe": "看同向畴形成或破碎，并比较磁化与能量。m 接近 0 时，结合图像区分无序和正负大畴抵消。"
  },
  "cylinder": {
    "question": "对称固定的圆柱，为什么产生交替尾涡？",
    "define": "ρ 是密度，u 是速度，ω 是涡量；fᵢ 是九个离散速度方向的分布，cᵢ 是各方向位移。",
    "build": "分布先向当地平衡值 fᵢᵉᑫ 松弛，再移到邻格；固体边界反弹分布。入口补流、出口放流，每步由分布求密度和速度。",
    "formula": "fᵢ(x+cᵢ,t+1)=fᵢ(x,t)−[fᵢ(x,t)−fᵢᵉᑫ]/τ\nν=(τ−0.5)/3；Re峰值≈U·(2R)/ν",
    "params": "入口峰值 U 默认 0.085，可调 0.04–0.09；半径 R=7、τ=0.54，黏性 ν≈0.01333。Re 表示惯性与黏性的相对作用。",
    "setup": "160×64 网格，圆柱与壁面采用反弹边界。入口加入微小横向扰动；等待流动经过区域多次再观察。",
    "observe": "看圆柱后正负涡是否交替脱落，再核对测点横向速度的振荡。定量结论需另做网格收敛与基准比较。"
  },
  "convection": {
    "question": "下热上冷，液体怎样自己形成循环？",
    "define": "T 是温度，ω 是涡量，ψ 是流函数，u 是速度；ν 为黏性，κ 为热扩散率，α 为浮力系数，H 为层高。",
    "build": "温度差通过浮力产生涡量，涡量决定速度，速度又搬运温度；扩散与黏性抑制差异。",
    "formula": "Tₜ+u·∇T=κ∇²T\nωₜ+u·∇ω=ν∇²ω+α∂ₓT；−∇²ψ=ω\nα=Ra·νκ/H³",
    "params": "Ra 默认 3000，可调 100–12000，ν=κ=0.2。通过 α=Raνκ/H³ 调节浮力相对扩散和黏性的强弱。",
    "setup": "80×40 网格，底 T=1、顶 T=0，左右周期、上下自由滑移。导热状态加微扰，Δt=0.15，每步近似求流函数。",
    "observe": "比较低、高 Ra 下扰动衰减或长大，观察温度层弯曲、速度循环和动能变化。"
  },
  "cart": {
    "question": "只推小车，怎样把摆送到上方并稳住？",
    "define": "状态为小车位置 x、速度 ẋ、摆角 θ、角速度 ω。θ 从下垂量起，直立为 π；F 为水平推力，M、m 为车和摆质量，l 为摆长。",
    "build": "推力经小车加速度影响摆角。下方用能量反馈积累摆动，接近直立时切换 LQR，以四个状态误差决定推力。",
    "formula": "(M+m sin²θ)ẍ=F+m sinθ(lω²+g cosθ)\nlθ̈=−ẍ cosθ−g sinθ；直立附近 F=−K·状态误差（受限幅）",
    "params": "M=1、m=0.2、l=1、g=9.81；力上限默认 30，可调 5–40。角误差小于 0.4 且角速度绝对值小于 2.5 时切换 LQR。",
    "setup": "默认从直立附近开始；点击“从下垂摆起”改从 θ=0.1 出发。RK4、h=0.01 求完整非线性运动。",
    "observe": "先看摆动积累和控制切换，再降低力上限比较。观察角误差、小车偏移和速度能否一起收敛。"
  },
  "nca": {
    "question": "只给最终目标，能否学出一条共享的局部生长规则？",
    "define": "每格 sᵢ 有 4 个通道，第一通道用于显示，其余用于内部状态；pᵢ 拼接自身与四邻平均。W、V 为共享权重，N 为格子总数。",
    "build": "网络用局部输入计算增量。每次从种子演化 20 步，用均方误差 L 比较输出与目标圆盘，再反向传播调整权重。",
    "formula": "sᵢⁿ⁺¹=sᵢⁿ+0.25·V tanh(Wpᵢⁿ)\nL=(1/N)Σ格 (可见通道的第20步输出−目标)²",
    "params": "12×12 格、4 通道、8 隐藏单元、20 步展开；更新尺度 0.25，Adam 学习率 0.008。这组小规模设置方便浏览器训练。",
    "setup": "中心隐藏通道放一点种子，边界外取零。每轮训练都从种子重算，主图显示当前权重的第20步结果。",
    "observe": "先观察损失下降，再停止训练继续演化。擦除右半边，检查当前规则能否恢复、保持或继续变形。"
  },
  "aco": {
    "question": "路线太多，怎样靠集体试错逐渐找到更短的巡回？",
    "define": "dᵢⱼ 是城市距离，τᵢⱼ 是边的信息素，ρ 是蒸发比例，L 是走遍各城并返回起点的总长度。",
    "build": "从未访问城市中按 τᵢⱼ/dᵢⱼ³ 加权选择。旧信息素蒸发，短路线沉积更多信息素，并保存历史最短路线。",
    "formula": "P(i→j)=wᵢⱼ/Σ未访问城市 wᵢₖ；wᵢⱼ=τᵢⱼ/dᵢⱼ³\nτ←(1−ρ)τ+Σ经过该边的路线 1/L（程序设最小痕迹下限）",
    "params": "22 个城市、每代 24 只蚂蚁；ρ 默认 0.25，可调 0.05–0.8，距离指数固定为 3。蒸发控制旧经验的保留时间。",
    "setup": "固定种子生成城市与搜索序列，初始各边信息素为 1；一次迭代完成一代路线搜索。",
    "observe": "看交叉边减少和最好长度下降。曲线变平表示暂时没有改进；全局最优需另作验证。"
  },
  "physarum": {
    "question": "只感知附近痕迹，许多粒子怎样织成网络？",
    "define": "粒子记录位置和朝向 θ，场 c 记录环境痕迹，ρ 是每步衰减比例；三个固定吸引源持续补充痕迹。",
    "build": "比较前、左、右三方向痕迹，向较强方向转动，前进并沉积。环境再扩散、衰减，使路径增强与遗忘相互竞争。",
    "formula": "感知三方向 → 选择转向 → 前进 1 格 → 沉积 1 单位\ncⁿ⁺¹=(1−ρ)·九格均值(c沉积后)；随后吸引源各补充 30。",
    "params": "1300 粒子，感知距离 7，感知角 ±0.6 rad，转角 0.35 rad。ρ 默认 0.04，可调 0.01–0.15，用于比较路径保持时间。",
    "setup": "112×112 周期区域，从固定种子的分散粒子出发；粒子顺序感知和沉积，环境随后同步扩散、衰减。",
    "observe": "观察痕迹聚成通道、连接吸引源；只改衰减比较通道宽度、连通与消失过程。"
  }
};
function render(id,extra={}){
 if(root.ModelMethod)return root.ModelMethod.render(id,extra);
 let host=document.getElementById('model-reading');
 if(['turing','life','continuous','ant','fluid','pendulum','fractal'].includes(id)){if(host)host.remove();return;}
 const n=notes[id];
 if(!n){if(host)host.hidden=true;return;}
 if(!host){host=document.createElement('section');host.id='model-reading';host.className='model-reading';host.setAttribute('aria-labelledby','model-reading-title');document.querySelector('.story-card').after(host);}
 const animation=document.querySelector('#world,#pattern');if(animation){const panel=animation.closest('.layout')||animation.parentElement;document.querySelector('.story-card').after(panel);panel.after(host);}host.hidden=false;host.replaceChildren();
 function add(tag,value,parent=host){const el=document.createElement(tag);el.textContent=value;parent.append(el);return el;}
 add('span','先看演化，再理解模型',host).className='reading-label';
 add('h3','怎样建立模型？').id='model-reading-title';
 add('p',n.question).className='reading-question';
 const sections=[['01 · 变量定义',n.define],['02 · 建模思路',n.build],['03 · 参数选择',n.params],['04 · 初始条件与计算',n.setup],['05 · 观察演化',n.observe]];
 sections.forEach(([title,body],i)=>{const block=add('div','');block.className='reading-step';add('h4',title,block);add('p',body,block);if(i===1){add('pre',n.formula,block).className='reading-formula';if(/∇|ₜ|∂/.test(n.formula))add('p','记号：下标 t、x、y 表示偏导，点号表示时间导数，∇ 表示梯度，∇² 表示拉普拉斯算子。',block).className='reading-footnote';}});
 const jump=add('a','↑ 返回演化画面');jump.className='reading-jump';jump.href='#evolution';
 const target=document.querySelector('#world,#pattern');if(target){const box=target.closest('.layout')||target.parentElement;box.id='evolution';jump.addEventListener('click',e=>{e.preventDefault();box.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});}
 if(extra.limits){add('h4','模型范围');add('p',extra.limits).className='reading-footnote';}if(extra.connection){add('h4','与其他实验的联系');add('p',extra.connection);}
}
root.ModelingNotes={render,notes};
if(typeof document!=='undefined'){const id=location.pathname.split('/').pop().replace(/\.html$/,'');if(notes[id])render(id);}
})(typeof globalThis!=='undefined'?globalThis:this);
