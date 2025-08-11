const SpriteHouseServer = require('./app');

// 创建服务器实例
const server = new SpriteHouseServer();

// 启动服务器
server.start();

// 优雅关闭处理
process.on('SIGTERM', () => {
  server.shutdown();
});

process.on('SIGINT', () => {
  server.shutdown();
});