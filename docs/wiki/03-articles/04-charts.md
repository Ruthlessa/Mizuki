# 图表

## Mermaid 图表

### 简介

Mermaid 是一个基于 JavaScript 的图表绘制工具，使用简单的文本语法来创建各种图表。

### 安装与配置

主题已内置 Mermaid 支持，无需额外配置。

## 流程图

### 基本语法

```markdown
```mermaid
flowchart 方向
  节点 --> 节点
```
```

### 方向说明

| 方向 | 说明 |
|------|------|
| TD | 从上到下（默认） |
| TB | 从上到下 |
| BT | 从下到上 |
| LR | 从左到右 |
| RL | 从右到左 |

### 节点类型

```markdown
```mermaid
flowchart TD
  A[圆角矩形] --> B(椭圆形)
  B --> C{菱形判断}
  C -->|是| D>平行四边形]
  C -->|否| E[/六边形/]
```
```

### 连接线

```markdown
```mermaid
flowchart TD
  A --> B
  A --- B
  A -->|标签| B
  A -.-> B
  A ==> B
```
```

### 示例

```markdown
```mermaid
flowchart LR
  Start --> Input
  Input --> Process
  Process --> Decision
  Decision -->|Yes| Output
  Decision -->|No| Process
  Output --> End
```
```

## 序列图

### 基本语法

```markdown
```mermaid
sequenceDiagram
  participant 角色1
  participant 角色2
  角色1->>角色2: 消息
```
```

### 消息类型

```markdown
```mermaid
sequenceDiagram
  participant A
  participant B
  A->>B: 同步消息
  A-->>B: 异步消息
  A->>B: 带箭头的消息
  Note over A,B: 注释
```
```

### 示例

```markdown
```mermaid
sequenceDiagram
  participant 用户
  participant 前端
  participant 后端
  participant 数据库
  
  用户->>前端: 登录请求
  前端->>后端: POST /api/login
  后端->>数据库: 查询用户
  数据库-->>后端: 返回用户数据
  后端->>后端: 验证密码
  alt 验证成功
    后端-->>前端: 返回 Token
    前端-->>用户: 登录成功
  else 验证失败
    后端-->>前端: 返回错误
    前端-->>用户: 登录失败
  end
```
```

## 类图

### 基本语法

```markdown
```mermaid
classDiagram
  class 类名 {
    属性
    方法()
  }
```
```

### 访问修饰符

```markdown
```mermaid
classDiagram
  class Person {
    -name: string
    -age: int
    +sayHello(): void
    #privateMethod(): void
  }
```
```

### 关系

```markdown
```mermaid
classDiagram
  class Animal
  class Dog
  class Cat
  
  Animal <|-- Dog
  Animal <|-- Cat
```
```

### 示例

```markdown
```mermaid
classDiagram
  class User {
    -id: int
    -name: string
    -email: string
    +getUser(): User
    +updateUser(): void
  }
  
  class Post {
    -id: int
    -title: string
    -content: string
    +getPost(): Post
    +createPost(): void
  }
  
  User "1" --> "*" Post
```
```

## 状态图

### 基本语法

```markdown
```mermaid
stateDiagram-v2
  [*] --> 状态1
  状态1 --> 状态2
  状态2 --> [*]
```
```

### 示例

```markdown
```mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> Running: start()
  Running --> Paused: pause()
  Paused --> Running: resume()
  Running --> Stopped: stop()
  Paused --> Stopped: stop()
  Stopped --> Idle: reset()
```
```

## 甘特图

### 基本语法

```markdown
```mermaid
gantt
  title 标题
  dateFormat 格式
  section 章节
  任务 :状态, 任务ID, 开始日期, 持续时间
```
```

### 日期格式

| 格式 | 说明 |
|------|------|
| YYYY-MM-DD | 年-月-日 |
| MM-DD | 月-日 |
| HH:mm | 时:分 |

### 任务状态

| 状态 | 说明 |
|------|------|
| done | 已完成 |
| active | 进行中 |
| future | 未开始 |

### 示例

```markdown
```mermaid
gantt
  title 项目开发计划
  dateFormat  YYYY-MM-DD
  section 设计阶段
  需求分析     :done, des1, 2024-01-01, 7d
  原型设计     :done, des2, after des1, 5d
  UI设计       :done, des3, after des2, 7d
  
  section 开发阶段
  前端开发     :active, dev1, 2024-01-13, 14d
  后端开发     :dev2, after dev1, 14d
  接口联调     :dev3, after dev2, 7d
  
  section 测试阶段
  单元测试     :test1, after dev3, 7d
  集成测试     :test2, after test1, 7d
  回归测试     :test3, after test2, 5d
```
```

## 饼图

### 基本语法

```markdown
```mermaid
pie
  title 标题
  "标签1": 数值1
  "标签2": 数值2
```
```

### 示例

```markdown
```mermaid
pie
  title 技术栈分布
  "JavaScript": 40
  "TypeScript": 30
  "Python": 20
  "Go": 10
```
```

## 实体关系图

### 基本语法

```markdown
```mermaid
erDiagram
  实体1 ||--o{ 实体2 : 关系
```
```

### 关系类型

| 符号 | 说明 |
|------|------|
| ||--|| | 一对一 |
| ||--o| | 一对多 |
| }o--|| | 多对一 |
| }o--o{ | 多对多 |

### 示例

```markdown
```mermaid
erDiagram
  USER ||--o{ POST : 发布
  USER ||--o{ COMMENT : 评论
  POST ||--o{ COMMENT : 包含
  POST }o--|| CATEGORY : 属于
```
```

## 思维导图

### 基本语法

```markdown
```mermaid
mindmap
  root((根节点))
    分支1
      子分支1
      子分支2
    分支2
      子分支3
```
```

### 示例

```markdown
```mermaid
mindmap
  root((前端技术))
    HTML
      语义化标签
      表单
      多媒体
    CSS
      Flexbox
      Grid
      动画
    JavaScript
      ES6+
      异步编程
      模块化
    框架
      React
      Vue
      Svelte
```
```

## 用户旅程图

### 基本语法

```markdown
```mermaid
journey
  title 用户旅程
  section 阶段1
    步骤1: 描述
  section 阶段2
    步骤2: 描述
```
```

### 示例

```markdown
```mermaid
journey
  title 用户登录流程
  section 进入页面
    打开网站: 5: 非常容易
    找到登录按钮: 4: 容易
  section 登录
    输入用户名: 4: 容易
    输入密码: 4: 容易
    点击登录: 5: 非常容易
  section 完成
    登录成功: 5: 非常容易
    进入首页: 5: 非常容易
```
```

## 配置选项

### 主题配置

```markdown
```mermaid
%%{ init: { 'theme': 'dark' } }%%
flowchart TD
  A --> B
```
```

### 可用主题

| 主题 | 说明 |
|------|------|
| default | 默认主题 |
| dark | 暗黑主题 |
| forest | 森林主题 |
| neutral | 中性主题 |

### 自定义样式

```markdown
```mermaid
%%{ init: { 'themeVariables': { 'primaryColor': '#ff0000' } } }%%
flowchart TD
  A --> B
```
```

## 注意事项

### 渲染性能

复杂图表可能会影响页面加载性能，建议适度使用。

### 语法验证

确保 Mermaid 语法正确，错误的语法会导致渲染失败。

### 浏览器支持

Mermaid 在现代浏览器中都能正常渲染，旧版浏览器可能需要 polyfill。

## 扩展用法

### 子图

```markdown
```mermaid
flowchart TD
  subgraph 子图1
    A --> B
  end
  subgraph 子图2
    C --> D
  end
  B --> C
```
```

### 注释

```markdown
```mermaid
flowchart TD
  %% 这是一条注释
  A --> B
```
```

### 链接

```markdown
```mermaid
flowchart TD
  A["点击跳转"]
  click A "https://example.com" "链接说明"
```
```