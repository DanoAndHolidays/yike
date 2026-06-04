# Node后端

这里包含两个服务

## LinkThink

现在加入了LinkThink的逻辑，所有的agent代码的实现均会在这里

hello-agents/
├── hello_agents/
│ │
│ ├── core/ # 核心框架层
│ │ ├── agent.py # Agent基类
│ │ ├── llm.py # HelloAgentsLLM统一接口
│ │ ├── message.py # 消息系统
│ │ ├── config.py # 配置管理
│ │ └── exceptions.py # 异常体系
│ │
│ ├── agents/ # Agent实现层
│ │ ├── simple_agent.py # SimpleAgent实现
│ │ ├── react_agent.py # ReActAgent实现
│ │ ├── reflection_agent.py # ReflectionAgent实现
│ │ └── plan_solve_agent.py # PlanAndSolveAgent实现
│ │
│ ├── tools/ # 工具系统层
│ │ ├── base.py # 工具基类
│ │ ├── registry.py # 工具注册机制
│ │ ├── chain.py # 工具链管理系统
│ │ ├── async_executor.py # 异步工具执行器
│ │ └── builtin/ # 内置工具集
│ │ ├── calculator.py # 计算工具
│ │ └── search.py # 搜索工具
└──

### 开发日志

5/19/26
完成LLM客户端的开发、基本的类型定义

5/24/26
完成Agent基类的开发

5/25/26
完成典型Agent范式React的构建

5/26/26
完成典型Agent范式Plan Reflection的构建

- Reflection可以优化一下，我想用这几类基本的范式来组合成更加复杂的混合范式，以解决更加复杂的问题

5/28/26
实现了工具基类

5/30/26
准备实现上下文这里需要两个数据结构：

## 项目现有模式分析

**模式 A：`interface`（纯数据结构）** — [types.ts](file:///g:/Save/Grogramming/Vue3/yike/server/src/core/types.ts)

```typescript
// 仅仅定义形状，没有运行时行为
export interface LLMConfig {
  provider: LLMProvider
  apiKey: string
  model: string
  timeout?: number
}
```

**模式 B：`class`（有行为的数据结构）** — [agent.ts](file:///g:/Save/Grogramming/Vue3/yike/server/src/core/agent.ts) / [base.ts](file:///g:/Save/Grogramming/Vue3/yike/server/src/tools/base.ts)

```typescript
// 有构造器，有方法
export class Agent {
    llm: LLMClient
    _history: LLMMessage[] = []
    addMessage(message: LLMMessage) { ... }
}
```

---

## 建议：使用 `class` 实现

我的推荐是 **`class`**。理由很简单：

你的 `ContextPacket.__post_init__` 做了**裁剪相关性分数到 `[0, 1]`** 的操作，`ContextConfig.__post_init__` 做了**三个参数的断言校验**。这些都是**运行时行为**，而 TypeScript 的 `interface` / `type` 在编译后就完全消失了，完全无法承载这些逻辑。

对照你的 Python dataclass：

```python
# Python dataclass 本质上就是"带行为的 class"
@dataclass
class ContextPacket:
    content: str
    relevance_score: float = 0.5

    def __post_init__(self):
        self.relevance_score = max(0.0, min(1.0, self.relevance_score))
```

在 TypeScript 中最自然的映射就是：

```typescript
// TypeScript class —— 语义完全对应
class ContextPacket {
  content: string
  relevanceScore: number

  constructor(content: string, relevanceScore: number = 0.5) {
    this.content = content
    this.relevanceScore = Math.max(0, Math.min(1, relevanceScore))
  }
}
```

构造函数本身就充当了 `__post_init__` 的角色，不需要额外的生命周期钩子。

---

## 如果选 `interface` 会怎样？

不是不能用，但需要**额外的工厂函数或辅助层**来做校验，这反而增加了复杂度：

```typescript
// ❌ interface 没有运行时验证能力
interface ContextPacket {
  content: string
  relevanceScore: number
}

// 需要额外写工厂函数来替代 __post_init__
function createContextPacket(content: string, relevanceScore: number = 0.5): ContextPacket {
  return {
    content,
    relevanceScore: Math.max(0, Math.min(1, relevanceScore)),
  }
}
```

这对于 `ContextPacket` 还算勉强可以，但对 `ContextConfig` 的 3 个 assert 断言就很不自然了——assert 本身就是运行时检查，放在 `interface` 外面反而显得割裂。

---

## 总结

| 考量点                    | `class`                      | `interface` / `type` |
| ------------------------- | ---------------------------- | -------------------- |
| 运行时验证                | ✅ 构造函数直接承载          | ❌ 需要额外工厂函数  |
| 默认值                    | ✅ 构造参数默认值            | ❌ 无此能力          |
| 语义匹配 Python dataclass | ✅ 对应                      | ❌ 需要额外封装      |
| 与项目模式一致性          | ✅ agent.ts/registry.ts 已有 | ✅ types.ts 也有     |

核心判断标准就一条：**只要 `__post_init__` 里有行为（哪怕只是 `assert`），就应该用 `class`**。这和 Python dataclass 的设计哲学是一致的——Python 选本质上也 `dataclass` 就是生成 `class` 的语法糖。

5/31/26
基本实现了ContextBuilder，明天接入Agent中

6/2/26
ContextBuilder接入Agent中

6/3
初步构建记忆系统，啥也没干。。。
hello-agents/
├── hello_agents/
│   ├── memory/                   # 记忆系统模块
│   │   ├── base.py               # 基础数据结构（MemoryItem, MemoryConfig, BaseMemory）
│   │   ├── manager.py            # 记忆管理器（统一协调调度）
│   │   ├── embedding.py          # 统一嵌入服务（DashScope/Local/TFIDF）
│   │   ├── types/                # 记忆类型实现
│   │   │   ├── working.py        # 工作记忆（TTL管理，纯内存）
│   │   │   ├── episodic.py       # 情景记忆（事件序列，SQLite+Qdrant）
│   │   │   ├── semantic.py       # 语义记忆（知识图谱，Qdrant+Neo4j）
│   │   │   └── perceptual.py     # 感知记忆（多模态，SQLite+Qdrant）
│   │   ├── storage/              # 存储后端实现
│   │   │   ├── qdrant_store.py   # Qdrant向量存储（高性能向量检索）
│   │   │   ├── neo4j_store.py    # Neo4j图存储（知识图谱管理）
│   │   │   └── document_store.py # SQLite文档存储（结构化持久化）
│   │   └── rag/                  # RAG系统
│   │       ├── pipeline.py       # RAG管道（端到端处理）
│   │       └── document.py       # 文档处理器（多格式解析）
│   └── tools/builtin/            # 扩展内置工具
│       ├── memory_tool.py        # 记忆工具（Agent记忆能力）
│       └── rag_tool.py           # RAG工具（智能问答能力）
└──

6/4
设计MemoryTool的基本操作

这个记忆系统对我来讲有点重了，我想要进行一个裁剪，学习其中的构建方法
- 看看源码，明天



## 一刻短剧

yike的mock后端，没有系统学过node.js，写的代码也是能跑就行

因为我是先创建的前端项目，前期从未想过要加入后端，要移动前端项目进入位置可能会有新问题。单人开发小项目，最小改动也是一个不错的选择。

推荐的结构：

```txt
G:\Save\Grogramming\Vue3\yike\
├── frontend/           # 将现有前端项目移到这里
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...（现有所有前端文件）
├── backend/           # 新建后端目录
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── app.js
│   ├── package.json
│   └── ...（后端文件）
├── shared/            # 共享代码（可选）
└── README.md
```

### 视频处理

秒传、合并切片与接受上传的切片。

### 用户登录

登录、登出。
