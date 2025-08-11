const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const config = require('./config/config');
const RoomManager = require('./models/RoomManager');
const SocketHandlers = require('./handlers/socketHandlers');
const ApiRoutes = require('./routes/api');

class SpriteHouseServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.roomManager = new RoomManager();
    
    this.setupMiddleware();
    this.setupSocketIO();
    this.setupRoutes();
  }

  // 设置中间件
  setupMiddleware() {
    this.app.use(cors(config.cors));
    this.app.use(express.json());
  }

  // 设置Socket.IO
  setupSocketIO() {
    this.io = socketIo(this.server, {
      cors: config.cors
    });

    this.socketHandlers = new SocketHandlers(this.io, this.roomManager);
    
    this.io.on('connection', (socket) => {
      this.socketHandlers.setupSocketListeners(socket);
    });
  }

  // 设置路由
  setupRoutes() {
    const apiRoutes = new ApiRoutes(this.roomManager);
    this.app.use('/api', apiRoutes.getRouter());
  }

  // 启动服务器
  start() {
    const { port, host } = config.server;
    
    this.server.listen(port, () => {
      console.log('使用内存存储模式');
      console.log(`服务器运行在端口 ${port}`);
      console.log(`CORS允许来源: ${config.cors.origin}`);
    });
  }

  // 优雅关闭
  shutdown() {
    console.log('正在关闭服务器...');
    this.server.close(() => {
      console.log('服务器已关闭');
      process.exit(0);
    });
  }
}

module.exports = SpriteHouseServer;