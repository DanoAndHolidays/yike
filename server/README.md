# Node后端
这里包含两个服务

## LinkThink
现在加入了LinkThink的逻辑，所有的agent代码的实现均会在这里

hello-agents/
├── hello_agents/
│   │
│   ├── core/                     # 核心框架层
│   │   ├── agent.py              # Agent基类
│   │   ├── llm.py                # HelloAgentsLLM统一接口
│   │   ├── message.py            # 消息系统
│   │   ├── config.py             # 配置管理
│   │   └── exceptions.py         # 异常体系
│   │
│   ├── agents/                   # Agent实现层
│   │   ├── simple_agent.py       # SimpleAgent实现
│   │   ├── react_agent.py        # ReActAgent实现
│   │   ├── reflection_agent.py   # ReflectionAgent实现
│   │   └── plan_solve_agent.py   # PlanAndSolveAgent实现
│   │
│   ├── tools/                    # 工具系统层
│   │   ├── base.py               # 工具基类
│   │   ├── registry.py           # 工具注册机制
│   │   ├── chain.py              # 工具链管理系统
│   │   ├── async_executor.py     # 异步工具执行器
│   │   └── builtin/              # 内置工具集
│   │       ├── calculator.py     # 计算工具
│   │       └── search.py         # 搜索工具
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

5/26/28



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
