# 一刻短剧 — Agent 开发指南

> 一个高仿抖音的短剧 SPA 全栈应用，基于 Vue 3 + React 18 + Pinia + Vite + Element Plus + Arco Design + TypeScript 构建。

## 技术栈

### Vue 技术栈
- **前端框架**: Vue 3, Vue Router, Pinia
- **UI 组件库**: Element Plus
- **样式**: SCSS

### React 技术栈
- **前端框架**: React 18, React Router DOM 7
- **UI 组件库**: Arco Design Web React
- **样式**: SCSS

### 通用
- **构建工具**: Vite 7, Webpack (遗留)
- **测试**: Vitest
- **后端**: Express (参见 server/ 目录)
- **语言**: JavaScript, TypeScript

## 核心原则

1. **优先使用 Agent** — 将领域任务委托给专业 Agent 处理
2. **测试驱动** — 实现前先写测试，覆盖率需达 80%+
3. **安全优先** — 不妥协安全问题；验证所有输入
4. **不可变性** — 始终创建新对象，绝不修改现有对象
5. **先规划后执行** — 复杂功能先规划再写代码

## 可用 Agent

| Agent | 用途 | 使用场景 |
|-------|------|----------|
| planner | 实施规划 | 复杂功能、重构 |
| architect | 系统设计 | 架构决策 |
| tdd-guide | 测试驱动开发 | 新功能、Bug 修复 |
| code-reviewer | 代码质量评审 | 编写/修改代码后 |
| security-reviewer | 安全漏洞检测 | 提交前、敏感代码 |
| build-error-resolver | 修复构建/类型错误 | 构建失败时 |
| e2e-runner | 端到端 Playwright 测试 | 关键用户流程 |
| refactor-cleaner | 死代码清理 | 代码维护 |
| doc-updater | 文档和代码地图更新 | 更新文档 |
| docs-lookup | 文档和 API 参考研究 | 库/API 文档问题 |
| typescript-reviewer | TypeScript/JavaScript 评审 | TypeScript/JavaScript 项目 |
| frontend-design | 前端 UI/UX 设计 | UI 改进、样式调整 |

## Agent 协作

主动使用 Agent，无需用户提示：
- 复杂功能请求 → **planner**
- 刚写完代码 → **code-reviewer**
- Bug 修复或新功能 → **tdd-guide**
- 架构决策 → **architect**
- 安全敏感代码 → **security-reviewer**
- UI/样式改进 → **frontend-design**

独立任务并行执行，同时启动多个 Agent。

## 安全规范

**提交前必须检查：**
- 无硬编码密钥（API Key、密码、Token）
- 验证所有用户输入
- XSS 防护（HTML 清洗）
- 认证/授权验证
- 错误信息不泄露敏感数据

**密钥管理：** 禁止硬编码密钥，使用环境变量。启动时验证必需密钥。

## 编码规范

**不可变性（关键）：** 始终创建新对象，从不修改。返回应用了更改的新副本。

**文件组织：** 多小文件 > 少大文件。通常 200-400 行，最多 800 行。按功能/领域组织，而非按类型。

**错误处理：** 每层都要处理错误。UI 代码提供用户友好的消息，服务端记录详细上下文。

**输入验证：** 在系统边界验证所有用户输入。快速失败并给出清晰消息。

**代码质量清单：**
- 函数小（<50 行），文件专注（<800 行）
- 无深层嵌套（>4 层）
- 适当错误处理，无硬编码值
- 命名清晰易读

## Vue 规范

- 使用 Composition API 和 `<script setup>` 语法
- 使用 Pinia stores 管理状态
- 新工具和 store 优先使用 TypeScript
- 遵循 Vue 3 响应式最佳实践

## React 规范

- 使用函数组件和 Hooks
- 优先使用 TypeScript
- 组件文件使用 `.jsx`/`.tsx` 扩展名
- 样式使用 SCSS，与 Vue 项目共享样式变量

## 项目结构

### Vue 入口 (`src/`)

```
src/
├── apis/          — API 模块 (category, file, login, play)
├── assets/        — 静态资源 (图片)
├── router/        — Vue Router 配置
├── stores/        — Pinia 状态管理
├── styles/        — 全局 SCSS 样式
├── utils/         — 工具函数
│   └── test/      — 测试文件
└── views/         — Vue 页面组件
    ├── Category/  — 分类页
    ├── Detail/    — 详情页
    ├── Episode/   — 剧集页
    ├── Home/      — 首页（类抖音滑动）
    ├── Layout/    — 布局组件
    ├── Login/     — 登录页
    ├── Mine/      — 我的页面
    ├── Play/      — 播放页
    ├── Start/     — 启动页
    └── Upload/    — 上传页
```

### React 入口 (`src-react/`)

```
src-react/
├── index.html     — React 应用入口 HTML
├── main.jsx       — React 应用入口 JSX
└── views/         — React 页面组件
    └── Demo/      — 示例页面
```

## 多框架共存

本项目同时支持 Vue 和 React：

| 入口 | 访问路径 | 说明 |
|------|----------|------|
| Vue | `/yike/` | 主应用（抖音风格短剧平台） |
| React | `/yike/src-react/index.html` | React 测试页面（Arco Design） |

**注意：** 两个框架独立运行，各自有独立的路由系统。共享 SCSS 变量（`src/styles/var.scss`）。

## 核心功能

- **首页**：类抖音上下滑动加载视频、播放记录、收藏与喜欢（本地存储）
- **分类**：短剧分类浏览
- **剧集**：剧集信息、选集、详情页
- **我的**：个人信息展示
- **播放**：竖屏短视频播放体验，手势控制

## 测试要求

**最低覆盖率：80%**

测试类型（全部需要）：
1. **单元测试** — 独立函数、工具、组件
2. **集成测试** — API 端点、store 操作
3. **E2E 测试** — 关键用户流程

**TDD 工作流（强制）：**
1. 先写测试（RED）— 测试应该失败
2. 写最小实现（GREEN）— 测试应该通过
3. 重构（IMPROVE）— 验证覆盖率 80%+

## 开发工作流

1. **规划** — 复杂功能使用 planner agent
2. **TDD** — 使用 tdd-guide agent，先写测试
3. **评审** — 写完代码后使用 code-reviewer agent
4. **提交** — 使用常规提交格式

## Git 工作流

**提交格式：** `<type>: <description>` — 类型：feat, fix, refactor, docs, test, chore, perf, ci

## 性能优化

- 使用 Vite 实现快速 HMR 和构建
- 路由懒加载优化首屏
- 图片使用 imagemin 压缩和 WebP 格式
- 视频队列管理："播一预一"机制
- 高频事件（滑动、滚轮）防抖节流处理
- 使用 `<KeepAlive>` 和 `<Transition>` 实现状态缓存和过渡

## 常用脚本

```bash
pnpm install      # 安装依赖
pnpm dev          # 启动开发服务器
pnpm build        # 生产构建（Vue + React）
pnpm build:analyze # 构建并分析包大小
pnpm preview      # 预览生产构建
pnpm lint         # ESLint 检查并自动修复
pnpm format       # Prettier 格式化
pnpm test         # 运行 Vitest 测试
```

## 依赖说明

### 主要新增依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| react | 19.x | React 框架核心 |
| react-dom | 19.x | React DOM 渲染 |
| react-router-dom | 7.x | React 路由 |
| @arco-design/web-react | 2.66.x | 字节跳动 UI 组件库 |
| @vitejs/plugin-react | 5.0.4 | Vite React 插件 |

### Vite 配置说明

- `@vitejs/plugin-react` 使用 v5.0.4（兼容 Vite 7）
- 多入口配置：`rollupOptions.input` 包含 `main` (Vue) 和 `react`
- SCSS 预处理器配置了 `additionalData` 自动注入 `var.scss` 变量
