'use strict';
const M=ExtraModels,F=FlowModels,$=s=>document.querySelector(s),TAU=2*Math.PI;
const groups=[['logistic','分岔与混沌',['logistic']],['chaos','双摆与连续混沌',['double','driven','lorenz']],['gray','Gray–Scott',['gray']],['excitable','可激发介质',['excitable']],['synchrony','集体运动与同步',['vicsek','kuramoto']],['ca','一维元胞自动机',['ca']],['dla','扩散限制聚集',['dla']],['critical','沙堆与 Ising',['sand','ising']],['flow','流体的两条拓展',['cylinder','convection']],['cart','小车摆起与 LQR',['cart']],['nca','神经细胞自动机',['nca']],['trails','蚁群与粘菌',['aco','physarum']]];
const refs={flow:['Zou & He · LBM boundaries','https://arxiv.org/abs/comp-gas/9611001'],pend:['MIT · Pendulum','https://underactuated.mit.edu/pend.html'],cart:['MIT · Cart-Pole','https://underactuated.mit.edu/acrobot.html'],gray:['Pearson · Complex Patterns','https://arxiv.org/abs/patt-sol/9304003'],bark:['Barkley · Spiral waves','https://warwick.ac.uk/fac/sci/maths/people/staff/dwight_barkley/home_page/papers/langham_-_2013_-_chaos_interdiscip_j_nonlinear_sci.pdf'],vicsek:['Vicsek 等 · Collective motion','https://arxiv.org/abs/cond-mat/0611743'],kura:['Strogatz · Kuramoto review','https://web.mit.edu/~jadbabai/www/ESE680/Strogatz_Kuramoto.pdf'],dla:['Witten & Sander · DLA','https://harvest.aps.org/v2/journals/articles/10.1103/PhysRevLett.47.1400/fulltext'],sand:['Bak、Tang、Wiesenfeld · SOC','https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.59.381'],nca:['Growing Neural Cellular Automata','https://distill.pub/2020/growing-ca/'],aco:['Dorigo · Ant System','https://iridia.ulb.ac.be/~mdorigo/HomePageDorigo/publicationsbyyear.php'],phys:['Jones · Physarum agents','https://uwe-repository.worktribe.com/output/980579/characteristics-of-pattern-formation-and-evolution-in-approximations-of-physarum-transport-networks']};
const cfg={
logistic:{title:'Logistic 映射与分岔图',make:()=>new M.Logistic(),batch:1,param:[['r','增长参数 r',2.5,4,.001]],formula:'xₙ₊₁ = f(xₙ) = r xₙ(1 − xₙ)；不动点满足 f(x*)=x*；局部渐近稳定的充分条件为 |f′(x*)|<1。',question:'从 x₀=0.2 出发，按 xₙ₊₁=r xₙ(1−xₙ) 逐代更新。只改变 r，长期数量会趋向一个数、几个数的循环，还是不规则起伏？',model:'符号和模型假设见上方数学问题：n 是代数，xₙ 是数量比例，x₀=0.2，r∈[2.5,4]。上方为静态长期分岔总览；下方为当前轨迹。',method:'背景每列迭代 1000 次：丢弃前 850 次，保留后 150 次；当前轨道精确逐次迭代。有限时间 Lyapunov 均值另用 2000 次采样估计。',obs:['试 r=2.9、3.2、3.5、3.9。','在复杂区间找周期窗口，比较 λ 的正负。'],limits:'细小窗口需要更高分辨率与更长迭代；λ 为有限样本估计。',link:'接原 08 分形：x 与 z=r(1/2−x)、c=r(2−r)/4 把实 Logistic 轨道接到 z↦z²+c。',plot:'本次轨迹：横轴为迭代先后，纵轴为 xₙ（自动缩放，注意左侧刻度）。先看暂态，再判断长期是一个数、周期循环，还是不规则起伏。'},
double:{title:'双摆：邻近初值的分离',make:()=>new M.Chaos('double'),batch:8,formula:'两质点、两根无质量杆；由完整 Lagrange 方程得到耦合的 θ₁、θ₂ 二阶 ODE。',question:'两个几乎相同的起点，多久以后会明显不同？',model:'m₁=m₂=l₁=l₂=1，g=9.81；角度从下垂计算，无驱动、无阻尼。两条轨迹初始差 10⁻⁶ rad。',method:'固定步长 RK4，h=0.005；每个子阶段重算完整耦合项。',obs:['先看两根摆重叠，再看轨迹分开。','区分能量守恒与轨迹可预测性。'],limits:'显示有限时间的状态距离；长期精度需另行检查。',link:'接原 07 倒立摆，去掉控制、增加一个自由度。',ref:'cart',plot:'两条完整状态轨迹的距离，纵轴 log₁₀(距离)。'},
driven:{title:'受迫阻尼摆与 Poincaré 采样',make:()=>new M.Chaos('driven'),batch:10,param:[['drive','驱动幅值 F',0,1.6,.01]],formula:'θ̈ + 0.5 θ̇ + sin θ = F cos(2t/3)',question:'相同的周期驱动，为什么不一定产生同周期的响应？',model:'无量纲单摆、周期外力，初始 θ=0.2、ω=0；影子轨迹偏移 10⁻⁶。',method:'RK4，h=0.01；每经过一个驱动周期 3π 记录一个截面点。',obs:['试 F=0.3 与 1.2。','看底部截面是少数离散点还是逐渐散开。'],limits:'截面按首次跨越周期的积分步采样，存在 O(h) 的采样相位误差；稀疏点不能单独证明混沌。',link:'接原 07，由反馈扶正转向周期驱动与混沌。',ref:'pend',plot:'Poincaré 截面：横轴 θ mod 2π，纵轴角速度。'},
lorenz:{title:'Lorenz：三维状态与蝴蝶吸引子',make:()=>new M.Chaos('lorenz'),batch:8,formula:'ẋ=10(y−x)； ẏ=x(28−z)−y； ż=xy−(8/3)z',question:'确定的三个方程，为什么会在两个“翅膀”之间不规则切换？',model:'经典参数 σ=10、ρ=28、β=8/3；显示 x−z 投影。两份初值差 10⁻⁶。',method:'RK4，h=0.01；显示最近 2000 个轨迹点。',obs:['比较两份轨迹何时开始走不同的翼。','结合三个状态理解二维投影。'],limits:'轨迹分离是有限时间诊断；采用低维对流缩减模型。',link:'接原 07 的相图与 08 的敏感依赖。',plot:'两轨迹状态距离的 log₁₀ 时间曲线。'},
gray:{title:'Gray–Scott：斑点、分裂与迷宫',make:()=>new M.Reaction('gray'),batch:20,param:[['feed','补给 F',.015,.06,.0001],['kill','移除 k',.045,.07,.0001]],formula:'uₜ=0.16∇²u−uv²+F(1−u)；vₜ=0.08∇²v+uv²−(F+k)v',question:'换一套局部反应项，图案的行为会怎样改变？',model:'112×112 周期网格，中心扰动；颜色显示 v。',method:'五点 Laplacian、显式 Euler、Δt=1、h=1；同时更新两个场。',obs:['默认先等斑点生长；加快可观察分裂。','试 F=0.029、k=0.057，对照不同图案。'],limits:'图案取决于参数、初值、区域与暂态；更多参数组合可继续探索。',link:'接原 01 反应—扩散与 03 Lenia：比较局部扩散与非局部核。',ref:'gray',plot:'场均值 v 与时间的变化。'},
excitable:{title:'可激发介质：Barkley 螺旋波',make:()=>new M.Reaction('barkley'),batch:40,formula:'uₜ=∇²u+u(1−u)[u−(v+b)/a]/ε；vₜ=u−v',question:'局部激发怎样形成行进波与恢复区？',model:'a=0.75、b=0.01、ε=0.02；112² 周期网格；折断的波前与恢复场作为起点。显示激发变量 u。',method:'显式 Euler Δt=0.01，五点差分 h=1；本页采用 Barkley 模型，区别于原01的 FitzHugh–Nagumo 型反应项。',obs:['追踪波头转弯及激发后的恢复区。','观察周期边界处波的相遇与消失。'],limits:'采用通用可激发介质模型。',link:'接原 01，同属反应—扩散，但机制从静态斑图转为兴奋传播。',ref:'bark',plot:'激发场均值随时间变化。'},
vicsek:{title:'Vicsek：对齐、噪声与集体运动',make:()=>new M.Vicsek(),batch:1,param:[['noise','角噪声宽度 η',0,6.28,.01]],formula:'θᵢⁿ⁺¹=arg Σ邻居 eⁱθⱼ + Uniform(−η/2,η/2)',question:'只保留对齐和噪声，还能形成鸟群的共同方向吗？',model:'180 个恒速粒子，周期区域 180×180，感知半径25，速度1.3/步，包含自身。',method:'同一步先计算所有新朝向，再用新朝向移动；固定随机种子以便比较。',obs:['比较 η=0.3 和 5 的朝向一致度。','局部有序可能与整体有序不同。'],limits:'有限粒子数和运行时间不足以判定热力学极限中的相变阶数。',link:'接原 04 Boids，去掉分离、聚拢，仅保留对齐。',ref:'vicsek',plot:'朝向序参量 |Σeⁱθ|/N，范围0–1。'},
kuramoto:{title:'Kuramoto：频率不同的振子怎样同步',make:()=>new M.Kuramoto(),batch:3,param:[['k','耦合强度 K',0,4,.01]],formula:'θ̇ᵢ=ωᵢ+(K/N)Σⱼ sin(θⱼ−θᵢ)=ωᵢ+Kr sin(ψ−θᵢ)',question:'每个振子的天然频率不同，怎样仍形成共同的节奏？',model:'80 个全连接相位振子，天然频率为固定种子的高斯样本；圆点表示相位。',method:'均值场等价式，显式 Euler Δt=0.03；所有相位同步更新。',obs:['比较 K=0 与 K=2。','结合长期频率检查锁定。'],limits:'r 衡量瞬时相位一致度；锁频需比较长期平均频率。',link:'接原 04：位置与速度的对齐，变为相位的同步。',ref:'kura',plot:'同步序参量 r=|Σeⁱθ|/N。'},
ca:{title:'一维元胞自动机：Rule 30 / 110',make:()=>new M.ElementaryCA(),batch:1,param:[['rule','规则编号',0,255,1]],formula:'邻域码 k=4aᵢ₋₁+2aᵢ+aᵢ₊₁；aᵢⁿ⁺¹=(rule >> k)&1',question:'八种三格邻域的输出位，能生成怎样不同的时空图案？',model:'301 个格点，周期边界，单个活细胞起点。每行是一代，时间向下。',method:'精确离散规则、同步更新；保留最近300代。',obs:['输入规则30，再试110、90、184。','最顶层与当前行不同，是时间的堆叠。'],limits:'采用有限周期环，显示最近300代。',link:'接原 02 与 05，以更小的规则空间比较确定性与复杂性。',plot:'每代活细胞比例。'},
dla:{title:'DLA：随机游走长出分形枝杈',make:()=>new M.DLA(),batch:1,formula:'粒子作最近邻随机游走；首次接触团簇的四邻域即不可逆粘附。',question:'没有预先画出的枝条，为什么尖端更容易继续生长？',model:'160² 方格、中心种子。粒子从团簇外6格发射，远离18格则重新发射。',method:'有界计算域的单粒子 DLA，固定伪随机种子；接近边缘时自动停止。',obs:['比较突出尖端与凹槽的生长机会。','重新开始会重放同一随机序列。'],limits:'发射／丢弃圆与有限格点会影响形态；本页不估计严格分形维数。',link:'接原 08 的几何分形与 06 的扩散概念。',ref:'dla',plot:'团簇粒子数随计算批次增长。'},
sand:{title:'BTW 沙堆：缓慢加粒与雪崩',make:()=>new SandSteps($('#sand-scenario').value),batch:1,formula:'hᵢ≥4：hᵢ←hᵢ−4，四邻居各+1；边界外颗粒流失。',question:'一次只加一粒，为什么有时局部不动，有时触发大片连锁？',model:'默认9×9教学起点，中心3×3各3粒、其余2粒；可切换到原始48×48随机加沙。前一场结束后才加下一粒。',method:'队列逐次执行合法倾倒：每次本格减4，四邻各加1。分开展示加沙、待倾倒、传递与结束；播放速度只改变展示间隔。',obs:['粉框与箭头显示刚发生的一次倾倒；青框保留本场足迹。','积累足够事件，再比较大小雪崩频数。'],limits:'规模分布需积累更多样本；空白柱表示尚未观测到。',link:'接原 02 局部规则与 04 集体行为；开放边界使持续输入能够流出。',ref:'sand',plot:'只统计已结束且有倾倒的事件，规模按2的幂分箱；横轴log₂规模，纵轴事件数。9×9教学起点用于看过程；研究长期分布请切到48×48随机模式。'},
ising:{title:'Ising：温度与有序—无序',make:()=>new M.Ising(),batch:1,param:[['temp','无量纲温度 T',.1,5,.01]],formula:'H=−Σ邻接 sᵢsⱼ；ΔE=2sᵢΣ邻居sⱼ；P接受=min(1,e⁻ΔE/T)',question:'局部偏好一致，为什么高温下仍会无序？',model:'72² 周期方格，s=±1，J=kB=1、外场为0。',method:'Metropolis 随机单自旋翻转；每步尝试N次（一次蒙特卡罗 sweep）。',obs:['比较 T=1 与4；看磁化与畴的演化。','接近临界区域要等更久才能平衡。'],limits:'每步为蒙特卡罗采样；临界附近需要更长的平衡时间。',link:'接原 04 的序参量，用平衡统计模型对照活性粒子。',plot:'磁化 m=Σs/N，范围−1到1。'},
cylinder:{title:'圆柱尾流：让障碍物真正进入流场',make:()=>new F.CylinderFlow(),batch:6,param:[['inlet','入口峰值速度 U（格子单位）',.04,.09,.001]],formula:'fᵢ(x+cᵢ,t+1)=fᵢ−(fᵢ−fᵢᵉᑫ)/τ；ν=(τ−0.5)/3',question:'为什么有障碍物的流动会形成交替脱落的尾涡？',model:'160×64 D2Q9，圆柱半径7；壁面与圆柱反弹边界，Zou–He 抛物线速度入口、定密度压力出口，τ=0.54。颜色为涡量，灰色为固体。',method:'BGK 碰撞与迁移；轻微入口横向扰动打破对称；每步都重算密度与速度。',obs:['加快计算，待入口流过区域多次后再看尾部。','比较入口速度与显示的 Reynolds 数。'],limits:'弱可压教学 LBM；出入口重构、粗网格及有限区域影响涡街。未做网格收敛、阻力系数或 Strouhal 基准验证。',link:'接原06，加入障碍物与出入流边界。',ref:'flow',plot:'圆柱后方固定测点的横向速度；格子时间。'},
convection:{title:'Rayleigh–Bénard：温度、浮力与对流',make:()=>new F.Convection(),batch:3,param:[['ra','Rayleigh 数 Ra',100,12000,100]],formula:'Tₜ+u·∇T=κ∇²T；ωₜ+u·∇ω=ν∇²ω+α∂ₓT；−∇²ψ=ω',question:'下热上冷的导热状态，什么时候被上升和下降的运动替代？',model:'80×40，左右周期；底T=1、顶T=0；ψ=ω=0（不可穿透、自由滑移），ν=κ=0.2；α=Raνκ/H³。起点含微弱温度与滚动扰动；颜色为温度，箭头为速度。',method:'涡量—流函数 Boussinesq 模型；Poisson 每步25次 Jacobi，迎风平流、显式扩散，Δt=0.15，h=1。',obs:['提高Ra并加快，观察导热条带逐渐弯曲。','看动能是否增长；颜色变化应与速度对应。'],limits:'本页采用自由滑移边界；迎风耗散、有限迭代和网格会改变临界值，本页不测定精确临界Ra。',link:'接原06与01：浮力不稳定引出有特征尺度的对流结构。',plot:'区域平均动能，格子单位。'},
cart:{title:'小车倒立摆：能量摆起 → LQR',make:()=>new M.CartPole(),batch:4,param:[['limit','水平力上限',5,40,.5]],formula:'(M+m sin²θ)ẍ=F+m sinθ(lω²+g cosθ)；lθ̈=−ẍ cosθ−g sinθ',question:'只能推小车，怎样把下垂的摆送到上方并保持平衡？',model:'M=1、m=0.2、l=1，θ从下垂计算；只施加水平力F，无摆轴力矩。',method:'完整非线性方程 RK4 h=0.01；LQR由直立附近离散化模型的 Riccati 迭代计算；能量摆起在小角度／角速度时切换到LQR。',obs:['点“从下垂摆起”，看控制方式何时切换。','降低力上限，比较摆起与局部平衡。'],limits:'无实际轨道长度、摩擦、传感器噪声和延迟；摆起表现取决于初值、参数与力矩上限。',link:'接原07的直接驱动摆；现在是欠驱动的小车—摆耦合。',ref:'cart',plot:'角误差 θ−π（折回−π到π）与小车位置 x。'},
nca:{title:'NCA：实际学习一个局部更新规则',make:()=>new NeuralCA(),batch:1,formula:'pᵢ=[sᵢ,四邻均值]；sᵢ⁺=sᵢ+0.25 V tanh(Wpᵢ)；L=MSE(可见通道,目标)',question:'把同一个小网络应用到每个细胞，能从种子学会长出一个目标吗？',model:'12² 网格、每格4通道、8隐藏单元；20步展开，目标为小圆盘。左图是当前网络生长20步的输出，右图为目标。没有坐标输入与偏置。',method:'浏览器内手写时间反向传播与 Adam；共享 W、V 均实际更新。损失图与训练轮数会随训练变化。',obs:['先训练约150轮，看MSE是否下降。','点擦除，停止训练，用当前规则观察能否修复；也可能继续变形。'],limits:'本页训练第20步圆盘目标；长期保持与损伤修复可作为后续训练任务。',link:'接原02、03，局部规则从手写变为由目标训练得到。',ref:'nca',plot:'每个训练轮次的目标均方误差；仅当前浏览器内存，不保存模型。'},
aco:{title:'蚁群优化：用信息素寻找短回路',make:()=>new M.ACO(),batch:1,param:[['evap','信息素蒸发比例',.05,.8,.01]],formula:'P(i→j) ∝ τᵢⱼ / dᵢⱼ³；τ←(1−ρ)τ + Σ每只蚂蚁 1/L',question:'不枚举所有路线，能否通过重复探索逐渐改进巡回路径？',model:'22个固定城市，每代24只蚂蚁；访问每城一次后返回起点。',method:'按概率构造完整路线；蒸发后按路线长度反比增强信息素；始终保存历史最短路线。',obs:['看早期交叉边是否逐步消失。','比较高低蒸发率：探索和过早集中之间的关系。'],limits:'采用启发式搜索，全局最优需另行验证。',link:'接原05的环境痕迹与04的集体信息。',ref:'aco',plot:'历史最好巡回长度，城市坐标单位。'},
physarum:{title:'粘菌启发的感知—沉积粒子模型',make:()=>new M.Physarum(),batch:2,param:[['decay','痕迹每步衰减',.01,.15,.001]],formula:'前／左／右感知 → 转向 → 移动 → 沉积；痕迹←(1−衰减)·3×3平均',question:'许多只读取并写入局部痕迹的粒子，如何组织成线状网络？',model:'1300粒子、112²周期网格，3个固定吸引源；传感器距离7、角度±0.6，单步转角0.35。',method:'顺序智能体沉积后对场做同步扩散和衰减；确定的随机种子。',obs:['比较强衰减与弱衰减的线宽、网络连通性。','观察吸引源附近与远处的通道差异。'],limits:'采用Jones启发的粒子规则；网络效率需另行评价。',link:'接原05：颜色痕迹变成会扩散、会挥发的环境场。',ref:'phys',plot:'平均环境痕迹浓度。'}
};
const experimentStories={
  "logistic": [
    "池塘里的鱼，为什么会忽多忽少？",
    "池塘里鱼少时，资源充足，数量容易增加；鱼多时，竞争加剧，增长受到限制。每年按同一条规则变化，数量会稳定，还是持续起伏？",
    "先猜一猜：繁殖能力越强，数量就会越稳定吗？依次试 r=2.9、3.2、3.5 和3.9。"
  ],
  "double": [
    "两只双摆，能一直跳同一支舞吗？",
    "同时放开两套双摆，初始角度只差一点点。它们起初几乎重合，后来却可能明显分开。这个小差异会怎样放大？",
    "先猜一猜：两套摆大幅分开之前，会不会先有一段几乎重合的时间？先看动画，再看距离曲线。"
  ],
  "driven": [
    "每次都按节拍推，秋千就会按节拍摆吗？",
    "按固定节奏推秋千，摆动也一定跟着这个节奏吗？改变推动强度，观察规则输入怎样产生不同响应。",
    "先猜一猜：周期性的输入，是否一定产生同周期的输出？比较 F=0.3 和1.2时，下方采样点的形状。"
  ],
  "lorenz": [
    "天气按物理规律走，为什么还难预报？",
    "两次计算的起点只差一点，轨迹却可能走向不同的蝴蝶翼。三个确定方程，怎样产生长期预测的困难？",
    "先猜一猜：两条轨迹分开后，还会不会都留在同一片双翼形区域？跟着两种颜色看一会儿。"
  ],
  "gray": [
    "不用画笔，斑点能自己分裂吗？",
    "薄膜中心只有一小块反应物，局部反应与扩散却可能让它长成许多斑点。改变补给和移除速度，会长出什么？",
    "先猜一猜：同一块起点，换一点补给量，会只是长得快些，还是连形状也会变？一次只改一个参数。"
  ],
  "excitable": [
    "体育场的人浪，为什么不会一直举着手？",
    "人浪向前传播，每个人起身后需要休息。快速激发和缓慢恢复相互作用，在平面上能形成旋转的波。",
    "先猜一猜：刚刚经过波浪的区域，为什么不能立刻再次被激发？追踪一个波头和它后面的恢复区。"
  ],
  "vicsek": [
    "大家都只看邻居，还能走向同一个方向吗？",
    "一群粒子只跟随附近同伴的朝向，同时有一点随机走偏。局部对齐能否汇成整体方向？",
    "先猜一猜：一点点噪声会让队伍立刻散掉吗？比较 η=0.3 和5，再看朝向一致度。"
  ],
  "kuramoto": [
    "一群各走各拍的节拍器，怎样合拍？",
    "一群节拍器天生快慢各异，彼此的节奏又会相互拉动。影响多强时，它们会逐渐合拍？",
    "先猜一猜：互相影响要多强，才会出现一群靠拢的点？从 K=0 调到2，观察同步指标。"
  ],
  "ca": [
    "只有一排灯，能写出多复杂的图案？",
    "一排小灯每次只看自己和左右邻居。八条开关规则，反复执行后能生成怎样的图案？",
    "先猜一猜：从一个亮点出发，Rule 30、90 和110 哪个最像随机图？切换后从顶部往下看。"
  ],
  "dla": [
    "没人设计的枝条，为什么越长越分叉？",
    "粒子四处乱走，碰到中央团簇就粘住。突出的尖端更容易接住新粒子，团簇会怎样分枝？",
    "先猜一猜：下一颗粒子更容易粘在尖端，还是深入凹槽？观察几个突出部位如何继续生长。"
  ],
  "sand": [
    "最后那一粒沙，为什么会引发一大片？",
    "每次只加一粒沙，影响有时很小，有时却连成大片。格子装满后向邻居分沙，怎样触发雪崩？",
    "先猜一猜：加沙的位置很小，是否意味着影响也一定很小？等几次雪崩，对照下面大小不同的事件统计。"
  ],
  "ising": [
    "磁铁里面的小方向，为什么有时能站成一队？",
    "每个小指针都偏好与邻居同向，热扰动又让它翻转。改变温度，看看秩序怎样形成或消散。",
    "先猜一猜：温度升高后，是每枚指针都变弱了，还是大家更难保持一致？比较 T=1 和4。"
  ],
  "cylinder": [
    "桥墩后面的水，为什么会左右摇摆？",
    "水流绕过固定桥墩，尾部有时会交替卷起涡旋。对称的障碍物，怎样产生随时间摆动的尾流？",
    "先猜一猜：左右对称的障碍物，会不会产生随时间交替的尾流？加快计算，观察圆柱后方。"
  ],
  "convection": [
    "锅底热起来，水为什么自己翻动？",
    "从底部加热液体，热流体上升、冷流体下沉。温度与运动相互推动，什么时候会形成循环？",
    "先猜一猜：把 Ra 调高，原先微弱的滚动会变强还是变弱？比较温度颜色、速度箭头和动能曲线。"
  ],
  "cart": [
    "手不能碰摆，只推小车也能把它立起来吗？",
    "你只能左右推小车，要把车上的摆从下方送到上方。先积累摆动，再及时纠偏，怎样完成这两个阶段？",
    "先猜一猜：一直使用直立附近的平衡控制，能从下垂起点摆起来吗？点“从下垂摆起”，留意控制方式切换。"
  ],
  "nca": [
    "不告诉每格该画哪里，能学会长出一个圆吗？",
    "每个格子只看自己和邻居，共用同一个小网络。只给最终圆盘作为目标，能否学出一条局部生长规则？",
    "先看训练损失，再试擦除和继续演化，检查形状能保持多久。"
  ],
  "aco": [
    "一群没地图的蚂蚁，怎样帮快递员找路线？",
    "快递员要走遍所有城市再返回起点。让虚拟蚂蚁重复试路，短路留下更强痕迹，能否逐渐缩短行程？",
    "先猜一猜：如果好路线的痕迹几乎不挥发，会更聪明，还是太早认定一条路？调节蒸发比例比较。"
  ],
  "physarum": [
    "没有总设计师，网络怎样自己长出来？",
    "粒子沿附近较强的痕迹移动，走过后又留下痕迹。沉积、扩散和衰减共同作用，怎样织成通道网络？",
    "先猜一猜：痕迹消失得太快或太慢，网络会有什么不同？调衰减参数，观察线宽和连接。"
  ]
};
const world=$('#world'),ctx=world.getContext('2d'),plot=$('#plot'),pc=plot.getContext('2d'),off=document.createElement('canvas'),oc=off.getContext('2d');let mode='',model,running=true,history=[],bif=null,lastSample=0,sandFast=false,sandLastTick=0;
const color={green:'#a7d8b6',pink:'#efacc5',blue:'#9bc8ee',bg:'#11261f',text:'#e3eee6'};
function text(c,str,x,y,size=15){c.fillStyle=color.text;c.font=`${size}px system-ui`;c.fillText(str,x,y);}
function line(c,points,col,width=1){if(points.length<2)return;c.strokeStyle=col;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
function circle(c,x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
function rect(nx,ny){const scale=Math.min(900/nx,540/ny);return[(900-scale*nx)/2,(540-scale*ny)/2,scale*nx,scale*ny];}
function field(a,nx,ny,scale=1,solid=null,flip=false){off.width=nx;off.height=ny;const im=oc.createImageData(nx,ny);for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){const i=y*nx+x,j=((flip?ny-1-y:y)*nx+x)*4,v=M.clip(a[i]*scale,0,1);if(solid&&solid[i]){im.data[j]=100;im.data[j+1]=112;im.data[j+2]=108;}else{im.data[j]=30+205*v;im.data[j+1]=55+140*v;im.data[j+2]=65+85*(1-v);}im.data[j+3]=255;}oc.putImageData(im,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(off,...rect(nx,ny));}
function centeredField(a,nx,ny,range,solid){off.width=nx;off.height=ny;const im=oc.createImageData(nx,ny);for(let i=0;i<a.length;i++){const v=M.clip(a[i]/range,-1,1),j=i*4;im.data[j]=solid&&solid[i]?100:24+Math.max(v,0)*220;im.data[j+1]=solid&&solid[i]?110:40+Math.abs(v)*130;im.data[j+2]=solid&&solid[i]?105:45+Math.max(-v,0)*210;im.data[j+3]=255;}oc.putImageData(im,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(off,...rect(nx,ny));}
function metric(){switch(mode){case'logistic':return`迭代 ${model.n} · x=${model.x.toFixed(5)} · λ估计 ${model.lyap.toFixed(3)}`;case'double':case'driven':case'lorenz':return`t=${model.t.toFixed(2)} · 邻轨距离 ${model.separation().toExponential(2)}`;case'gray':case'excitable':return`t=${model.t.toFixed(2)} · ${model.n}² 周期网格`;case'vicsek':return`步 ${model.nstep} · 一致度 ${model.order().toFixed(3)}`;case'kuramoto':return`t=${model.t.toFixed(1)} · r=${model.order()[0].toFixed(3)}`;case'ca':return`Rule ${model.rule} · 保留 ${model.rows.length} 代`;case'dla':return`${model.count} 个粒子 · 半径 ${model.radius.toFixed(1)} ${model.stopped?'· 已到计算边缘':''}`;case'sand':return`已加入 ${model.grains} 粒 · 本场已倾倒 ${model.currentTopplings} 次 · 最近完整事件 ${model.last} 次 · 边界流失 ${model.lost} 粒`;case'ising':return`sweep ${model.sweeps} · m=${model.magnet().toFixed(3)} · H/N=${(model.energy()/model.s.length).toFixed(3)}`;case'cylinder':return`格子步 ${model.steps} · Re峰值≈${model.reynolds().toFixed(1)} · 最大密度偏差 ${Math.max(...model.rho.map(v=>Math.abs(v-1))).toFixed(3)}`;case'convection':return`t=${model.t.toFixed(1)} · Ra=${model.ra} · 动能 ${model.energy().toExponential(3)}`;case'cart':return`t=${model.t.toFixed(1)} · ${model.controlMode} · x=${model.state[0].toFixed(2)} · F=${model.force(model.state).toFixed(2)}`;case'nca':return`训练 ${model.epoch} 轮 · 最近训练MSE ${model.loss.toFixed(5)} · ${model.training?'正在训练':'仅演化，不训练'}`;case'aco':return`代 ${model.gen} · 最好长度 ${Number.isFinite(model.length)?model.length.toFixed(4):'待计算'}`;case'physarum':return`步 ${model.steps} · ${model.agents.length} 粒子`;}}
function sample(){let v=0;switch(mode){case'logistic':v=model.x;break;case'double':case'lorenz':v=Math.log10(Math.max(1e-12,model.separation()));break;case'driven':return;case'gray':case'excitable':{const a=mode==='gray'?model.v:model.u;v=a.reduce((s,x)=>s+x,0)/a.length;break;}case'vicsek':v=model.order();break;case'kuramoto':v=model.order()[0];break;case'ca':v=model.row.reduce((s,x)=>s+x,0)/model.n;break;case'dla':v=model.count;break;case'sand':return;case'ising':v=model.magnet();break;case'cylinder':v=model.v[(model.ny>>1)*model.nx+Math.floor(model.nx*.65)];break;case'convection':v=model.energy();break;case'cart':v=M.wrap(model.state[2],TAU)-Math.PI;break;case'nca':v=model.loss;break;case'aco':v=model.length;break;case'physarum':v=model.field.reduce((s,x)=>s+x,0)/model.field.length;break;}if(Number.isFinite(v))history.push(v);if(history.length>700)history.shift();}
function plotDraw(){pc.fillStyle=color.bg;pc.fillRect(0,0,900,200);if(mode==='driven'){for(const[a,w]of model.section)circle(pc,450+a/Math.PI*400,100-w*22,2,color.pink);text(pc,`已取 ${model.section.length} 个周期截面点`,12,20);return;}if(mode==='sand'){const bins=Array(18).fill(0);for(const x of model.sizes)bins[Math.min(17,Math.floor(Math.log2(x)))]++;const max=Math.max(1,...bins);bins.forEach((x,i)=>{pc.fillStyle=color.green;pc.fillRect(30+i*47,175-145*x/max,35,145*x/max);});text(pc,`样本 ${model.sizes.length} · 最大分箱计数 ${max}`,12,20);return;}if(history.length<2){text(pc,'运行后显示轨迹或统计',15,25);return;}let lo=Math.min(...history),hi=Math.max(...history);if(['vicsek','kuramoto','ca','gray','excitable'].includes(mode)){lo=0;hi=1;}if(mode==='ising'){lo=-1;hi=1;}if(hi-lo<1e-10)hi=lo+1e-5;line(pc,history.map((v,i)=>[45+i*835/(history.length-1),175-145*(v-lo)/(hi-lo)]),color.green,1.5);text(pc,hi.toPrecision(3),5,22,12);text(pc,lo.toPrecision(3),5,183,12);text(pc,'时间／采样 →',770,195,12);}
function draw(){ctx.fillStyle=color.bg;ctx.fillRect(0,0,900,world.height);
if(mode==='logistic'){ctx.drawImage(bif,0,0);ctx.strokeStyle=color.pink;ctx.beginPath();ctx.moveTo((model.r-2.5)/1.5*900,0);ctx.lineTo((model.r-2.5)/1.5*900,540);ctx.stroke();text(ctx,'r：2.5 → 4；纵轴 x：0 → 1（向上）',15,25);}
else if(['gray','excitable'].includes(mode))field(mode==='gray'?model.v:model.u,model.n,model.n,mode==='gray'?2.6:1);
else if(mode==='double'){const pend=(y,c)=>{const[a,,b]=y,x1=450+110*Math.sin(a),y1=220+110*Math.cos(a),x2=x1+110*Math.sin(b),y2=y1+110*Math.cos(b);line(ctx,[[450,220],[x1,y1],[x2,y2]],c,3);circle(ctx,x1,y1,8,c);circle(ctx,x2,y2,8,c);};line(ctx,model.trail.map(y=>[450+110*(Math.sin(y[0])+Math.sin(y[2])),220+110*(Math.cos(y[0])+Math.cos(y[2]))]),'#42665a');pend(model.shadow,color.pink);pend(model.y,color.green);}
else if(mode==='driven'){const a=model.y[0];line(ctx,[[450,170],[450+180*Math.sin(a),170+180*Math.cos(a)]],color.green,5);circle(ctx,450+180*Math.sin(a),170+180*Math.cos(a),16,color.green);circle(ctx,450+180*Math.sin(model.shadow[0]),170+180*Math.cos(model.shadow[0]),8,color.pink);text(ctx,'相同周期外力 · 两份邻近初值',20,30);}
else if(mode==='lorenz'){line(ctx,model.trail.map(y=>[450+y[0]*16,510-y[2]*9]),color.green,1);circle(ctx,450+model.shadow[0]*16,510-model.shadow[2]*9,5,color.pink);text(ctx,'x−z 投影',15,25);}
else if(mode==='vicsek'){for(const b of model.birds){const x=180+b.x*3,y=b.y*3;line(ctx,[[x-6*Math.cos(b.a),y-6*Math.sin(b.a)],[x+6*Math.cos(b.a),y+6*Math.sin(b.a)]],color.green,2);}}
else if(mode==='kuramoto'){ctx.strokeStyle='#466452';ctx.beginPath();ctx.arc(450,270,190,0,TAU);ctx.stroke();for(const a of model.theta)circle(ctx,450+190*Math.cos(a),270+190*Math.sin(a),4,color.green);const[r,a]=model.order();line(ctx,[[450,270],[450+r*190*Math.cos(a),270+r*190*Math.sin(a)]],color.pink,4);}
else if(mode==='ca'){const a=new Float64Array(model.n*300);model.rows.forEach((r,y)=>a.set(r,y*model.n));field(a,model.n,300);}
else if(mode==='dla')field(model.grid,model.n,model.n);
else if(mode==='sand'){SandView.draw(ctx,model);SandView.update(model);}
else if(mode==='ising')centeredField(model.s,model.n,model.n,1);
else if(mode==='cylinder')centeredField(model.vorticity(),model.nx,model.ny,.025,model.solid);
else if(mode==='convection'){field(model.temp,model.nx,model.ny,1,null,true);for(let y=3;y<model.ny-3;y+=5)for(let x=3;x<model.nx;x+=5){const i=y*model.nx+x,s=180;const [left,top,w,h]=rect(model.nx,model.ny);const xx=left+x/model.nx*w,yy=top+h-y/model.ny*h;line(ctx,[[xx,yy],[xx+s*model.u[i],yy-s*model.v[i]]],'#ffffffbb',1);}}
else if(mode==='cart'){const[x,,a]=model.state,base=450+M.clip(x*50,-340,340);ctx.strokeStyle='#688377';ctx.beginPath();ctx.moveTo(0,410);ctx.lineTo(900,410);ctx.stroke();ctx.fillStyle=color.blue;ctx.fillRect(base-40,380,80,30);line(ctx,[[base,380],[base+140*Math.sin(a),380+140*Math.cos(a)]],color.green,5);circle(ctx,base+140*Math.sin(a),380+140*Math.cos(a),12,color.pink);text(ctx,`小车位置 x=${x.toFixed(2)}（超过视野时只截断显示位置）`,15,25);}
else if(mode==='nca'){const n=model.n;for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=y*n+x,v=M.clip(model.state[i*4],0,1);ctx.fillStyle=`rgb(${30+v*210},${60+v*140},${50+v*70})`;ctx.fillRect(35+x*30,90+y*30,29,29);ctx.fillStyle=model.target[i]?'#efd5a2':'#193b2a';ctx.fillRect(500+x*30,90+y*30,29,29);}text(ctx,'当前网络输出',35,55);text(ctx,'训练目标（小圆盘）',500,55);}
else if(mode==='aco'){if(model.best){line(ctx,[...model.best,model.best[0]].map(i=>[model.cities[i][0]*900,model.cities[i][1]*540]),color.green,2);}for(const[x,y]of model.cities)circle(ctx,x*900,y*540,5,color.pink);}
else if(mode==='physarum'){field(model.field,model.n,model.n,.09);for(const[x,y]of model.food){const [l,t,w,h]=rect(model.n,model.n);circle(ctx,l+x/model.n*w,t+y/model.n*h,5,color.pink);}}
$('#metrics').textContent=metric();plotDraw();}
function rebuild(values={}){model=cfg[mode].make();for(const[k,v]of Object.entries(values))model[k]=v;if(mode==='logistic'){model.lyap=model.lyapunov();if(!bif){bif=document.createElement('canvas');bif.width=900;bif.height=540;const c=bif.getContext('2d');c.fillStyle=color.bg;c.fillRect(0,0,900,540);c.fillStyle='#a7d8b680';for(const[r,x]of M.Logistic.bifurcation(800))c.fillRect((r-2.5)/1.5*900,540-x*540,1,1);}}history=[];lastSample=0;$('#status').textContent='';draw();}
function parameterValues(){const o={};for(const el of $('#controls').querySelectorAll('input'))o[el.dataset.key]=Number(el.value);return o;}
function choose(id,scroll=false){if(!cfg[id])id='logistic';mode=id;sandFast=false;sandLastTick=0;const isSand=id==='sand';document.body.dataset.sand=String(isSand);$('#world').height=isSand?900:540;$('#playback-help').textContent=isSand?'只改变可见阶段的间隔，不改变倾倒规则或每次加沙量。':'只改变每帧步数，不改变单步规则或积分步长。';$('#sand-explainer').hidden=!isSand;$('#sand-inspector').hidden=!isSand;$('#step').textContent=isSand?'下一小步':'单步';$('#reset').textContent=isSand?'从本模式起点重播':'重新开始';document.querySelector('label[for=speed]').textContent=isSand?'演示速度':'播放计算量';$('#speed').options[0].textContent=isSand?'慢放（约0.8秒/步）':'正常';if(isSand){running=false;syncPlay();}else $('#world').setAttribute('aria-label','当前模型的演化画面');$('#logistic-problem').hidden=id!=='logistic';if(id==='logistic')$('#logistic-problem').before($('#world').closest('.layout'));const g=groups.find(g=>g[2].includes(id)),c=cfg[id];$('#group-name').textContent=`${String(groups.indexOf(g)+1).padStart(2,'0')} / ${g[1]}`;$('#title').textContent=c.title;$('#intro').textContent=id==='logistic'?'从鱼塘故事出发，先观察数量变化，再理解模型与稳定性。':c.question;const story=experimentStories[id];$('#story-title').textContent=story[0];$('#story-body').textContent=story[1];$('#story-task').textContent=story[2];ModelingNotes.render(id,{limits:c.limits,connection:c.link});if($('#optimization-bridge'))$('#optimization-bridge').hidden=id!=='aco';$('#world').closest('.layout').before($('#sand-explainer'));TopicSources.render(id);$('#mode').replaceChildren(...g[2].map(k=>{const o=document.createElement('option');o.value=k;o.textContent=cfg[k].title;o.selected=k===id;return o;}));for(const el of $('#groups').children)el.setAttribute('aria-pressed',String(el.dataset.group===g[0]));$('#plot-note').textContent=c.plot;$('#model-guide-link').href='#model-method';$('#controls').replaceChildren();rebuild();for(const[key,label,min,max,step]of c.param||[]){const div=document.createElement('div');div.className='control';const lab=document.createElement('label');lab.htmlFor='p-'+key;lab.textContent=label;const out=document.createElement('output');out.textContent=model[key];lab.append(out);const input=document.createElement('input');input.type='range';input.id='p-'+key;input.dataset.key=key;input.min=min;input.max=max;input.step=step;input.value=model[key];input.addEventListener('input',()=>{out.textContent=input.value;rebuild(parameterValues());});div.append(lab,input);$('#controls').append(div);}$('#action').hidden=!['cart','nca','ca'].includes(id);$('#damage').hidden=id!=='nca';$('#action').textContent=id==='cart'?'从下垂摆起':id==='nca'?'停止／继续训练':'切换 Rule 30 / 110';if(scroll)$('#experiment').scrollIntoView({block:'start',behavior:'smooth'});}
for(const[id,title,ids]of groups){const b=document.createElement('button');b.dataset.group=id;b.setAttribute('aria-pressed','false');const n=document.createElement('span');n.textContent=`${String(groups.findIndex(g=>g[0]===id)+1).padStart(2,'0')} / ${ids.length} 个模型`;b.append(n,document.createTextNode(title));b.addEventListener('click',()=>{location.hash=ids[0];});$('#groups').append(b);}
$('#mode').addEventListener('change',e=>location.hash=e.target.value);window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(cfg[id])choose(id,true);});$('#reset').addEventListener('click',()=>{sandFast=false;if(mode==='sand'){running=false;syncPlay();}rebuild(parameterValues());});$('#play').addEventListener('click',()=>{sandFast=false;running=!running;sandLastTick=0;syncPlay();});function syncPlay(){$('#play').textContent=running?'暂停':mode==='sand'?'播放慢动作':'继续';$('#play').setAttribute('aria-pressed',String(running));}
function advance(){model.step();if(mode==='dla'&&model.stopped){running=false;syncPlay();$('#status').textContent='团簇接近有限计算边缘，已停止。可重新开始。';}const a=mode==='cylinder'?model.rho:mode==='convection'?model.temp:['double','driven','lorenz'].includes(mode)?model.y:mode==='cart'?model.state:mode==='nca'?model.state:[];if(a.some(v=>!Number.isFinite(v))){running=false;syncPlay();$('#status').textContent='计算出现非有限值，已暂停。请重新开始并使用较温和的参数。';}sample();}
$('#step').addEventListener('click',()=>{running=false;sandFast=false;syncPlay();advance();draw();});$('#action').addEventListener('click',()=>{if(mode==='cart'){model.mode='swing';model.state=[0,0,.1,0];model.t=0;history=[];}else if(mode==='nca')model.training=!model.training;else if(mode==='ca'){const rule=model.rule===30?110:30;rebuild({rule});$('#controls input').value=rule;$('#controls output').textContent=rule;}draw();});$('#damage').addEventListener('click',()=>{model.damage();draw();});
$('#sand-scenario').addEventListener('change',()=>{running=false;sandFast=false;syncPlay();rebuild();});$('#sand-finish').addEventListener('click',()=>{if(mode==='sand'&&model.phase!=='idle'&&model.phase!=='settled'){sandFast=true;running=true;syncPlay();}});
choose(location.hash.slice(1));if(matchMedia('(prefers-reduced-motion: reduce)').matches){running=false;syncPlay();}document.addEventListener('visibilitychange',()=>{if(document.hidden){running=false;syncPlay();}});
function frame(now){if(mode==='sand'){if(running&&!document.hidden){let changed=false;if(sandFast){const start=performance.now();for(let k=0;k<400&&performance.now()-start<12;k++){advance();changed=true;if(model.phase==='settled'){sandFast=false;running=false;syncPlay();break;}}}else if(now-sandLastTick>=800/Number($('#speed').value)){advance();sandLastTick=now;changed=true;if(model.scenario==='demo'&&model.phase==='settled'){running=false;syncPlay();}}if(changed)draw();}requestAnimationFrame(frame);return;}if(running&&!document.hidden){const start=performance.now(),count=(cfg[mode].batch||1)*Number($('#speed').value);try{for(let i=0;i<count&&running;i++){advance();if(performance.now()-start>14)break;}draw();}catch(e){running=false;syncPlay();$('#status').textContent='计算已暂停：'+e.message;}}requestAnimationFrame(frame);}requestAnimationFrame(frame);
