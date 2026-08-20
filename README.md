# AETHELGARD - 原创 3D 镂空机械腕表沉浸式展示

> 🎬 **在线 Demo (GitHub Pages)** → https://changsheng0804-blip.github.io/aethelgard-skeleton-watch/

![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-success?style=flat-square&logo=github)
![Three.js](https://img.shields.io/badge/Three.js-r128-049EF4?style=flat-square&logo=three.js)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

AETHELGARD 是一枚基于 WebGL 与 Three.js 原生程序化建模构建的高级 3D 镂空机械腕表数字孪生展品。具备电影级奢华布光、真实物理材质、精准多级齿轮啮合动力学以及高频往复谐振游丝摆轮系统。

---

## 🌟 核心设计与特性

### 1. 结构与程序化建模
- **双曲面蓝宝石表镜 (Sapphire Crystal)**：高透光率（$IOR=1.77$），微弱紫蓝抗反射镀膜（AR Coating）菲涅尔高光。
- **复合金属表壳与表圈 (Case & Bezel)**：银黑金属拉丝中壳、倒角精抛光表圈、人体工学弧形表耳与蓝钢固定螺丝。
- **立体时标镂空表盘 (Skeleton Dial)**：微米级轨道式分钟刻度圈、12点位双柱式玫瑰金立体时标、日内瓦波纹夹板与红宝石轴承（Ruby Jewels）。
- **3点钟防滑表冠 (Fluted Crown)**：双色金环镶嵌与微雕凹槽。
- **手工缝线深棕皮革表带 (Brown Alligator Leather Strap)**：凹凸皮革有机纹理与自然曲率下垂，配以米色手工双排缝线与折叠式金属表扣。
- **奢华展示台与软垫 (Podium & Cushion)**：同心圆金属阶梯展台与暖金氛围光环。

### 2. 机械动力学与轮系啮合
- **5+ 级啮合传动轮系**：
  1. **大发条盒轮 (Mainspring Barrel)**：钛金双色骨架，主驱动轮；
  2. **二轮/中心轮 (Center Wheel)**：玫瑰金镂空轮，与发条盒齿轮反向啮合；
  3. **三轮 (Third Wheel)**：银色精抛光轮，带小齿轴过渡；
  4. **四轮/秒轮 (Fourth Wheel)**：驱动中央/副盘秒针；
  5. **星芒擒纵轮 (Swiss Lever Escape Wheel)**：特制棘爪形擒纵齿；
  6. **上条过渡齿轮 (Winding Wheel)**：上部机械联动辅助轮。
  *严格满足相邻齿轮角速度反向与模数齿数比率：$\omega_{i+1} = -\omega_i \cdot \frac{Z_i}{Z_{i+1}}$。*
- **4Hz (28,800 vph) 谐振摆轮与游丝系统**：
  - 摆轮外缘配置 12 颗微型配重调校金螺钉；
  - 动态阿基米德螺旋游丝随摆轮振荡实时物理收缩与舒张；
  - 擒纵叉同步微动摇摆。
- **三针系统**：经典镂空剑形玫瑰金时针与分针，超细平衡点蓝钢秒针平滑扫秒（Smooth Sweep）。

### 3. 交互与控制
- **电影级视角预设**：
  - 🏛️ **全景展示 (Overview)**：经典广告 45° 黄金视角；
  - 🔍 **镂空微距 (Macro Close-up)**：近距离观察齿轮咬合、红宝石轴承与游丝呼吸；
  - ✨ **侧影表冠 (Crown & Profile)**：展示表镜弧度与表冠侧边细节；
  - ⚙️ **机械背透 (Caseback)**：翻转展示透底底盖与背部机芯。
- **机械爆炸分解视图 (Exploded View)**：一键将表镜、表圈、指针、刻度环、夹板、齿轮组、表壳逐层平滑展开。
- **转速调节**：支持 0.1x 超级慢动作到 3.0x 快速运转。
- **材质与布光切换**：提供黑金、白金、黑曜三种材质，以及奢华、暗夜、暖金三种影棚布光。
- **Web Audio 机械擒纵音效**：内置纯代码合成的机械表清脆滴答声。

---

## 🚀 运行方式

### 在线访问（推荐）
直接打开 GitHub Pages 部署的静态页面，无需本地环境：
**https://changsheng0804-blip.github.io/aethelgard-skeleton-watch/**

### 本地运行
无需安装任何后端或依赖，直接在浏览器中打开 `index.html` 即可：
- 双击 `index.html`，或使用 VS Code Live Server、Python/Node 静态服务器访问。
```bash
# Python 静态服务器示例
python -m http.server 8000
# 然后访问 http://localhost:8000
```

---

## 🌐 GitHub Pages 部署说明

本项目为纯静态站点（`index.html` + `css/` + `js/`），已配置 GitHub Pages 自动部署：

- **部署分支**: `main` / 根目录 `/`
- **静态资源**: 已添加 `.nojekyll` 避免 Jekyll 处理，确保 Three.js 等资源正常加载
- **自动构建**: 每次推送到 `main` 分支，GitHub Pages 会自动重新构建
- **访问地址**: https://changsheng0804-blip.github.io/aethelgard-skeleton-watch/
- **仓库地址**: https://github.com/changsheng0804-blip/aethelgard-skeleton-watch

### 重新部署
```bash
git add .
git commit -m "update: ..."
git push origin main
```

---

## 📁 项目结构

```
.
├── index.html          # 主页面 - 沉浸式 UI + Canvas 容器
├── css/style.css       # 奢华深色主题样式
├── js/
│   ├── app.js          # 主应用逻辑、相机预设、交互控制
│   ├── watch_model.js  # 程序化腕表建模（表壳/表盘/指针等）
│   ├── gear_physics.js # 齿轮啮合物理与传动比计算
│   ├── materials.js    # PBR 材质系统（金/钛/皮革/蓝宝石）
│   ├── lighting.js     # 影棚三点布光预设
│   ├── textures.js     # 程序化纹理生成
│   └── audio_synth.js  # Web Audio 擒纵滴答合成
├── README.md           # 本说明文档
└── .nojekyll           # 禁用 Jekyll 处理
```
