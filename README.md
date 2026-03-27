<div align="center">

<img width="260" alt="logo" src="https://github.com/DanoAndHolidays/yike/blob/main/media/logo.png?raw=true">

<img width="120" alt="icon" src="https://github.com/DanoAndHolidays/yike/blob/main/media/icon.png?raw=true">

# 一刻短剧

![](https://img.shields.io/badge/Sass-953357) ![](https://img.shields.io/badge/Vite-FFAB00) ![](https://img.shields.io/badge/JSes6-FFCA28) ![](https://img.shields.io/badge/Pinia-fFD551) ![](https://img.shields.io/badge/Vue3-41B883) ![](https://img.shields.io/badge/ElementPlus-44A3FF) ![](https://img.shields.io/badge/TS-0288D1) ![](https://img.shields.io/badge/CSS3-7E57C2)

</div>

### 项目地址

[一刻短剧：](https://danoandholidays.github.io/yike/)https://danoandholidays.github.io/yike/ _推荐使用移动设备打开_

> 项目具有使用**Express构建的node后端**，可以拉取仓库，**本地启用服务**体验完整功能

### 项目介绍

**一刻短剧** 基于Apifox公开项目 **「悦享好剧」** 开发，仅做学习研究使用。

一个高仿抖音的**短剧SPA全栈应用**。复刻了核心交互，在性能优化、数据架构、工程化层面进行了实践探索

_由于短剧竖屏播放，所以全面**模仿抖音**，专注于短剧的竖屏播放体验，前端界面将模仿抖音的交互与视觉风格。也算是我之前开发的网站 [PLAYLET-APP](https://danoandholidays.github.io/PLAYLET-APP/) 的二次开发。之前的项目，原生开发功能全靠手撸，所以有很多问题和没有写完的部分，我也不打算改了，直接重新写一个。_

- 若有Bug请发邮件或在GitHub中提出issue。

### 功能实现

- 「首页」类抖音滑动加载。观看记录、收藏与喜欢（存储于本地
- 「分类」短剧分类
- 「上传」调用摄像头，记录生活（暂未实现
- 「剧集」剧集信息、选集信息与观看信息、详情页
- 「我的」静态的个人信息展示
- 项目具有后端部分，启用服务可以体验更加全面的服务。但不本地部署、不启动服务，也可以体验近乎完整的短剧播放体验

<p align="center">
  <img src="https://github.com/DanoAndHolidays/yike/blob/main/media/home.gif?raw=true" width="200" style="display:inline-block;" />

  <img src="https://github.com/DanoAndHolidays/yike/blob/main/media/category.gif?raw=true" width="200" style="display:inline-block;" />

  <img src="https://github.com/DanoAndHolidays/yike/blob/main/media/episode.gif?raw=true" width="200" style="display:inline-block;" />

  <img src="https://github.com/DanoAndHolidays/yike/blob/main/media/mine.gif?raw=true" width="200" style="display:inline-block;" />

</p>
（有展示GIF，可能加载较慢）

### 项目亮点

#### 一、架构设计：

- **技术栈**：采用 `Vue 3` + `Pinia` + `Vite` + `Sass` + `ElementPlus` + `TS` + `Express`构建
- **组件化与抽象能力**：
  - **核心播放器组件化**：将复杂的视频播放与交互逻辑（手势处理、队列管理）封装成独立组件，并通过 Props/Events 实现与业务逻辑的解耦，体现了组件的高内聚、低耦合
  - **通用组件复用**：剧集选择、分享等功能均基于同一套抽屉组件扩展，通过灵活的插槽和状态注入，实现了UI与逻辑复用
- **持久化状态管理**：
  - 使用 `Pinia` 并配合持久化插件，构建了完整的客户端数据模型，管理了用户、剧集、播放记录等多维度状态。发现插件不能默认无法序列化 `Set/Map` 的问题，通过自定义或转换，确保了复杂数据结构的存储。

#### 二、核心实现：

- **滑动容器**：
  - **解决方案**：自主实现基于触摸/滚轮事件的监听与节流处理，动态计算位移并控制视频切换，实现了丝滑流畅的仿抖音体验
- **维护视频队列与预加载策略**：
  - **设计思路**：维护一个固定长度的播放队列（如5条），实现“播一预一”的机制。监听滑动行为，动态销毁不可见视频、预加载待播放视频，并触发下一批数据的请求。

#### 三、工程化：

- **完整的CI/CD流水线**：通过 GitHub Actions 实现了简单的Push部署的自动化流程
- **性能优化**：
  - **路由级懒加载**：通过实验验证了懒加载对首屏时间的优化效果，并最终采纳
  - **事件优化**：对滑动、滚轮等高频事件合理应用防抖与节流，确保了性能敏感场景下的页面流畅度。
  - 采用 `<KeepAlive>` 与 `<Transition>` 组合，实现了页面和组件的状态缓存与无缝过渡，提升了应用的质感。
- **核心工具函数使用TS类型重写**：保证调用时的稳定、减少维护成本
- **打包优化**：
  - 将部分库使用CDN引入，不将其打包。业务与库代码分离打包，通过文件指纹（hash值）缓存在本地。
  - 图片使用vite-plugin-imagemin进行压缩，并且转化为webp格式
  - 进行打包分析，对过大的包单独优化。仅引入库的core，按需引入。
  - 依赖于ES module动态引入、路由懒加载与异步组件懒加载，将路由级与组件级自动分割为包。

#### 四、用户体验：

- **多模式播放路径设计**：通过复用首页的滑动播放组件，设计“随机”与“追剧”两种用户场景，并通过统一的剧集抽屉和详情页进行串联
- **跨端交互适配**：移动优先，为桌面端也提供了键盘、滚轮等交互支持（可能会有Bug

> 「一刻短剧Yike」应该算是我第一次系统地独立完成的一个功能完整的项目，虽然技术难点不够亮眼，没有高大上的技巧，但也算是一个真正的开始，从最开始的“模仿界面”，到一个具有我自己UI/UX设计风格的APP，经历一个多月的时间，学会了很多，我也会持续的将新学的知识应用于此项目...

---

### API与请求库

基于Apifox悦享好剧开发（希望项目一直开放...）但仅有短剧相关、分类的部分。使用Axios发送请求

### 部分适配问题

- 适配绝大多数的桌面浏览器，推荐在浏览器中开启**开发者模式**（按F12）并切换**设备仿真**为安卓机型，体验移动端效果
- 目前部分苹果机型不能自动播放

### 版本

- v1.0.0于10.18.2025发布，完成了基本的功能

---

---

## 项目统计与分析 (Auto-generated)

### 代码行数统计

项目核心代码统计结果如下：

- **总行数**：7,180 行
- **主要组成部分**：
  - **前端 (src/)**：Vue 3 + Vite + Pinia + ElementPlus
  - **后端 (server/)**：Express Node.js Server

### 运行环境建议

- **Node.js**: 推荐版本 `^20.19.0 || >=22.12.0`
- **Package Manager**: `pnpm`

### 启动说明

1. **安装依赖**: `pnpm install`
2. **启动前端**: `pnpm dev`
3. **启动后端**: `cd server &amp;&amp; pnpm install &amp;&amp; npm run dev`

### vibe coding

配置了 AGENT.md、skill等
