# 权限预览面板 — 从零到一的完整拆解

> 读完之后，你会理解: 为什么要用 Set 管理权限、为什么要分离 origin/temp、如何做增量 diff、互斥规则怎么设计、
> 以及每一行代码背后的设计考量。目标是让你看完之后自己能从头写一个。

---

## 0. 这个面板解决什么问题

假设你有一个后台管理系统，管理员可以给角色分配权限。在"编辑角色权限"页面上，用户改了一堆勾选，但——

1. **他改了什么？** 他自己可能都忘了最初哪些是勾上的
2. **如果直接全量提交，两个管理员同时改了不同权限会互相覆盖**
3. **某些权限互相冲突（比如"完全访问"和"只读"），怎么防住？**

这个方案就是回答这三个问题的：

| 问题 | 解法 |
|------|------|
| 不知道改了什么 | 保留 origin 快照，实时 diff 预览 |
| 并发覆盖 | 只发增量 `{ added, removed }`，不擦除别人的修改 |
| 权限互斥 | 互斥规则配置化，选中时自动检查并解除冲突 |

---

## 1. 数据模型: 为什么是 Set< string >，不是 Array

### 1.1 直觉上的选择可能是 ...

```typescript
// ❌ 很多人一开始会这样写
const [checkedIds, setCheckedIds] = useState<string[]>([])
```

问题在哪:

- **去重靠自觉**——同一 ID push 两次你自己不会察觉
- **查找是 O(n)**——`checkedIds.includes('view_user')` 每次都要遍历整个数组。1000 个权限的情况下每点一个 checkbox 要扫 1000 次
- **diff 运算麻烦**——`A - B` 必须用 `filter + includes`，这是 O(n*m)

### 1.2 Set 好在哪

```typescript
// ✅ 实际使用
const [originCheckedIds] = useState<Set<string>>(() => new Set(initialChecked))
const [tempCheckedIds, setTempCheckedIds] = useState<Set<string>>(() => new Set(initialChecked))
```

| 操作 | Array | Set |
|------|-------|-----|
| 判断 X 是否选中 | `arr.includes(x)` O(n) | `set.has(x)` O(1) |
| 选中/取消 X | `[...arr, x]` / `arr.filter()` | `new Set(prev).add(x)` / `.delete(x)` |
| A - B (差集) | `A.filter(x => !B.includes(x))` O(n*m) | 遍历 A，`B.has(x)` 判断 O(n) |
| 自动去重 | ❌ 需要手动检查 | ✅ 天然去重 |

还有一个更深层的原因: **"选中的权限 ID 集合"在数学上就是一个集合，不是列表**。列表暗示顺序有意义（"第一个选的是 A，第二个选的是 B"），但实际上权限之间没有先后关系。用正确的数据结构建模，代码会自己变得清晰。

### 1.3 React 中 Set 的不可变更新

```typescript
// ✅ 正确: 创建新 Set，触发 re-render
setTempCheckedIds((prev) => {
  const next = new Set(prev)  // 浅拷贝
  next.add(id)                // 在新对象上修改
  return next                 // 返回新引用 → React 检测到变化
})

// ❌ 错误: 直接修改原 Set
tempCheckedIds.add(id)        // React 不会重渲染，因为引用没变
setTempCheckedIds(tempCheckedIds)
```

这是 React 不可变更新的原则: state 必须整体替换，不能原地修改。

---

## 2. 核心设计: origin / temp 双 Set 模式

### 2.1 为什么需要两个 Set

```
originCheckedIds  ← 后端的快照，只有点"应用"时才更新
tempCheckedIds    ← 用户正在编辑的工作副本，每次勾选/取消都更新
```

如果没有 origin:
- 你不知道"改了什么"——diff 需要对比新旧两个值
- 你无法"重置"——重置意味着回到原始状态，但原始值已被覆盖

### 2.2 三个关键操作

```typescript
// ① Toggle: 只改 temp，不改 origin
const handleToggle = (id: string, checked: boolean) => {
  setTempCheckedIds((prev) => {
    const next = new Set(prev)
    checked ? next.add(id) : next.delete(id)
    return next
  })
}

// ② Apply: temp 覆盖 origin (提交)
const handleApply = () => {
  // 发送增量到后端...
  setOriginCheckedIds(new Set(tempCheckedIds))  // 快照更新
}

// ③ Reset: origin 覆盖 temp (回滚)
const handleReset = () => {
  setTempCheckedIds(new Set(originCheckedIds))
}
```

三者关系就是一个**单向数据流循环**:

```
origin ──reset──→ temp
  ↑                 │
  └───apply─────────┘
  
用户操作只影响 temp，apply/reset 是两个方向的同步。
```

---

## 3. Diff 算法: 只发增量，不发全量

### 3.1 为什么全量提交有并发问题

```
时间线:
  后端当前权限: {A, B, C}
  
  t1: 管理员甲打开编辑页，看到 {A, B, C}
  t2: 管理员乙打开编辑页，看到 {A, B, C}
  t3: 甲加了 D，全量提交 {A, B, C, D}        ← 后端变成 {A, B, C, D}
  t4: 乙加了 E，全量提交 {A, B, C, E}        ← 后端变成 {A, B, C, E}
  
结果: D 丢了！因为乙提交时不知道甲加了 D
```

如果只发增量:
```
  t3: 甲提交 { added: [D], removed: [] }     ← 后端变成 {A, B, C, D}
  t4: 乙提交 { added: [E], removed: [] }     ← 后端变成 {A, B, C, D, E}
  
结果: D 和 E 都保留了！
```

### 3.2 Diff 计算

```typescript
const diff = useMemo<DiffResult>(() => {
  const added: string[] = []
  const removed: string[] = []

  // temp 里有但 origin 没有 = 新增
  for (const id of tempCheckedIds) {
    if (!originCheckedIds.has(id)) added.push(id)
  }
  // origin 里有但 temp 没有 = 移除
  for (const id of originCheckedIds) {
    if (!tempCheckedIds.has(id)) removed.push(id)
  }

  return { added, removed }
}, [originCheckedIds, tempCheckedIds])
```

复杂度: O(n)，因为每个 Set 只遍历一次，`has()` 是 O(1)。

`useMemo` 确保只在依赖变化时重算。用户快速点 10 个 checkbox，中间的渲染不会重复算 diff——只在最终状态算一次（因为 React 会批处理）。

### 3.3 发送到后端

```typescript
// 模拟 API 调用
console.log('[API] POST /api/permissions/delta', {
  added: diff.added,     // 只发新增的 ID
  removed: diff.removed, // 只发移除的 ID
})
// 不发的: 没变过的 ID，后端不需要知道
```

---

## 4. 互斥规则: 配置化 + 自动冲突解决

### 4.1 为什么不用 if/else 硬编码

```typescript
// ❌ 硬编码: 业务逻辑散落在组件里
if (id === 'full_access' && checkedIds.has('read_only')) {
  message.error('不能同时选完全访问和只读')
  return  // 阻止操作
}
```

问题:
- 新增一条互斥规则要改 UI 组件代码
- 互斥规则不能从后端下发
- 规则多了之后组件里一堆 if/else，难以维护

### 4.2 规则配置化

```typescript
// ✅ 规则是数据，组件只是规则的执行引擎
export const mutexRules: MutexRule[] = [
  {
    ids: ['full_access', 'read_only'],
    message: '"完全访问" 与 "只读访问" 互斥，已自动取消冲突项',
  },
  {
    ids: ['delete_user', 'edit_user'],
    message: '"删除用户" 与 "编辑用户" 互斥，已自动取消冲突项',
  },
  {
    ids: ['publish_article', 'delete_article'],
    message: '"发布文章" 与 "删除文章" 互斥，已自动取消冲突项',
  },
]
```

这样:
- 后端可以通过 API 返回互斥规则，前端无需改代码
- 添加/修改规则只需要改数据，不碰逻辑
- 组件本身是纯函数: `(nodes, checkedIds, mutexRules) → UI`

### 4.3 冲突检测算法

```typescript
function resolveMutex(
  toggledId: string,          // 用户正在切换的权限 ID
  rules: MutexRule[],          // 所有互斥规则
  checkedIds: Set<string>,     // 当前已选中的 ID
  idToLabel: Map<string, string>, // ID → 中文名映射
): MutexResolution {
  for (const rule of rules) {
    // 检查这个 ID 是否在某条规则的互斥组里
    const idx = rule.ids.indexOf(toggledId)
    if (idx === -1) continue  // 不在这个规则里，跳过

    // 在规则组中查找其他已选中的 ID
    const conflicts = rule.ids.filter(
      (id, i) => i !== idx && checkedIds.has(id)
    )

    if (conflicts.length > 0) {
      return {
        conflicts,
        message: rule.message,
      }
    }
  }
  return { conflicts: [], message: '' }
}
```

算法步骤:
1. 拿到用户要选的 ID（比如 `full_access`）
2. 遍历所有互斥规则，找到包含这个 ID 的规则组
3. 检查规则组中是否有其他 ID 已被选中
4. 如果 `read_only` 已被选中 → 冲突！返回冲突 ID 和提示信息

### 4.4 为什么选择「自动取消 + 提示」而不是「阻止操作」

```
方案 A (阻止): "不能同时选择" → 用户必须自己找到冲突项并手动取消
方案 B (自动):  自动取消 read_only，选中 full_access，弹出提示说明
```

方案 B 需要的用户操作更少（1 次点击 vs N 次），而且用户立刻知道发生了什么。

```typescript
const handleToggle = () => {
  if (!isChecked) {
    // 选中前检查互斥
    const resolved = resolveMutex(node.id, mutexRules, checkedIds, idToLabel)
    if (resolved.conflicts.length > 0) {
      // 先移除冲突项
      for (const conflictId of resolved.conflicts) {
        onToggle(conflictId, false)
      }
      // 通知用户
      showMutexWarning(resolved.message)
    }
  }
  onToggle(node.id, !isChecked)  // 选中目标
}
```

讨论: 如果业务需要，这里可以很容易地改成方案 A——只需要把 `onToggle(conflictId, false)` 改成 `return`（不执行后续的 `onToggle`），并弹一个确认框。

---

## 5. 组件架构: 为什么要拆成三个

```
PermissionDemo/
├── index.tsx          ← 状态持有者 (state owner)
├── PermissionTree.tsx ← 纯展示组件 (dump component)
├── DiffPanel.tsx      ← 纯展示组件 (dump component)
├── types.ts           ← 类型定义
└── mockData.ts        ← 测试数据
```

### 5.1 为什么 index.tsx 持有所有状态

这是 React 的「状态提升」原则:

```
index.tsx (state owner)
  ├── originCheckedIds, tempCheckedIds
  ├── diff (useMemo 派生)
  ├── handleToggle → 传给 PermissionTree
  ├── handleApply  → 传给 DiffPanel
  └── handleReset  → 传给 DiffPanel
```

- PermissionTree 不需要知道 origin——它只管展示树 + 回调 onToggle
- DiffPanel 不需要知道 temp——它只管展示 diff + 回调 onApply/onReset
- index.tsx 是唯一的真相来源 (single source of truth)

### 5.2 PermissionTree 为什么是递归的

权限通常是树形结构（菜单 → 子菜单 → 按钮），递归组件天然匹配:

```typescript
function TreeNode({ node, depth, ... }) {
  return (
    <div>
      <div onClick={handleToggle}>  {/* 当前节点 */}
        <Checkbox /> {node.label}
      </div>
      {node.children && node.children.map(child =>
        <TreeNode node={child} depth={depth + 1} />  {/* 递归渲染子节点 */}
      )}
    </div>
  )
}
```

`depth` 控制缩进: `paddingLeft = 16 + depth * 24`，每层缩进 24px。

### 5.3 DiffPanel 为什么做成 sticky

```css
position: sticky;
top: 20px;
```

用户滚动左侧长列表时，右侧 diff 面板始终可见——因为他需要随时看到「改了什么」。

### 5.4 类型文件为什么独立

`types.ts` 是契约层，不依赖任何组件。如果以后要写单元测试、或者把类型暴露给外部模块，不需要引入组件本身。

---

## 6. 完整数据流走一遍

假设用户打开页面，初始状态:

```
originCheckedIds: {view_user, create_user, read_only}
tempCheckedIds:   {view_user, create_user, read_only}
diff:             {added: [], removed: []}   ← 还没改，diff 为空
```

用户勾选 `full_access`:

```
① handleToggle('full_access', true) 被调用
② resolveMutex 检测到 'full_access' 和 'read_only' 互斥
③ 发现 'read_only' 已在 tempCheckedIds 中 → 冲突
④ 调用 onToggle('read_only', false) 移除冲突项
⑤ 弹出 Toast: "完全访问 与 只读访问 互斥，已自动取消冲突项"
⑥ 调用 onToggle('full_access', true) 选中目标

tempCheckedIds: {view_user, create_user, full_access}   ← read_only 被自动移除
diff: {
  added:   ['full_access'],   ← temp 有 origin 没有
  removed: ['read_only'],     ← origin 有 temp 没有
}
```

右侧 DiffPanel 实时显示:
```
+ 新增 (1):
  · 完全访问

- 移除 (1):
  · 只读访问

应用时将只发送增量数据:
{"added":["full_access"],"removed":["read_only"]}
```

用户点击「应用」:

```
⑦ handleApply()
⑧ 发送 POST { added: ['full_access'], removed: ['read_only'] }
⑨ originCheckedIds = new Set(tempCheckedIds)
⑩ diff 重新计算: {added: [], removed: []}   ← 已同步，diff 清零
```

用户点击「重置」:

```
⑦ handleReset()
⑧ tempCheckedIds = new Set(originCheckedIds)
⑨ diff 重新计算: {added: [], removed: []}   ← 回到原点
```

---

## 7. idToLabel 映射表: 为什么需要一个反查表

```typescript
const idToLabel = useMemo(() => {
  const map = new Map<string, string>()
  const walk = (nodes) => {
    for (const n of nodes) {
      if (n.children) walk(n.children)
      else map.set(n.id, n.label)
    }
  }
  walk(permissionTree)
  return map
}, [])
```

权限树以 ID（如 `full_access`）作为 key，但 UI 需要显示中文（"完全访问"）。DiffPanel 只拿到 ID 数组，它自己没有树结构，所以需要一个 `id → label` 的快速查找表。

如果没有这个映射:
- DiffPanel 需要遍历整棵树来找 label → 耦合树结构
- 互斥提示需要显示中文 → 只能显示 ID，对用户不友好

这是一个**显示层关注点分离**: `id` 是数据层的 key，`label` 是展示层的文本，映射表连接两者。

---

## 8. 互斥 Toast 的实现: 为什么不用组件库的 message

```typescript
function showMutexWarning(msg: string) {
  const el = document.createElement('div')
  // ... 手动创建 DOM，手动动画，手动销毁
}
```

这个项目的 Toast (components/message) 需要 `createRoot` 创建 React 渲染树。但 PermissionTree 是一个纯展示组件，引入 React 的 message 系统会增加依赖。

对于 Demo 来说，原生 DOM 操作更轻量，也展示了「不完全依赖框架也可以做 UI」的思路。生产环境可以替换为 Arco Design 的 `Message.info()`。

---

## 9. 如果要在生产环境部署，需要改什么

| 改动 | 当前 | 生产 |
|------|------|------|
| 权限数据 | `mockData.ts` 硬编码 | API 请求 + loading/error 状态 |
| 互斥规则 | `mockData.ts` 硬编码 | API 请求，或从权限配置下发 |
| 应用按钮 | `setTimeout` 模拟 | 真实 `axios.post('/api/permissions/delta', diff)` |
| Toast 提示 | 原生 DOM | Arco Design `Message.info()` |
| 错误处理 | 无 | API 失败 → 回滚 tempCheckedIds，错误提示 |
| 权限粒度 | 只有叶节点可选中 | 可能需要半选状态（父节点部分子节点选中） |

---

## 10. 核心要点总结

1. **Set 不是偏好，是正确性** —— 权限 ID 集合的数学本质就是集合，用 Set 省去了去重和 O(1) 查找
2. **双 Set 模式是"预览"的基础** —— 没有 origin，就没有 diff，也没有重置
3. **增量提交解决并发** —— 自己只声明自己改了什么，不替别人做决定
4. **互斥规则是数据，不是代码** —— 数据可以从后端来，代码不用动
5. **自动冲突解决 > 阻止操作** —— 少一步用户操作，多一条明确提示，体验更好
6. **状态提升到父组件** —— 子组件只管展示，单一数据源避免状态不同步
7. **diff 实时计算** —— 用户永远知道改了什么，不需要记忆原始状态

---

## 11. 单元测试怎么测：把纯逻辑从 UI 中剥离

### 11.1 为什么要把函数提取到 utils.ts

React 组件测试需要 `@testing-library/react` + jsdom，启动慢、写起来重。
但好消息是——这个面板最复杂的逻辑（互斥解析、diff 计算）都是**纯函数**：

```typescript
// 纯函数 = 给定相同的输入，永远返回相同的输出，不产生副作用
function resolveMutex(toggledId, rules, checkedIds, idToLabel) → MutexResolution
function computeDiff(origin, temp) → DiffResult
function toggleSet(set, id, checked) → new Set
```

纯函数测试不需要渲染组件，不需要模拟 DOM，速度极快（29 个测试用例总共 8ms）。

所以我刻意把这三个函数从组件文件中提出来，放到 `utils.ts`，单独导出：

```
PermissionDemo/
├── utils.ts              ← 纯函数，可脱离 React 测试
├── __tests__/
│   └── utils.test.ts     ← 只测 utils.ts，不依赖任何组件
├── PermissionTree.tsx    ← 从 utils.ts 导入，自身只负责渲染
└── index.tsx             ← 从 utils.ts 导入，自身只负责状态管理
```

### 11.2 测试金字塔：四层覆盖

```
        ┌──────────────┐
        │  E2E (少)     │  ← 浏览器中手动点一遍完整流程
        ├──────────────┤
        │  组件测试      │  ← @testing-library 测交互（本项目未安装）
        ├──────────────┤
        │  纯函数单测    │  ← 29 个用例，覆盖所有核心逻辑 ← 我们测的
        └──────────────┘
```

纯函数单测是最划算的投资：极少量的代码 + 极快的执行速度 + 极高的覆盖价值。

### 11.3 resolveMutex 的测试策略

互斥解析是整个面板最复杂的逻辑，测试必须覆盖:

| 场景 | 测试用例 | 为什么测 |
|------|---------|---------|
| 无冲突 — 权限不在规则中 | `view_user` + `{read_only}` 已选 | 确保非互斥权限通过 |
| 无冲突 — 规则组中无其他人选中 | `full_access` + `{edit_user}` 已选 | 确保规则内无冲突时通过 |
| 无冲突 — 空集 | 没有任何权限被选中 | 边界条件 |
| 有冲突 — 双向验证 | A 选 B 已选 → 检测到 B / B 选 A 已选 → 检测到 A | 确保对称性 |
| 有冲突 — 多规则组之间隔离 | 不同规则组的权限不互相误判 | 确保规则之间不泄漏 |
| 空规则列表 | `rules=[]` 时不会崩溃 | 边界条件 |
| idToLabel 缺失 | Map 中没有对应映射时 | 降级处理 |

```typescript
// 典型测试用例
it('有冲突: 选中 full_access 时 read_only 已被选中', () => {
  const checked = new Set(['read_only'])
  const result = resolveMutex('full_access', rules, checked, idToLabel)
  expect(result.conflicts).toEqual(['read_only'])  // 精确知道冲突谁
  expect(result.message).toContain('完全访问')       // 提示文案已生成
})
```

### 11.4 computeDiff 的测试策略

diff 计算看起来简单，但边界条件多：

```typescript
// 7 种状态组合，每种都是不同的业务语义
it('纯新增')     // origin={a,b}, temp={a,b,c,d} → added=[c,d], removed=[]
it('纯移除')     // origin={a,b,c,d}, temp={a,b} → added=[], removed=[c,d]
it('混合变更')   // origin={a,b,c}, temp={b,c,d,e} → added=[d,e], removed=[a]
it('完全替换')   // origin={a,b}, temp={c,d} → added=[c,d], removed=[a,b]
it('无变更')     // origin = temp → 都空
it('从零到有')   // origin={}, temp={x,y} → added=[x,y], removed=[]
it('从有到零')   // origin={x,y}, temp={} → added=[], removed=[x,y]
it('大量数据')   // 1000个权限，验证性能和数据正确性
```

### 11.5 toggleSet 的不可变性测试

```typescript
it('不修改原 Set（不可变性）', () => {
  const before = new Set(['a'])
  toggleSet(before, 'b', true)
  expect(before.has('b')).toBe(false)  // 原 Set 没变！
  expect(before.size).toBe(1)
})
```

这个测试很关键——如果 `toggleSet` 不小心修改了原 Set，React 的状态检测（引用比较）会失效，导致组件不更新。这是一个**防御性测试**：防止未来的维护者不小心破坏不可变性约定。

### 11.6 为什么不测组件本身

组件测试需要渲染 PermissionTree / DiffPanel，验证 checkbox 点击后的 DOM 变化。这需要:
1. 安装 `@testing-library/react` + `jsdom`（项目目前没有）
2. Mock 互斥规则的 Toast 弹窗（`showMutexWarning` 操作真实 DOM）
3. 测试执行时间从 8ms 变成 500ms+

对于这个 Demo 来说，纯函数单测已经覆盖了所有"可能出错"的逻辑。组件层的测试价值有限——它们只是把数据映射到 DOM，逻辑在 utils 里。

---

## 12. 树状结构和权限点的关系

这是你问的最关键的问题。答案一句话：**树状结构是前端展示层的组织方式，后端只认扁平的权限 ID 集合。树的分组节点（分类）不是权限点，也不参与提交。**

### 12.1 权限的三个层次

```
📁 系统管理  ← 这是『分类』(Category)，不是权限点，不可勾选
  ├─ ☑ 查看用户  ← 这是『权限点』(Permission Point)，id=view_user
  ├─ ☐ 创建用户  ← id=create_user
  └─ ☑ 编辑用户  ← id=edit_user
```

- **分类节点**（`sys_mgmt`、`content_mgmt` 等）：`idToLabel` 映射表中不包含它们（`buildLabelMap` 只收集叶子节点）。它们只负责视觉分组和展开/折叠交互。点击它们只会折叠/展开，不会触发 `onToggle`。
- **权限点**（`view_user` 等）：每个有唯一的 `id`，这是后端唯一关心的值。`tempCheckedIds` 和 `originCheckedIds` 里存的都是这些 `id`。

### 12.2 前后端数据流的完整过程

```
┌─ 后端 API ────────────────────────────────────────────────┐
│                                                            │
│  返回格式（推荐）:                                          │
│  {                                                         │
│    "permissions": [                                        │
│      { "id": "view_user",    "label": "查看用户",          │
│        "category": "sys_mgmt" },                           │
│      { "id": "create_user",  "label": "创建用户",          │
│        "category": "sys_mgmt" },                           │
│      { "id": "view_article", "label": "查看文章",          │
│        "category": "content_mgmt" },                       │
│      ...                                                   │
│    ],                                                      │
│    "categories": [                                         │
│      { "id": "sys_mgmt",     "label": "系统管理" },        │
│      { "id": "content_mgmt", "label": "内容管理" },        │
│      ...                                                   │
│    ],                                                      │
│    "mutexRules": [                                         │
│      { "ids": ["full_access", "read_only"],                │
│        "message": "..." }                                  │
│    ],                                                      │
│    "rolePermissions": ["view_user", "edit_user", ...]      │
│  }                                                         │
│                                                            │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─ 前端转换 ─────────────────────────────────────────────────┐
│                                                            │
│  ① 接收扁平列表 { permissions, categories, ... }           │
│                                                            │
│  ② 构建树: 将每个 permission 按 category 字段归组          │
│     function buildTree(permissions, categories) → TreeNode[]│
│                                                            │
│  ③ 构建 labelMap: { id → label } 用于展示和冲突提示        │
│                                                            │
│  ④ originCheckedIds = new Set(rolePermissions)              │
│                                                            │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─ 用户操作 ─────────────────────────────────────────────────┐
│                                                            │
│  用户在树中勾选/取消 → 只影响 tempCheckedIds (Set<string>) │
│  树只是展示载体，权限数据存的是扁平的 ID Set               │
│                                                            │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─ 提交 ─────────────────────────────────────────────────────┐
│                                                            │
│  POST /api/permissions/delta                               │
│  {                                                         │
│    "roleId": "role_123",                                   │
│    "added": ["full_access"],                               │
│    "removed": ["read_only"]                                │
│  }                                                         │
│  → 树结构不参与提交，只提交权限 ID                          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 12.3 当前 Demo 的简化

当前 `mockData.ts` 里树结构是**硬编码**的——这是 Demo 的简化处理：

```typescript
export const permissionTree: PermissionNode[] = [
  {
    id: 'sys_mgmt',
    label: '系统管理',
    children: [
      { id: 'view_user', label: '查看用户' },
      ...
    ],
  },
  ...
]
```

生产环境中，树的构建应该由前端**动态生成**：

```typescript
function buildTree(
  permissions: { id: string; label: string; category: string }[],
  categories: { id: string; label: string }[],
): PermissionNode[] {
  const categoryMap = new Map(categories.map((c) => [c.id, c]))
  const grouped = new Map<string, PermissionNode[]>()
  for (const perm of permissions) {
    const list = grouped.get(perm.category) || []
    list.push({ id: perm.id, label: perm.label })
    grouped.set(perm.category, list)
  }
  return Array.from(grouped.entries()).map(([catId, children]) => ({
    id: catId,
    label: categoryMap.get(catId)?.label || catId,
    children,
  }))
}
```

这样树结构就完全由后端下发的 `category` 字段驱动，前端不需要硬编码任何层级关系。

### 12.4 为什么选择这种分离

| 如果后端也存树结构 | 如果前端只展示后端 flat 数据 |
|---|---|
| 后端要维护层级关系 | 后端只管权限点 CRUD |
| 权限点移动分类要改后端 | 改 `category` 字段就行 |
| API 返回嵌套 JSON | API 返回扁平数组，体积更小 |
| 前端渲染方便（直接递归） | 前端要做一次 groupBy（少量代码） |

结论：**把组织结构交给前端，把权限点的权威数据交给后端**。前后端各司其职，耦合度最低。

### 12.5 一个容易犯的错：把分类节点当权限点

```typescript
// ❌ 错误: 在 checkedIds 里混入了分类节点
const wrong = new Set(['sys_mgmt', 'view_user'])  // sys_mgmt 不是权限！

// ✅ 正确: checkedIds 只包含叶子节点
const correct = new Set(['view_user', 'create_user'])
```

这就是为什么 `buildLabelMap` 只收集叶子节点——分类节点根本不应该出现在任何权限集合中。`PermissionTree` 里的 `handleToggle` 也明确跳过了文件夹节点：

```typescript
if (isFolder) {
  setExpanded(!expanded)  // 文件夹只展开/折叠
  return                  // 不触发 onToggle，不参与选中
}
```
