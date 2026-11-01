'use strict';
const M=ExtraModels,F=FlowModels,$=s=>document.querySelector(s),TAU=2*Math.PI;
const groups=[['logistic','分岔与混沌',['logistic']],['chaos','双摆与连续混沌',['double','driven','lorenz']],['gray','Gray–Scott',['gray']],['excitable','可激发介质',['excitable']],['synchrony','集体运动与同步',['vicsek','kuramoto']],['ca','一维元胞自动机',['ca']],['dla','扩散限制聚集',['dla']],['critical','沙堆与 Ising',['sand','ising']],['flow','流体的两条拓展',['cylinder','convection']],['cart','小车摆起与 LQR',['cart']],['nca','神经细胞自动机',['nca']],['trails','蚁群与粘菌',['aco','physarum']]];
const refs={flow:['Zou & He · LBM boundaries','https://arxiv.org/abs/comp-gas/9611001'],pend:['MIT · Pendulum','https://underactuated.mit.edu/pend.html'],cart:['MIT · Cart-Pole','https://underactuated.mit.edu/acrobot.html'],gray:['Pearson · Complex Patterns','https://arxiv.org/abs/patt-sol/9304003'],bark:['Barkley · Spiral waves','https://warwick.ac.uk/fac/sci/maths/people/staff/dwight_barkley/home_page/papers/langham_-_2013_-_chaos_interdiscip_j_nonlinear_sci.pdf'],vicsek:['Vicsek 等 · Collective motion','https://arxiv.org/abs/cond-mat/0611743'],kura:['Strogatz · Kuramoto review','https://web.mit.edu/~jadbabai/www/ESE680/Strogatz_Kuramoto.pdf'],dla:['Witten & Sander · DLA','https://harvest.aps.org/v2/journals/articles/10.1103/PhysRevLett.47.1400/fulltext'],sand:['Bak、Tang、Wiesenfeld · SOC','https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.59.381'],nca:['Growing Neural Cellular Automata','https://distill.pub/2020/growing-ca/'],aco:['Dorigo · Ant System','https://iridia.ulb.ac.be/~mdorigo/HomePageDorigo/publicationsbyyear.php'],phys:['Jones · Physarum agents','https://uwe-repository.worktribe.com/output/980579/characteristics-of-pattern-formation-and-evolution-in-approximations-of-physarum-transport-networks']};
const cfg={
logistic:{title:'Logistic 映射与分岔图',make:()=>new M.Logistic(),batch:1,param:[['r','增长参数 r',2.5,4,.001]],formula:'xₙ₊₁ = r xₙ(1 − xₙ)； λ ≈ (1/N)Σ log|r(1 − 2xₙ)|',question:'一条只有一个状态量的离散规则，如何经历不动点、倍周期与混沌？',model:'x∈[0,1]，r∈[2.5,4]。背景是不同 r 的长期轨道，粉色竖线是当前参数；下方绿色曲线是所选轨道。',method:'背景每列丢弃 850 次暂态，保留 150 次；当前轨道精确逐次迭代。有限时间 Lyapunov 均值另用 2000 次采样估计。',obs:['试 r=2.9、3.2、3.5、3.9。','在复杂区间找周期窗口，比较 λ 的正负。'],limits:'有限迭代与像素分辨率会漏掉细小窗口；λ 是采样估计，不是严密证明。',link:'接原 08 分形：x 与 z=r(1/2−x)、c=r(2−r)/4 把实 Logistic 轨道接到 z↦z²+c。',plot:'所选参数的 xₙ 时间序列。'},
double:{title:'双摆：邻近初值的分离',make:()=>new M.Chaos('double'),batch:8,formula:'两质点、两根无质量杆；由完整 Lagrange 方程得到耦合的 θ₁、θ₂ 二阶 ODE。',question:'两个几乎相同的起点，多久以后会明显不同？',model:'m₁=m₂=l₁=l₂=1，g=9.81；角度从下垂计算，无驱动、无阻尼。两条轨迹初始差 10⁻⁶ rad。',method:'固定步长 RK4，h=0.005；每个子阶段重算完整耦合项。',obs:['先看两根摆重叠，再看轨迹分开。','区分能量守恒与轨迹可预测性。'],limits:'初值分离曲线不是经过重归一化的渐近 Lyapunov 指数；长时间数值误差也会累积。',link:'接原 07 倒立摆，去掉控制、增加一个自由度。',ref:'cart',plot:'两条完整状态轨迹的距离，纵轴 log₁₀(距离)。'},
driven:{title:'受迫阻尼摆与 Poincaré 采样',make:()=>new M.Chaos('driven'),batch:10,param:[['drive','驱动幅值 F',0,1.6,.01]],formula:'θ̈ + 0.5 θ̇ + sin θ = F cos(2t/3)',question:'相同的周期驱动，为什么不一定产生同周期的响应？',model:'无量纲单摆、周期外力，初始 θ=0.2、ω=0；影子轨迹偏移 10⁻⁶。',method:'RK4，h=0.01；每经过一个驱动周期 3π 记录一个截面点。',obs:['试 F=0.3 与 1.2。','看底部截面是少数离散点还是逐渐散开。'],limits:'截面按首次跨越周期的积分步采样，存在 O(h) 的采样相位误差；稀疏点不能单独证明混沌。',link:'接原 07，由反馈扶正转向周期驱动与混沌。',ref:'pend',plot:'Poincaré 截面：横轴 θ mod 2π，纵轴角速度。'},
lorenz:{title:'Lorenz：三维状态与蝴蝶吸引子',make:()=>new M.Chaos('lorenz'),batch:8,formula:'ẋ=10(y−x)； ẏ=x(28−z)−y； ż=xy−(8/3)z',question:'确定的三个方程，为什么会在两个“翅膀”之间不规则切换？',model:'经典参数 σ=10、ρ=28、β=8/3；显示 x−z 投影。两份初值差 10⁻⁶。',method:'RK4，h=0.01；显示最近 2000 个轨迹点。',obs:['比较两份轨迹何时开始走不同的翼。','投影交叉不意味着三维轨迹相交。'],limits:'轨迹分离是有限时间诊断；这是低维截断模型，不是完整天气预报。',link:'接原 07 的相图与 08 的敏感依赖。',plot:'两轨迹状态距离的 log₁₀ 时间曲线。'},
gray:{title:'Gray–Scott：斑点、分裂与迷宫',make:()=>new M.Reaction('gray'),batch:20,param:[['feed','补给 F',.015,.06,.0001],['kill','移除 k',.045,.07,.0001]],formula:'uₜ=0.16∇²u−uv²+F(1−u)；vₜ=0.08∇²v+uv²−(F+k)v',question:'换一套局部反应项，图案的行为会怎样改变？',model:'112×112 周期网格，中心扰动；颜色显示 v。',method:'五点 Laplacian、显式 Euler、Δt=1、h=1；同时更新两个场。',obs:['默认先等斑点生长；加快可观察分裂。','试 F=0.029、k=0.057，对照不同图案。'],limits:'图案取决于参数、初值、区域与暂态；本页不是论文参数空间的穷尽复刻。',link:'接原 01 反应—扩散与 03 Lenia：比较局部扩散与非局部核。',ref:'gray',plot:'场均值 v 与时间的变化。'},
excitable:{title:'可激发介质：Barkley 螺旋波',make:()=>new M.Reaction('barkley'),batch:40,formula:'uₜ=∇²u+u(1−u)[u−(v+b)/a]/ε；vₜ=u−v',question:'局部被激发后，为什么形成行进波与不应期，而不是静态条纹？',model:'a=0.75、b=0.01、ε=0.02；112² 周期网格；折断的波前与恢复场作为起点。显示激发变量 u。',method:'显式 Euler Δt=0.01，五点差分 h=1；本页采用 Barkley 模型，区别于原01的 FitzHugh–Nagumo 型反应项。',obs:['追踪波头转弯及激发后的恢复区。','观察周期边界处波的相遇与消失。'],limits:'这是通用可激发模型，没有心肌的真实结构与参数；不能用于医疗判断。',link:'接原 01，同属反应—扩散，但机制从静态斑图转为兴奋传播。',ref:'bark',plot:'激发场均值随时间变化。'},
vicsek:{title:'Vicsek：对齐、噪声与集体运动',make:()=>new M.Vicsek(),batch:1,param:[['noise','角噪声宽度 η',0,6.28,.01]],formula:'θᵢⁿ⁺¹=arg Σ邻居 eⁱθⱼ + Uniform(−η/2,η/2)',question:'只保留对齐和噪声，还能形成鸟群的共同方向吗？',model:'180 个恒速粒子，周期区域 180×180，感知半径25，速度1.3/步，包含自身。',method:'同一步先计算所有新朝向，再用新朝向移动；固定随机种子以便比较。',obs:['比较 η=0.3 和 5 的朝向一致度。','局部有序可能与整体有序不同。'],limits:'有限粒子数和运行时间不足以判定热力学极限中的相变阶数。',link:'接原 04 Boids，去掉分离、聚拢，仅保留对齐。',ref:'vicsek',plot:'朝向序参量 |Σeⁱθ|/N，范围0–1。'},
kuramoto:{title:'Kuramoto：频率不同的振子怎样同步',make:()=>new M.Kuramoto(),batch:3,param:[['k','耦合强度 K',0,4,.01]],formula:'θ̇ᵢ=ωᵢ+(K/N)Σⱼ sin(θⱼ−θᵢ)=ωᵢ+Kr sin(ψ−θᵢ)',question:'每个振子的天然频率不同，怎样仍形成共同的节奏？',model:'80 个全连接相位振子，天然频率为固定种子的高斯样本；圆点表示相位。',method:'均值场等价式，显式 Euler Δt=0.03；所有相位同步更新。',obs:['比较 K=0 与 K=2。','圆点聚拢不代表所有频率都完全锁定。'],limits:'r 是瞬时相位一致度；不是“所有振子已锁频”的充分证据。',link:'接原 04：位置与速度的对齐，变为相位的同步。',ref:'kura',plot:'同步序参量 r=|Σeⁱθ|/N。'},
ca:{title:'一维元胞自动机：Rule 30 / 110',make:()=>new M.ElementaryCA(),batch:1,param:[['rule','规则编号',0,255,1]],formula:'邻域码 k=4aᵢ₋₁+2aᵢ+aᵢ₊₁；aᵢⁿ⁺¹=(rule >> k)&1',question:'八种三格邻域的输出位，能生成怎样不同的时空图案？',model:'301 个格点，周期边界，单个活细胞起点。每行是一代，时间向下。',method:'精确离散规则、同步更新；保留最近300代。',obs:['输入规则30，再试110、90、184。','最顶层与当前行不同，是时间的堆叠。'],limits:'本页显示有限环面和有限时间，不复现 Rule110 通用计算构造的证明。',link:'接原 02 与 05，以更小的规则空间比较确定性与复杂性。',plot:'每代活细胞比例。'},
dla:{title:'DLA：随机游走长出分形枝杈',make:()=>new M.DLA(),batch:1,formula:'粒子作最近邻随机游走；首次接触团簇的四邻域即不可逆粘附。',question:'没有预先画出的枝条，为什么尖端更容易继续生长？',model:'160² 方格、中心种子。粒子从团簇外6格发射，远离18格则重新发射。',method:'有界计算域的单粒子 DLA，固定伪随机种子；接近边缘时自动停止。',obs:['比较突出尖端与凹槽的生长机会。','重新开始会重放同一随机序列。'],limits:'发射／丢弃圆与有限格点会影响形态；本页不估计严格分形维数。',link:'接原 08 的几何分形与 06 的扩散概念。',ref:'dla',plot:'团簇粒子数随计算批次增长。'},
sand:{title:'BTW 沙堆：缓慢加粒与雪崩',make:()=>new M.Sandpile(),batch:8,formula:'hᵢ≥4：hᵢ←hᵢ−4，四邻居各+1；边界外颗粒流失。',question:'一次只加一粒，为什么有时局部不动，有时触发大片连锁？',model:'48² 开放边界，初始每格2粒；前一次崩塌完全结束后才加下一粒。',method:'队列执行合法倾倒，累积每次雪崩的总倾倒次数；这是精确离散模型。',obs:['注意上一次雪崩规模不是丢失的粒数。','积累足够事件，再比较大小雪崩频数。'],limits:'有限样本的直方图不能证明幂律或临界性；空白柱表示未观测到。',link:'接原 02 局部规则与 04 集体行为；开放边界使持续输入能够流出。',ref:'sand',plot:'雪崩规模按2的幂分箱；横轴 log₂规模，纵轴事件数。'},
ising:{title:'Ising：温度与有序—无序',make:()=>new M.Ising(),batch:1,param:[['temp','无量纲温度 T',.1,5,.01]],formula:'H=−Σ邻接 sᵢsⱼ；ΔE=2sᵢΣ邻居sⱼ；P接受=min(1,e⁻ΔE/T)',question:'局部偏好一致，为什么高温下仍会无序？',model:'72² 周期方格，s=±1，J=kB=1、外场为0。',method:'Metropolis 随机单自旋翻转；每步尝试N次（一次蒙特卡罗 sweep）。',obs:['比较 T=1 与4；看磁化与畴的演化。','接近临界区域要等更久才能平衡。'],limits:'翻转动画是采样过程，不是真实磁畴的微观时间；临界附近自相关强。',link:'接原 04 的序参量，用平衡统计模型对照活性粒子。',plot:'磁化 m=Σs/N，范围−1到1。'},
cylinder:{title:'圆柱尾流：让障碍物真正进入流场',make:()=>new F.CylinderFlow(),batch:6,param:[['inlet','入口峰值速度 U（格子单位）',.04,.09,.001]],formula:'fᵢ(x+cᵢ,t+1)=fᵢ−(fᵢ−fᵢᵉᑫ)/τ；ν=(τ−0.5)/3',question:'为什么有障碍物的流动会形成交替脱落的尾涡？',model:'160×64 D2Q9，圆柱半径7；壁面与圆柱反弹边界，Zou–He 抛物线速度入口、定密度压力出口，τ=0.54。颜色为涡量，灰色为固体。',method:'BGK 碰撞与迁移；轻微入口横向扰动打破对称；每步都重算密度与速度。',obs:['加快计算，待入口流过区域多次后再看尾部。','比较入口速度与显示的 Reynolds 数。'],limits:'弱可压教学 LBM；出入口重构、粗网格及有限区域影响涡街。未做网格收敛、阻力系数或 Strouhal 基准验证。',link:'接原06，但新增障碍物和出入流边界，不再是周期双涡染料。',ref:'flow',plot:'圆柱后方固定测点的横向速度；格子时间。'},
convection:{title:'Rayleigh–Bénard：温度、浮力与对流',make:()=>new F.Convection(),batch:3,param:[['ra','Rayleigh 数 Ra',100,12000,100]],formula:'Tₜ+u·∇T=κ∇²T；ωₜ+u·∇ω=ν∇²ω+α∂ₓT；−∇²ψ=ω',question:'下热上冷的导热状态，什么时候被上升和下降的运动替代？',model:'80×40，左右周期；底T=1、顶T=0；ψ=ω=0（不可穿透、自由滑移），ν=κ=0.2；α=Raνκ/H³。起点含微弱温度与滚动扰动；颜色为温度，箭头为速度。',method:'涡量—流函数 Boussinesq 模型；Poisson 每步25次 Jacobi，迎风平流、显式扩散，Δt=0.15，h=1。',obs:['提高Ra并加快，观察导热条带逐渐弯曲。','看动能是否增长；颜色变化应与速度对应。'],limits:'自由滑移不是实验常见的无滑移边界；迎风耗散、有限迭代和网格会改变临界值，本页不测定精确临界Ra。',link:'接原06与01：浮力不稳定引出有特征尺度的对流结构。',plot:'区域平均动能，格子单位。'},
cart:{title:'小车倒立摆：能量摆起 → LQR',make:()=>new M.CartPole(),batch:4,param:[['limit','水平力上限',5,40,.5]],formula:'(M+m sin²θ)ẍ=F+m sinθ(lω²+g cosθ)；lθ̈=−ẍ cosθ−g sinθ',question:'只能推小车，怎样把下垂的摆送到上方并保持平衡？',model:'M=1、m=0.2、l=1，θ从下垂计算；只施加水平力F，无摆轴力矩。',method:'完整非线性方程 RK4 h=0.01；LQR由直立附近离散化模型的 Riccati 迭代计算；能量摆起在小角度／角速度时切换到LQR。',obs:['点“从下垂摆起”，看控制方式何时切换。','降低力上限，比较摆起与局部平衡。'],limits:'无实际轨道长度、摩擦、传感器噪声和延迟；摆起成功只对应这里的初值与参数，不是全局保证。',link:'接原07的直接驱动摆；现在是欠驱动的小车—摆耦合。',ref:'cart',plot:'角误差 θ−π（折回−π到π）与小车位置 x。'},
nca:{title:'NCA：实际学习一个局部更新规则',make:()=>new NeuralCA(),batch:1,formula:'pᵢ=[sᵢ,四邻均值]；sᵢ⁺=sᵢ+0.25 V tanh(Wpᵢ)；L=MSE(可见通道,目标)',question:'把同一个小网络应用到每个细胞，能从种子学会长出一个目标吗？',model:'12² 网格、每格4通道、8隐藏单元；20步展开，目标为小圆盘。左图是当前网络生长20步的输出，右图为目标。没有坐标输入与偏置。',method:'浏览器内手写时间反向传播与 Adam；共享 W、V 均实际更新。损失图与训练轮数会随训练变化。',obs:['先训练约150轮，看MSE是否下降。','点擦除，停止训练，用当前规则观察能否修复；也可能继续变形。'],limits:'这是小型独立NCA，非论文16通道壁虎模型；没有论文的随机更新、存活掩码、样本池和损伤训练。仅学固定20步目标，长期保持或自修复未获保证。',link:'接原02、03，局部规则从手写变为由目标训练得到。',ref:'nca',plot:'每个训练轮次的目标均方误差；仅当前浏览器内存，不保存模型。'},
aco:{title:'蚁群优化：用信息素寻找短回路',make:()=>new M.ACO(),batch:1,param:[['evap','信息素蒸发比例',.05,.8,.01]],formula:'P(i→j) ∝ τᵢⱼ / dᵢⱼ³；τ←(1−ρ)τ + Σ每只蚂蚁 1/L',question:'不枚举所有路线，能否通过重复探索逐渐改进巡回路径？',model:'22个固定城市，每代24只蚂蚁；访问每城一次后返回起点。',method:'按概率构造完整路线；蒸发后按路线长度反比增强信息素；始终保存历史最短路线。',obs:['看早期交叉边是否逐步消失。','比较高低蒸发率：探索和过早集中之间的关系。'],limits:'启发式搜索；历史最好长度单调改进不代表已达到全局最优。',link:'接原05的环境痕迹与04的集体信息。',ref:'aco',plot:'历史最好巡回长度，城市坐标单位。'},
physarum:{title:'粘菌启发的感知—沉积粒子模型',make:()=>new M.Physarum(),batch:2,param:[['decay','痕迹每步衰减',.01,.15,.001]],formula:'前／左／右感知 → 转向 → 移动 → 沉积；痕迹←(1−衰减)·3×3平均',question:'许多只读取并写入局部痕迹的粒子，如何组织成线状网络？',model:'1300粒子、112²周期网格，3个固定吸引源；传感器距离7、角度±0.6，单步转角0.35。',method:'顺序智能体沉积后对场做同步扩散和衰减；确定的随机种子。',obs:['比较强衰减与弱衰减的线宽、网络连通性。','观察吸引源附近与远处的通道差异。'],limits:'Jones式机制的简化变体，非生物粘菌的完整模型，不保证最短路、Steiner树或运输效率最优。',link:'接原05：颜色痕迹变成会扩散、会挥发的环境场。',ref:'phys',plot:'平均环境痕迹浓度。'}
};
const experimentStories={
  "logistic": [
    "池塘里的鱼，为什么会忽多忽少？",
    "设想一个池塘：鱼少时，食物充足，数量容易增长；鱼多时，又要争夺有限的资源。如果每一年都按同一条简单规则更新，最后会稳定下来吗？把增长能力调高，你可能看到年年交替的数量，甚至越来越难预测的起伏。这里用一个比例代表种群，探索增长与拥挤之间的竞争，并不拟合某个真实池塘。",
    "先猜一猜：繁殖能力越强，数量就会越稳定吗？依次试 r=2.9、3.2、3.5 和3.9。"
  ],
  "double": [
    "两只双摆，能一直跳同一支舞吗？",
    "把一根摆的末端再接上一根摆，同时放开两套几乎相同的装置。起初它们像镜子里的彼此，过一会儿却可能各跳各的。规则没有换，也没有人偷偷推它们；差别藏在最初那个极小的角度里。这个实验让你看见：知道运动规律，和长期准确预报运动，是两个不同的问题。",
    "先猜一猜：两套摆大幅分开之前，会不会先有一段几乎重合的时间？先看动画，再看距离曲线。"
  ],
  "driven": [
    "每次都按节拍推，秋千就会按节拍摆吗？",
    "推秋千时，你会按节奏给它一点力。直觉上，稳定的节拍应该带来稳定的摆动，可如果推动足够强，摆可能翻转、错拍，甚至出现复杂运动。这里用正弦外力定时推动一个有阻尼的摆，再像定时拍照一样，每隔一个驱动周期记录一次状态。",
    "先猜一猜：周期性的输入，是否一定产生同周期的输出？比较 F=0.3 和1.2时，下方采样点的形状。"
  ],
  "lorenz": [
    "天气按物理规律走，为什么还难预报？",
    "想象两次天气计算，唯一差别是起点有一个小到几乎看不见的偏差。它们会永远接近吗？Lorenz 系统把这个问题压缩成三个相互作用的变量：轨迹在像蝴蝶双翼的区域里绕行，相近的起点却可能先后走向不同的一翼。这是低维模型里的可预测性问题，并不是在这里真的预测天气。",
    "先猜一猜：两条轨迹分开后，还会不会都留在同一片双翼形区域？跟着两种颜色看一会儿。"
  ],
  "gray": [
    "不用画笔，斑点能自己分裂吗？",
    "想象一张会发生反应的薄膜：一种物质不断被补充，另一种由局部反应产生，两者又向周围扩散。你只在中心留下一个小扰动，随后不再作画。这个小区域能不能扩张、分裂成许多斑点，或者连成迷宫？Gray–Scott 模型让“反应配方”成为画笔，而你只改变补给和移除的速度。",
    "先猜一猜：同一块起点，换一点补给量，会只是长得快些，还是连形状也会变？一次只改一个参数。"
  ],
  "excitable": [
    "体育场的人浪，为什么不会一直举着手？",
    "设想看台上每个人看到邻座起身就跟着起身，但坐下后需要休息一会儿，不能立刻再来一次。这样一个简单过程就能把动作沿看台传下去。可激发介质也有“激发—恢复”的节奏；在二维平面上，断开的波头还可能绕着转。本页用简化方程观察这类传播，并不模拟具体的人群或心脏。",
    "先猜一猜：刚刚经过波浪的区域，为什么不能立刻再次被激发？追踪一个波头和它后面的恢复区。"
  ],
  "vicsek": [
    "大家都只看邻居，还能走向同一个方向吗？",
    "想象广场上许多人各自向前走：没有领队，只是不时看看附近的人，把自己的方向向大家靠拢，同时又有一点走偏。只靠这种局部妥协，整个群体会不会逐渐一起走？这里把人简化成恒速粒子，把走偏变成角度噪声，看看共同方向能否顶住扰动。",
    "先猜一猜：一点点噪声会让队伍立刻散掉吗？比较 η=0.3 和5，再看朝向一致度。"
  ],
  "kuramoto": [
    "一群各走各拍的节拍器，怎样合拍？",
    "想象一群节拍器，快慢各不相同。如果完全互不影响，它们很快就各打各的拍子；如果每个都能稍微被其他节奏拉动，会不会慢慢合拍？Kuramoto 模型先不管节拍器的机械细节，只保留每个节奏走到哪一拍，以及彼此拉近的强度。圆上的点，就是这些不同步的时钟。",
    "先猜一猜：互相影响要多强，才会出现一群靠拢的点？从 K=0 调到2，观察同步指标。"
  ],
  "ca": [
    "只有一排灯，能写出多复杂的图案？",
    "给你一排只会亮灭的小灯。每盏灯下一刻的状态，只取决于自己和左右邻居三个开关；全部规则只需要填八个答案。把每一刻的灯排往下抄一行，时间就成了一张图。有的规则画出整齐三角形，有的却像噪声。同样短的一张规则表，为什么能带来如此不同的世界？",
    "先猜一猜：从一个亮点出发，Rule 30、90 和110 哪个最像随机图？切换后从顶部往下看。"
  ],
  "dla": [
    "没人设计的枝条，为什么越长越分叉？",
    "想象一颗颗粒子在平面上乱走，碰到中央已有的团块就粘住，不再离开。没有谁指定哪里该长一根枝，团块却可能逐渐长出分叉。突出的尖端容易遇到新粒子，藏在枝间的凹处则不容易被走到。随机的碰撞，能不能留下看起来像珊瑚的形状？",
    "先猜一猜：下一颗粒子更容易粘在尖端，还是深入凹槽？观察几个突出部位如何继续生长。"
  ],
  "sand": [
    "最后那一粒沙，为什么会引发一大片？",
    "你慢慢往沙堆上加沙，大多数时候只多了一小点，偶尔却突然滑下一片。这个方格沙堆把问题变得更简单：一格积够四粒，就向四邻各分一粒；邻居满了也继续分。同样只加一粒，影响范围为什么能差这么多？它让我们观察局部阈值怎样连成一串反应。",
    "先猜一猜：加沙的位置很小，是否意味着影响也一定很小？等几次雪崩，对照下面大小不同的事件统计。"
  ],
  "ising": [
    "磁铁里面的小方向，为什么有时能站成一队？",
    "想象每个格子都有一枚只能朝上或朝下的小指针。邻居喜欢方向一致，温度带来的扰动却不断让指针改变。冷的时候，大片同向区域可能长出来；热的时候，整齐队伍又难维持。Ising 模型把磁性中的合作与扰动，压缩成一个可以改变温度的棋盘。",
    "先猜一猜：温度升高后，是每枚指针都变弱了，还是大家更难保持一致？比较 T=1 和4。"
  ],
  "cylinder": [
    "桥墩后面的水，为什么会左右摇摆？",
    "看一根桥墩挡在水流中：水从两侧绕过去，后面却不一定留下一条笔直的尾巴，有时会交替卷出一串涡。障碍物明明没动，尾部为什么自己开始左右摆？这里用圆柱和简化流场，把这个问题缩到画面里。让来流走过足够长的时间，再看尾涡和测点信号。",
    "先猜一猜：左右对称的障碍物，会不会产生随时间交替的尾流？加快计算，观察圆柱后方。"
  ],
  "convection": [
    "锅底热起来，水为什么自己翻动？",
    "从底下加热一层液体，热量可以先慢慢传上去；在合适条件下，较热的流体上升、较冷的流体下沉，整层开始循环。没有勺子，谁在搅动？本页让温度影响浮力，再让流动搬运温度，并加入微弱初始扰动，看看这种相互作用如何放大或衰退。",
    "先猜一猜：把 Ra 调高，原先微弱的滚动会变强还是变弱？比较温度颜色、速度箭头和动能曲线。"
  ],
  "cart": [
    "手不能碰摆，只推小车也能把它立起来吗？",
    "现在把倒立摆放到一辆小车上，但取消摆轴上的电机：你只能左右推车，不能直接转动摆。要让下垂的摆站起来，先得像荡秋千一样积累能量，接近竖直后再及时切换到细小纠正。一个装置为什么需要两种控制策略？这次你能看到“摆起来”和“站得住”之间的交接。",
    "先猜一猜：一直使用直立附近的平衡控制，能从下垂起点摆起来吗？点“从下垂摆起”，留意控制方式切换。"
  ],
  "nca": [
    "不告诉每格该画哪里，能学会长出一个圆吗？",
    "想象一群小格子，每格只知道自己和邻居的状态，大家共用同一个小网络。我们不逐格告诉它们怎么画，只在演化20步后比较结果与目标圆盘，再调整共同规则。反复练习后，从一个种子能不能长出目标？这里训练的是小型神经细胞自动机，损失下降可以观察，但长期保持形状和损伤修复并不保证。",
    "先猜一猜：学会第20步长得像圆，等不等于以后永远是圆？先看训练进展，再试擦除和继续演化。"
  ],
  "aco": [
    "一群没地图的蚂蚁，怎样帮快递员找路线？",
    "假设快递员要走遍所有城市再回起点，路线太多，无法逐条试完。让许多虚拟蚂蚁各走一圈，短路线留下更强的信息素，旧痕迹又慢慢挥发，下一批就更容易沿好路线探索。这样的集体试错能不能不断缩短行程？它是搜索办法，找到越来越好的路不等于证明已找到最短路。",
    "先猜一猜：如果好路线的痕迹几乎不挥发，会更聪明，还是太早认定一条路？调节蒸发比例比较。"
  ],
  "physarum": [
    "没有总设计师，网络怎样自己长出来？",
    "设想许多小粒子在暗处走动，只能闻到前方、左边和右边的痕迹，走过后又留下自己的痕迹。痕迹会扩散、挥发，几个吸引源则不断把它们拉向特定位置。这些局部选择能否慢慢织出线状通道？本页借用粘菌启发的机制，让网络从行动与环境的循环里出现。",
    "先猜一猜：痕迹消失得太快或太慢，网络会有什么不同？调衰减参数，观察线宽和连接。"
  ]
};
const world=$('#world'),ctx=world.getContext('2d'),plot=$('#plot'),pc=plot.getContext('2d'),off=document.createElement('canvas'),oc=off.getContext('2d');let mode='',model,running=true,history=[],bif=null,lastSample=0;
const color={green:'#a7d8b6',pink:'#efacc5',blue:'#9bc8ee',bg:'#11261f',text:'#e3eee6'};
function text(c,str,x,y,size=15){c.fillStyle=color.text;c.font=`${size}px system-ui`;c.fillText(str,x,y);}
function line(c,points,col,width=1){if(points.length<2)return;c.strokeStyle=col;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
function circle(c,x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
function rect(nx,ny){const scale=Math.min(900/nx,540/ny);return[(900-scale*nx)/2,(540-scale*ny)/2,scale*nx,scale*ny];}
function field(a,nx,ny,scale=1,solid=null,flip=false){off.width=nx;off.height=ny;const im=oc.createImageData(nx,ny);for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){const i=y*nx+x,j=((flip?ny-1-y:y)*nx+x)*4,v=M.clip(a[i]*scale,0,1);if(solid&&solid[i]){im.data[j]=100;im.data[j+1]=112;im.data[j+2]=108;}else{im.data[j]=30+205*v;im.data[j+1]=55+140*v;im.data[j+2]=65+85*(1-v);}im.data[j+3]=255;}oc.putImageData(im,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(off,...rect(nx,ny));}
function centeredField(a,nx,ny,range,solid){off.width=nx;off.height=ny;const im=oc.createImageData(nx,ny);for(let i=0;i<a.length;i++){const v=M.clip(a[i]/range,-1,1),j=i*4;im.data[j]=solid&&solid[i]?100:24+Math.max(v,0)*220;im.data[j+1]=solid&&solid[i]?110:40+Math.abs(v)*130;im.data[j+2]=solid&&solid[i]?105:45+Math.max(-v,0)*210;im.data[j+3]=255;}oc.putImageData(im,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(off,...rect(nx,ny));}
function metric(){switch(mode){case'logistic':return`迭代 ${model.n} · x=${model.x.toFixed(5)} · λ估计 ${model.lyap.toFixed(3)}`;case'double':case'driven':case'lorenz':return`t=${model.t.toFixed(2)} · 邻轨距离 ${model.separation().toExponential(2)}`;case'gray':case'excitable':return`t=${model.t.toFixed(2)} · ${model.n}² 周期网格`;case'vicsek':return`步 ${model.nstep} · 一致度 ${model.order().toFixed(3)}`;case'kuramoto':return`t=${model.t.toFixed(1)} · r=${model.order()[0].toFixed(3)}`;case'ca':return`Rule ${model.rule} · 保留 ${model.rows.length} 代`;case'dla':return`${model.count} 个粒子 · 半径 ${model.radius.toFixed(1)} ${model.stopped?'· 已到计算边缘':''}`;case'sand':return`加入 ${model.grains} 粒 · 最近雪崩 ${model.last} 次倾倒 · 边界流失 ${model.lost}`;case'ising':return`sweep ${model.sweeps} · m=${model.magnet().toFixed(3)} · H/N=${(model.energy()/model.s.length).toFixed(3)}`;case'cylinder':return`格子步 ${model.steps} · Re峰值≈${model.reynolds().toFixed(1)} · 最大密度偏差 ${Math.max(...model.rho.map(v=>Math.abs(v-1))).toFixed(3)}`;case'convection':return`t=${model.t.toFixed(1)} · Ra=${model.ra} · 动能 ${model.energy().toExponential(3)}`;case'cart':return`t=${model.t.toFixed(1)} · ${model.controlMode} · x=${model.state[0].toFixed(2)} · F=${model.force(model.state).toFixed(2)}`;case'nca':return`训练 ${model.epoch} 轮 · 最近训练MSE ${model.loss.toFixed(5)} · ${model.training?'正在训练':'仅演化，不训练'}`;case'aco':return`代 ${model.gen} · 最好长度 ${Number.isFinite(model.length)?model.length.toFixed(4):'待计算'}`;case'physarum':return`步 ${model.steps} · ${model.agents.length} 粒子`;}}
function sample(){let v=0;switch(mode){case'logistic':v=model.x;break;case'double':case'lorenz':v=Math.log10(Math.max(1e-12,model.separation()));break;case'driven':return;case'gray':case'excitable':{const a=mode==='gray'?model.v:model.u;v=a.reduce((s,x)=>s+x,0)/a.length;break;}case'vicsek':v=model.order();break;case'kuramoto':v=model.order()[0];break;case'ca':v=model.row.reduce((s,x)=>s+x,0)/model.n;break;case'dla':v=model.count;break;case'sand':return;case'ising':v=model.magnet();break;case'cylinder':v=model.v[(model.ny>>1)*model.nx+Math.floor(model.nx*.65)];break;case'convection':v=model.energy();break;case'cart':v=M.wrap(model.state[2],TAU)-Math.PI;break;case'nca':v=model.loss;break;case'aco':v=model.length;break;case'physarum':v=model.field.reduce((s,x)=>s+x,0)/model.field.length;break;}if(Number.isFinite(v))history.push(v);if(history.length>700)history.shift();}
function plotDraw(){pc.fillStyle=color.bg;pc.fillRect(0,0,900,200);if(mode==='driven'){for(const[a,w]of model.section)circle(pc,450+a/Math.PI*400,100-w*22,2,color.pink);text(pc,`已取 ${model.section.length} 个周期截面点`,12,20);return;}if(mode==='sand'){const bins=Array(18).fill(0);for(const x of model.sizes)bins[Math.min(17,Math.floor(Math.log2(x)))]++;const max=Math.max(1,...bins);bins.forEach((x,i)=>{pc.fillStyle=color.green;pc.fillRect(30+i*47,175-145*x/max,35,145*x/max);});text(pc,`样本 ${model.sizes.length} · 最大分箱计数 ${max}`,12,20);return;}if(history.length<2){text(pc,'运行后显示轨迹或统计',15,25);return;}let lo=Math.min(...history),hi=Math.max(...history);if(['vicsek','kuramoto','ca','gray','excitable'].includes(mode)){lo=0;hi=1;}if(mode==='ising'){lo=-1;hi=1;}if(hi-lo<1e-10)hi=lo+1e-5;line(pc,history.map((v,i)=>[45+i*835/(history.length-1),175-145*(v-lo)/(hi-lo)]),color.green,1.5);text(pc,hi.toPrecision(3),5,22,12);text(pc,lo.toPrecision(3),5,183,12);text(pc,'时间／采样 →',770,195,12);}
function draw(){ctx.fillStyle=color.bg;ctx.fillRect(0,0,900,540);
if(mode==='logistic'){ctx.drawImage(bif,0,0);ctx.strokeStyle=color.pink;ctx.beginPath();ctx.moveTo((model.r-2.5)/1.5*900,0);ctx.lineTo((model.r-2.5)/1.5*900,540);ctx.stroke();text(ctx,'r：2.5 → 4；纵轴 x：0 → 1（向上）',15,25);}
else if(['gray','excitable'].includes(mode))field(mode==='gray'?model.v:model.u,model.n,model.n,mode==='gray'?2.6:1);
else if(mode==='double'){const pend=(y,c)=>{const[a,,b]=y,x1=450+110*Math.sin(a),y1=220+110*Math.cos(a),x2=x1+110*Math.sin(b),y2=y1+110*Math.cos(b);line(ctx,[[450,220],[x1,y1],[x2,y2]],c,3);circle(ctx,x1,y1,8,c);circle(ctx,x2,y2,8,c);};line(ctx,model.trail.map(y=>[450+110*(Math.sin(y[0])+Math.sin(y[2])),220+110*(Math.cos(y[0])+Math.cos(y[2]))]),'#42665a');pend(model.shadow,color.pink);pend(model.y,color.green);}
else if(mode==='driven'){const a=model.y[0];line(ctx,[[450,170],[450+180*Math.sin(a),170+180*Math.cos(a)]],color.green,5);circle(ctx,450+180*Math.sin(a),170+180*Math.cos(a),16,color.green);circle(ctx,450+180*Math.sin(model.shadow[0]),170+180*Math.cos(model.shadow[0]),8,color.pink);text(ctx,'相同周期外力 · 两份邻近初值',20,30);}
else if(mode==='lorenz'){line(ctx,model.trail.map(y=>[450+y[0]*16,510-y[2]*9]),color.green,1);circle(ctx,450+model.shadow[0]*16,510-model.shadow[2]*9,5,color.pink);text(ctx,'x−z 投影',15,25);}
else if(mode==='vicsek'){for(const b of model.birds){const x=180+b.x*3,y=b.y*3;line(ctx,[[x-6*Math.cos(b.a),y-6*Math.sin(b.a)],[x+6*Math.cos(b.a),y+6*Math.sin(b.a)]],color.green,2);}}
else if(mode==='kuramoto'){ctx.strokeStyle='#466452';ctx.beginPath();ctx.arc(450,270,190,0,TAU);ctx.stroke();for(const a of model.theta)circle(ctx,450+190*Math.cos(a),270+190*Math.sin(a),4,color.green);const[r,a]=model.order();line(ctx,[[450,270],[450+r*190*Math.cos(a),270+r*190*Math.sin(a)]],color.pink,4);}
else if(mode==='ca'){const a=new Float64Array(model.n*300);model.rows.forEach((r,y)=>a.set(r,y*model.n));field(a,model.n,300);}
else if(mode==='dla')field(model.grid,model.n,model.n);
else if(mode==='sand')field(model.grid,model.n,model.n,1/3);
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
function choose(id,scroll=false){if(!cfg[id])id='logistic';mode=id;const g=groups.find(g=>g[2].includes(id)),c=cfg[id];$('#group-name').textContent=`${String(groups.indexOf(g)+1).padStart(2,'0')} / ${g[1]}`;$('#title').textContent=c.title;$('#intro').textContent=c.question;const story=experimentStories[id];$('#story-title').textContent=story[0];$('#story-body').textContent=story[1];$('#story-task').textContent=story[2];$('#mode').replaceChildren(...g[2].map(k=>{const o=document.createElement('option');o.value=k;o.textContent=cfg[k].title;o.selected=k===id;return o;}));for(const el of $('#groups').children)el.setAttribute('aria-pressed',String(el.dataset.group===g[0]));for(const[key,target]of [['question','#question'],['formula','#formula'],['model','#model-note'],['method','#method'],['limits','#limits'],['link','#connection'],['plot','#plot-note']])$(target).textContent=c[key];$('#observations').replaceChildren(...c.obs.map(t=>{const li=document.createElement('li');li.textContent=t;return li;}));$('#source').replaceChildren();if(c.ref){const a=document.createElement('a');a.href=refs[c.ref][1];a.textContent=refs[c.ref][0];a.target='_blank';a.rel='noopener';$('#source').append('进一步阅读：',a);}$('#controls').replaceChildren();rebuild();for(const[key,label,min,max,step]of c.param||[]){const div=document.createElement('div');div.className='control';const lab=document.createElement('label');lab.htmlFor='p-'+key;lab.textContent=label;const out=document.createElement('output');out.textContent=model[key];lab.append(out);const input=document.createElement('input');input.type='range';input.id='p-'+key;input.dataset.key=key;input.min=min;input.max=max;input.step=step;input.value=model[key];input.addEventListener('input',()=>{out.textContent=input.value;rebuild(parameterValues());});div.append(lab,input);$('#controls').append(div);}$('#action').hidden=!['cart','nca','ca'].includes(id);$('#damage').hidden=id!=='nca';$('#action').textContent=id==='cart'?'从下垂摆起':id==='nca'?'停止／继续训练':'切换 Rule 30 / 110';if(scroll)$('#experiment').scrollIntoView({block:'start',behavior:'smooth'});}
for(const[id,title,ids]of groups){const b=document.createElement('button');b.dataset.group=id;b.setAttribute('aria-pressed','false');const n=document.createElement('span');n.textContent=`${String(groups.findIndex(g=>g[0]===id)+1).padStart(2,'0')} / ${ids.length} 个模型`;b.append(n,document.createTextNode(title));b.addEventListener('click',()=>{location.hash=ids[0];});$('#groups').append(b);}
$('#mode').addEventListener('change',e=>location.hash=e.target.value);window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(cfg[id])choose(id,true);});$('#reset').addEventListener('click',()=>rebuild(parameterValues()));$('#play').addEventListener('click',()=>{running=!running;syncPlay();});function syncPlay(){$('#play').textContent=running?'暂停':'继续';$('#play').setAttribute('aria-pressed',String(running));}
function advance(){model.step();if(mode==='dla'&&model.stopped){running=false;syncPlay();$('#status').textContent='团簇接近有限计算边缘，已停止。可重新开始。';}const a=mode==='cylinder'?model.rho:mode==='convection'?model.temp:['double','driven','lorenz'].includes(mode)?model.y:mode==='cart'?model.state:mode==='nca'?model.state:[];if(a.some(v=>!Number.isFinite(v))){running=false;syncPlay();$('#status').textContent='计算出现非有限值，已暂停。请重新开始并使用较温和的参数。';}sample();}
$('#step').addEventListener('click',()=>{running=false;syncPlay();advance();draw();});$('#action').addEventListener('click',()=>{if(mode==='cart'){model.mode='swing';model.state=[0,0,.1,0];model.t=0;history=[];}else if(mode==='nca')model.training=!model.training;else if(mode==='ca'){const rule=model.rule===30?110:30;rebuild({rule});$('#controls input').value=rule;$('#controls output').textContent=rule;}draw();});$('#damage').addEventListener('click',()=>{model.damage();draw();});
choose(location.hash.slice(1));if(matchMedia('(prefers-reduced-motion: reduce)').matches){running=false;syncPlay();}document.addEventListener('visibilitychange',()=>{if(document.hidden){running=false;syncPlay();}});
function frame(){if(running&&!document.hidden){const start=performance.now(),count=(cfg[mode].batch||1)*Number($('#speed').value);try{for(let i=0;i<count&&running;i++){advance();if(performance.now()-start>14)break;}draw();}catch(e){running=false;syncPlay();$('#status').textContent='计算已暂停：'+e.message;}}requestAnimationFrame(frame);}requestAnimationFrame(frame);
