# Sprite House 项目架构说明

## 项目概述
Sprite House 是一个基于 WebRTC 和 Phaser.js 的多人在线游戏平台，支持实时音视频通信和游戏互动。

## 技术栈
- **前端**: React + TypeScript + Phaser.js
- **后端**: Node.js + Express + Socket.io
- **通信**: WebRTC + Socket.io
- **构建工具**: Create React App + Concurrently

## 项目结构

### 服务器端 (server/)
```
server/
├── config/
│   └── config.js          # 应用配置管理
├── models/
│   └── RoomManager.js      # 房间管理逻辑
├── handlers/
│   └── socketHandlers.js   # Socket.io 事件处理
├── routes/
│   └── api.js              # API 路由
├── app.js                  # 应用程序主类
└── index.js                # 入口文件
```

#### 服务器端模块说明

**config/config.js**
- 统一管理应用配置
- 支持环境变量配置
- 包含服务器、CORS、房间等配置

**models/RoomManager.js**
- 房间和用户状态管理
- 提供房间创建、用户加入/离开等方法
- 内存存储实现

**handlers/socketHandlers.js**
- 封装所有 Socket.io 事件处理逻辑
- 处理用户连接、房间管理、WebRTC 信令
- 与 RoomManager 协作管理状态

**routes/api.js**
- RESTful API 路由
- 提供房间信息查询接口

**app.js**
- 应用程序主类
- 整合各个模块
- 提供启动和关闭方法

### 客户端 (client/src/)
```
client/src/
├── components/
│   ├── GameScreen.tsx      # 游戏主界面（重构后）
│   ├── GameUI.tsx          # 游戏UI组件
│   ├── VideoContainer.tsx  # 视频容器组件
│   └── LoginScreen.tsx     # 登录界面
├── hooks/
│   ├── useSocket.ts        # Socket连接管理Hook
│   ├── useWebRTC.ts        # WebRTC管理Hook
│   └── usePhaser.ts        # Phaser游戏管理Hook
├── services/
│   └── WebRTCManager.ts    # WebRTC服务类
├── game/
│   └── GameScene.ts        # Phaser游戏场景
├── config/
│   └── constants.ts        # 客户端配置常量
└── App.tsx                 # 应用根组件
```

#### 客户端模块说明

**hooks/ 目录**
- `useSocket.ts`: 管理 Socket.io 连接和房间状态
- `useWebRTC.ts`: 管理 WebRTC 连接和媒体流
- `usePhaser.ts`: 管理 Phaser 游戏实例

**components/ 目录**
- `GameScreen.tsx`: 主游戏界面，使用自定义 Hooks
- `GameUI.tsx`: 游戏界面UI组件
- `VideoContainer.tsx`: 视频显示组件

**config/constants.ts**
- 统一管理客户端配置
- 包含服务器地址、游戏配置、WebRTC配置等

## 架构优势

### 1. 模块化设计
- **服务器端**: 按功能拆分为配置、模型、处理器、路由等模块
- **客户端**: 使用自定义 Hooks 分离业务逻辑，组件职责单一

### 2. 代码复用
- 自定义 Hooks 可在多个组件间复用
- 配置文件统一管理，便于维护

### 3. 易于测试
- 每个模块职责明确，便于单元测试
- Hooks 可独立测试

### 4. 可维护性
- 代码结构清晰，易于理解和修改
- 配置集中管理，环境切换方便

### 5. 可扩展性
- 新功能可通过添加新的 Hook 或组件实现
- 服务器端可轻松添加新的处理器或路由

## 数据流

### 客户端数据流
1. `useSocket` Hook 管理 Socket 连接和房间状态
2. `useWebRTC` Hook 基于 Socket 状态管理 WebRTC 连接
3. `usePhaser` Hook 基于 Socket 状态初始化游戏
4. 组件通过 Props 接收状态和回调函数

### 服务器端数据流
1. Socket 连接通过 `socketHandlers` 处理
2. `RoomManager` 管理房间和用户状态
3. API 路由提供状态查询接口
4. 配置通过 `config.js` 统一管理

## 部署说明

### 开发环境
```bash
npm run dev  # 同时启动服务器和客户端
```

### 生产环境
1. 构建客户端: `cd client && npm run build`
2. 启动服务器: `cd server && npm start`
3. 配置环境变量（端口、CORS等）

## 未来优化方向

1. **状态管理**: 考虑引入 Redux 或 Zustand 进行全局状态管理
2. **数据持久化**: 替换内存存储为数据库存储
3. **错误处理**: 完善错误边界和错误恢复机制
4. **性能优化**: 添加组件懒加载和代码分割
5. **测试覆盖**: 增加单元测试和集成测试