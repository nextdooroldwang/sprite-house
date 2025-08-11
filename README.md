# Sprite House

一个类似Gather Town的虚拟空间应用，支持多人在线互动、音视频通话和2D像素风格的虚拟环境。

## 技术栈

### 前端
- **React** - 用户界面框架
- **TypeScript** - 类型安全的JavaScript
- **Phaser.js** - 2D游戏引擎，用于渲染虚拟空间
- **Socket.io Client** - 实时通信
- **WebRTC** - 点对点音视频通话

### 后端
- **Node.js + Express** - 服务器框架
- **Socket.io** - 实时双向通信
- **MongoDB** - 数据库（用于存储用户和房间信息）
- **Redis** - 缓存和会话管理

## 功能特性

- 🏠 **虚拟空间** - 2D像素风格的可自定义虚拟环境
- 👥 **多人在线** - 支持最多4人同时在线（WebRTC P2P）
- 🎥 **音视频通话** - 基于WebRTC的实时音视频通信
- 🚶 **角色移动** - 使用方向键或WASD控制角色移动
- 💬 **实时同步** - 实时同步用户位置和状态
- 🎨 **个性化** - 可选择不同的头像和用户名

## 项目结构

```
sprite-house/
├── client/                 # React前端应用
│   ├── public/
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── game/          # Phaser游戏相关
│   │   ├── services/      # 服务类（WebRTC等）
│   │   ├── App.tsx        # 主应用组件
│   │   └── index.tsx      # 应用入口
│   └── package.json
├── server/                 # Node.js后端服务
│   ├── index.js           # 服务器入口
│   ├── .env.example       # 环境变量示例
│   └── package.json
└── package.json           # 根目录配置
```

## 快速开始

### 前置要求

- Node.js (v16+)
- MongoDB
- Redis

### 安装依赖

```bash
# 安装所有依赖
npm run install:all
```

### 配置环境变量

```bash
# 复制环境变量文件
cp server/.env.example server/.env

# 编辑环境变量（可选，默认配置适用于本地开发）
# vim server/.env
```

### 启动服务

#### 开发模式（推荐）

```bash
# 同时启动前端和后端开发服务器
npm run dev
```

#### 分别启动

```bash
# 启动后端服务器
npm run server:dev

# 启动前端开发服务器（新终端）
npm run client:dev
```

### 访问应用

- 前端应用: http://localhost:3000
- 后端API: http://localhost:3001

## 使用说明

1. **登录** - 输入用户名、选择头像、输入或生成房间ID
2. **移动** - 使用方向键（↑↓←→）或WASD键控制角色移动
3. **音视频** - 自动启用摄像头和麦克风进行通话
4. **多人互动** - 最多4人可以同时在一个房间内互动

## API接口

### REST API

- `GET /api/rooms/:roomId` - 获取房间信息

### Socket.io事件

#### 客户端发送
- `join-room` - 加入房间
- `user-move` - 用户移动
- `webrtc-offer` - WebRTC offer
- `webrtc-answer` - WebRTC answer
- `webrtc-ice-candidate` - ICE候选

#### 服务端发送
- `room-users` - 房间用户列表
- `user-joined` - 用户加入
- `user-left` - 用户离开
- `user-moved` - 用户移动
- `room-full` - 房间已满

## 开发说明

### 添加新功能

1. **前端组件** - 在 `client/src/components/` 添加新组件
2. **游戏逻辑** - 在 `client/src/game/` 修改Phaser场景
3. **服务端逻辑** - 在 `server/index.js` 添加新的Socket事件处理

### 调试

- 前端: 使用浏览器开发者工具
- 后端: 查看终端日志输出
- WebRTC: 在浏览器中访问 `chrome://webrtc-internals/`

## 部署

### 构建生产版本

```bash
# 构建前端
npm run build

# 启动生产服务器
npm start
```

### Docker部署（可选）

```bash
# 构建镜像
docker build -t sprite-house .

# 运行容器
docker run -p 3001:3001 sprite-house
```

## 故障排除

### 常见问题

1. **摄像头/麦克风权限** - 确保浏览器允许访问媒体设备
2. **WebRTC连接失败** - 检查网络防火墙设置
3. **MongoDB连接失败** - 确保MongoDB服务正在运行
4. **Redis连接失败** - 确保Redis服务正在运行

### 日志查看

```bash
# 查看服务器日志
npm run server:dev

# 查看前端控制台
# 打开浏览器开发者工具 -> Console
```

## 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 许可证

MIT License