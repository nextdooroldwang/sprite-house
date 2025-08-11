require('dotenv').config();

const config = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3301,
    host: process.env.HOST || 'localhost'
  },

  // CORS配置
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3300",
    methods: ["GET", "POST"]
  },

  // 房间配置
  room: {
    maxUsers: parseInt(process.env.MAX_USERS_PER_ROOM) || 4,
    defaultPosition: {
      x: 400,
      y: 300
    }
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

module.exports = config;