# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概述

**一刻短剧** — 一个类抖音的短剧 SPA 应用，采用双框架支持（Vue 3 + React 18）。主应用使用 Vue 3 + Element Plus；React 18 + Arco Design 已集成用于并行开发。

## 常用命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动 Vite 开发服务器
pnpm build            # 生产构建（Vue + React）
pnpm build:analyze    # 构建并分析包大小
pnpm preview          # 预览生产构建
pnpm lint             # ESLint 检查并自动修复
pnpm format           # Prettier 格式化 src/
pnpm test             # 运行 Vitest 测试
pnpm prepare          # Husky git hooks

# SSR（React 服务端渲染）
pnpm build:ssr-client # 为 SSR 构建客户端 bundle
cd server && pnpm ssr # 启动 SSR 服务器，访问 http://127.0.0.1:8787
```

## 架构

### 双框架配置

项目通过 Vite 多入口构建**并行运行两个框架**：

| 框架 | 入口 | 路由类型 | UI 组件库 |
|------|------|----------|-----------|
| Vue 3 | `/yike/` | HTML5 History | Element Plus |
| React 18 | `/yike/src-react/index.html` | Hash Router | Arco Design |

两者共享：
- 来自 `src/styles/var.scss` 的 SCSS 变量
- 相同的构建输出目录 `dist/`
- 相同的 Vite 开发服务器

### 目录结构

```
src/                    # Vue 3 应用（主应用）
├── apis/               # API 模块（category, file, login, play）
├── router/              # Vue Router 配置
├── stores/             # Pinia 状态管理（user, drama, episode 等）
├── styles/             # 全局 SCSS（var.scss, main.scss, play.scss）
├── utils/              # 工具函数、请求封装、测试辅助
└── views/              # 页面组件（Home, Category, Detail 等）

src-react/              # React 18 应用（并行）
├── App.tsx             # React 根组件
├── main.tsx            # 客户端入口（HashRouter）
├── client-entry.tsx    # SSR 注水入口
├── routes/             # 路由配置（客户端 + SSR 变体）
├── views/Demo/         # Demo 页面组件
└── hooks/              # 自定义 React Hooks

server/                  # Express 后端
├── src/ssr/            # SSR 服务器（server.tsx）
└── public/             # SSR 客户端 bundle 输出
```

### Vite 多入口配置

`vite.config.js` 定义了两个入口：
- `main` → `index.html`（Vue 应用，路径 `/yike/`）
- `react` → `src-react/index.html`（React 应用，路径 `/yike/src-react/index.html`）

### SSR 架构

React SSR 使用 Express + `renderToString`：
1. `webpack.client.config.js` 构建 `src-react/client-entry.tsx` → `server/public/bundle.js`
2. `server/src/ssr/server.tsx` 在服务端渲染 React 组件
3. 客户端从 `bundle.js` 进行注水

注意：浏览器 API（`window`、`localStorage`）只在客户端注水后才能使用 — 请使用 `useEffect`。

### 状态管理

- **Vue**：Pinia stores + `pinia-plugin-persistedstate` 插件实现 localStorage 持久化
- **React**：组件本地状态 + Hooks；需要 SSR 安全模式

## 关键技术点

1. **基础路径**：所有路由前缀为 `/yike/`（适配 GitHub Pages 部署）
2. **SCSS 自动注入**：`var.scss` 变量通过 vite.config.js 的 `additionalData` 自动注入
3. **React Vite 插件**：使用 `@vitejs/plugin-react` v5.0.4（兼容 Vite 7）
4. **TypeScript**：通过 `includes` 配置在 Vue（`src/`）和 React（`src-react/`）间共享
5. **遗留 Webpack**：`webpack.client.config.js` 仅用于 SSR 客户端构建，非主应用
