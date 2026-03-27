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

| Agent                | 用途                       | 使用场景                   |
| -------------------- | -------------------------- | -------------------------- |
| planner              | 实施规划                   | 复杂功能、重构             |
| architect            | 系统设计                   | 架构决策                   |
| tdd-guide            | 测试驱动开发               | 新功能、Bug 修复           |
| code-reviewer        | 代码质量评审               | 编写/修改代码后            |
| security-reviewer    | 安全漏洞检测               | 提交前、敏感代码           |
| build-error-resolver | 修复构建/类型错误          | 构建失败时                 |
| e2e-runner           | 端到端 Playwright 测试     | 关键用户流程               |
| refactor-cleaner     | 死代码清理                 | 代码维护                   |
| doc-updater          | 文档和代码地图更新         | 更新文档                   |
| docs-lookup          | 文档和 API 参考研究        | 库/API 文档问题            |
| typescript-reviewer  | TypeScript/JavaScript 评审 | TypeScript/JavaScript 项目 |
| frontend-design      | 前端 UI/UX 设计            | UI 改进、样式调整          |

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

| 入口  | 访问路径                     | 说明                          |
| ----- | ---------------------------- | ----------------------------- |
| Vue   | `/yike/`                     | 主应用（抖音风格短剧平台）    |
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

| 依赖                   | 版本   | 用途               |
| ---------------------- | ------ | ------------------ |
| react                  | 19.x   | React 框架核心     |
| react-dom              | 19.x   | React DOM 渲染     |
| react-router-dom       | 7.x    | React 路由         |
| @arco-design/web-react | 2.66.x | 字节跳动 UI 组件库 |
| @vitejs/plugin-react   | 5.0.4  | Vite React 插件    |

### Vite 配置说明

- `@vitejs/plugin-react` 使用 v5.0.4（兼容 Vite 7）
- 多入口配置：`rollupOptions.input` 包含 `main` (Vue) 和 `react`
- SCSS 预处理器配置了 `additionalData` 自动注入 `var.scss` 变量

## React SSR 实现指南

### 概述

本项目支持 React 服务端渲染（SSR），通过 Express 服务器在服务端将 React 组件渲染为 HTML 字符串，然后返回给客户端进行"注水"（hydration）。

### 目录结构

```
server/
├── src/
│   └── ssr/
│       └── server.tsx  # SSR 服务器入口
├── public/
│   └── bundle.js       # 客户端构建产物
├── package.json        # SSR 服务器依赖
└── tsconfig.json       # TypeScript 配置

src-react/
├── App.tsx            # SSR 专用 App 组件
├── client-entry.tsx   # 客户端入口文件（用于注水）
├── views/Demo/
│   ├── index.tsx      # 客户端 Demo 组件
│   └── index.ssr.tsx  # SSR 专用 Demo 组件
└── routes/
    ├── index.ts       # 客户端路由配置
    └── index.ssr.ts   # SSR 路由配置

webpack.client.config.js  # 客户端 Webpack 配置
```

### 核心依赖

| 依赖             | 版本 | 用途                                                     |
| ---------------- | ---- | -------------------------------------------------------- |
| express          | 5.x  | 服务器框架                                               |
| tsx              | 4.x  | TypeScript/JSX 运行时                                    |
| react            | 19.x | React 框架核心                                           |
| react-dom        | 19.x | 包含 `renderToString`（服务端）和 `createRoot`（客户端） |
| react-router-dom | 7.x  | 包含 `StaticRouter`（服务端）和 `HashRouter`（客户端）   |
| webpack          | 5.x  | 客户端构建工具                                           |
| ts-loader        | 9.x  | TypeScript 加载器                                        |

### 实现步骤

#### 1. 创建 SSR 专用组件

- 避免使用浏览器特定 API（如 `window`、`document`）
- 使用 `StaticRouter` 替代 `HashRouter`
- 移除客户端特定的代码（如 `createRoot`）

#### 2. 设置 SSR 服务器

- 安装 `tsx` 作为 TypeScript/JSX 运行时
- 配置 `tsconfig.json` 支持 TypeScript 解析
- 使用 `renderToString` 将 React 组件渲染为 HTML
- 注入渲染后的 HTML 到完整的 HTML 模板中
- 正确配置静态资源路由，确保 `/bundle.js` 能被访问

#### 3. 配置客户端注水（Hydration）

- 创建 `client-entry.tsx` 作为客户端入口
- 使用 `createRoot` 挂载相同的组件
- 构建客户端 bundle 并放置在 `server/public/` 目录
- 在 HTML 中引用 `/bundle.js`

#### 4. 处理路由

- 服务端：使用 `StaticRouter` 处理服务端路由
- 客户端：使用 `HashRouter` 处理客户端路由
- 避免在初始渲染时使用 `<Navigate>`（会导致 SSR 警告）

#### 5. 在 SSR 中使用浏览器 API（如 localStorage）

- **服务端不可用**：`localStorage` 等浏览器 API 在服务端不存在
- **使用 useEffect**：在 `useEffect` 钩子中访问浏览器 API（只在客户端执行）
- **环境检测**：始终检查 API 是否存在（`typeof localStorage !== 'undefined'`）
- **初始状态**：在服务端渲染时使用默认状态，客户端挂载后更新

#### 6. 构建和启动

- 构建客户端 bundle：`pnpm build:ssr-client`
- 启动 SSR 服务器：`cd server && pnpm ssr`
- 访问地址：`http://127.0.0.1:8787`

### 运行命令

```bash
# 进入 server 目录
cd server

# 安装依赖
pnpm install

# 启动 SSR 服务器
pnpm ssr

# 访问地址
# http://127.0.0.1:8787
```

### 常见问题与解决方案

| 问题                                                | 原因                          | 解决方案                                          |
| --------------------------------------------------- | ----------------------------- | ------------------------------------------------- |
| `SyntaxError: Unexpected token '<'`                 | Node.js 无法直接处理 JSX      | 使用 `tsx` 运行 TypeScript/JSX 文件               |
| `Missing parameter name at index 1: *`              | Express 5 不支持 `*` 通配符   | 使用 `app.use()` 替代 `app.get('*')`              |
| `<Navigate> must not be used on the initial render` | StaticRouter 不支持初始重定向 | 移除初始重定向，直接渲染目标组件                  |
| 端口被占用                                          | 其他服务正在使用相同端口      | 尝试使用其他端口（如 8787）                       |
| 组件渲染为空                                        | 可能存在浏览器特定代码        | 检查组件是否使用了 `window` 等浏览器 API          |
| 客户端未注水（Hydration 失败）                      | 缺少客户端 bundle.js          | 创建 `client-entry.tsx` 并构建 bundle.js          |
| bundle.js 返回 HTML 而非 JS                         | 路由处理顺序问题              | 将 `/bundle.js` 路由放在通用路由之前              |
| 静态资源路径错误                                    | `express.static()` 参数错误   | 使用正确的目录路径，或单独处理 `/bundle.js`       |
| localStorage 未在客户端显示                         | useEffect 未执行              | 确保 bundle.js 正确加载，useEffect 只在客户端执行 |

### 本次 SSR 实现的关键教训

1. **路由顺序很重要**：特定路由（如 `/bundle.js`）必须放在通用路由之前
2. **完整的 SSR 需要客户端注水**：服务端渲染只是第一步，必须有客户端 bundle.js 来激活组件
3. **浏览器 API 只能在客户端使用**：使用 `useEffect` 钩子确保代码只在客户端执行
4. **详细的日志记录有助于调试**：在服务器和客户端添加 console.log 可以快速定位问题
5. **测试 curl 响应**：使用 `curl http://127.0.0.1:8787` 可以验证服务端返回的内容是否正确

### 最佳实践

1. **分离 SSR 和客户端组件**：
   - 创建专门的 SSR 组件，避免浏览器特定代码
   - 保持 SSR 和客户端路由配置同步

2. **性能优化**：
   - 减少 SSR 组件的复杂度
   - 避免在 SSR 期间进行网络请求
   - 使用缓存策略减少重复渲染

3. **错误处理**：
   - 包装 `renderToString` 调用在 try-catch 中
   - 提供友好的错误页面

4. **开发体验**：
   - 添加详细的日志记录
   - 使用热重载提高开发效率

### 示例代码

#### SSR 服务器入口 (`server.tsx`)

```typescript
import express from 'express'
import { renderToString } from 'react-dom/server'
import React from 'react'
import App from '../../../src-react/App'

const app = express()

app.use((req, res, next) => {
    console.log(`收到请求: ${req.method} ${req.url}`)
    next()
})

app.use((req, res) => {
    try {
        const appHtml = renderToString(<App location={req.url} />)
        const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>React SSR 应用</title>
  </head>
  <body>
    <div id="root">${appHtml}</div>
    <script src="/bundle.js"></script>
  </body>
</html>
`
        res.send(html)
    } catch (error) {
        console.error('渲染错误:', error)
        res.status(500).send('服务器错误')
    }
})

app.listen(8787, '127.0.0.1', () => {
    console.log('✅ SSR 服务器成功启动!')
    console.log('📡 访问地址: http://127.0.0.1:8787')
})
```

#### SSR 专用 App 组件 (`App.tsx`)

```typescript
import type { FC } from 'react'
import DemoSSR from './views/Demo/index.ssr'

interface AppProps {
    location?: string
}

const App: FC<AppProps> = ({ location = '/' }) => {
    return <DemoSSR />
}

export default App
```

### 更多示例代码

#### 客户端入口文件 (`client-entry.tsx`)

```typescript
import React from 'react'
import { createRoot } from 'react-dom/client'
import DemoSSR from './views/Demo/index.ssr'

console.log('客户端入口文件正在执行...')

const container = document.getElementById('root')
if (container) {
    console.log('找到 #root 元素，开始注水...')
    const root = createRoot(container)
    root.render(<DemoSSR />)
    console.log('注水完成！')
}
```

#### 客户端 Webpack 配置 (`webpack.client.config.js`)

```javascript
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
  mode: 'development',
  entry: './src-react/client-entry.tsx',
  output: {
    path: path.resolve(__dirname, 'server/public'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
    ],
  },
}
```

#### SSR 组件中使用 localStorage (`index.ssr.tsx`)

```typescript
import type { FC } from 'react'
import { useEffect, useState } from 'react'

const DemoSSR: FC = () => {
    const [isClient, setIsClient] = useState<boolean>(false)
    const [localStorageStatus, setLocalStorageStatus] = useState<string>('等待客户端挂载...')
    const [localStorageValue, setLocalStorageValue] = useState<string>('')

    useEffect(() => {
        console.log('useEffect 执行')
        setIsClient(true)

        try {
            if (typeof localStorage !== 'undefined') {
                console.log('localStorage 可用')
                const testValue = localStorage.getItem('test_key') || '首次访问'
                setLocalStorageValue(testValue)
                localStorage.setItem('test_key', `访问时间: ${new Date().toLocaleString()}`)
                setLocalStorageStatus('✓ localStorage 可用')
            } else {
                console.log('localStorage 不可用')
                setLocalStorageStatus('✗ localStorage 不可用（服务端）')
            }
        } catch (error) {
            console.error('localStorage 错误:', error)
            setLocalStorageStatus('✗ localStorage 访问失败')
        }
    }, [])

    return (
        <div>
            <div style={{
                marginTop: '16px',
                padding: '16px',
                background: isClient ? '#E6FFE6' : '#FFF7E6',
                borderRadius: '4px',
            }}>
                <h3 style={{ margin: '0 0 8px 0', color: isClient ? '#52C41A' : '#FA8C16' }}>
                    localStorage 测试
                </h3>
                <p style={{ margin: '0 0 8px 0' }}>
                    <strong>是否在客户端：</strong> {isClient ? '✓ 是' : '✗ 否（服务端渲染）'}
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                    <strong>localStorage 状态：</strong> {localStorageStatus}
                </p>
                <p style={{ margin: '0' }}>
                    <strong>存储的值：</strong> {localStorageValue}
                </p>
            </div>
        </div>
    )
}

export default DemoSSR
```

#### 更新后的 SSR 服务器 (`server.tsx`)

```typescript
import express from 'express'
import { renderToString } from 'react-dom/server'
import React from 'react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import App from '../../../src-react/App'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

console.log('SSR 服务器正在启动...')
console.log('工作目录:', process.cwd())
console.log('当前文件目录:', __dirname)

app.get('/bundle.js', (req, res, next) => {
    console.log(`收到请求: ${req.method} ${req.url}`)
    const bundlePath = path.join(__dirname, '../../public/bundle.js')
    console.log('请求 bundle.js，路径:', bundlePath)
    console.log('文件存在:', fs.existsSync(bundlePath))

    if (fs.existsSync(bundlePath)) {
        res.setHeader('Content-Type', 'application/javascript')
        fs.createReadStream(bundlePath).pipe(res)
    } else {
        res.status(404).send('bundle.js not found')
    }
})

app.use((req, res, next) => {
    console.log(`收到请求: ${req.method} ${req.url}`)
    next()
})

app.use((req, res) => {
    console.log('正在渲染 React 组件...')
    try {
        const appHtml = renderToString(<App location={req.url} />)
        console.log('React 组件渲染完成')

        const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>React SSR 应用</title>
  </head>
  <body>
    <div id="root">${appHtml}</div>
    <script src="/bundle.js"></script>
  </body>
</html>
`
        res.send(html)
        console.log('响应已发送')
    } catch (error) {
        console.error('渲染错误:', error)
        res.status(500).send('服务器错误')
    }
})

app.listen(8787, '127.0.0.1', () => {
    console.log('✅ SSR 服务器成功启动!')
    console.log('📡 访问地址: http://127.0.0.1:8787')
})
```

### 注意事项

- **服务端环境**：SSR 运行在 Node.js 环境中，不支持浏览器特定 API
- **路由处理**：使用 `StaticRouter` 处理服务端路由
- **状态管理**：需要确保服务端和客户端状态同步
- **构建流程**：需要为客户端和服务端分别构建
- **性能考虑**：SSR 会增加服务器负载，需要合理使用缓存

通过以上配置和最佳实践，您可以成功实现 React 服务端渲染，提升首屏加载速度和 SEO 表现。
