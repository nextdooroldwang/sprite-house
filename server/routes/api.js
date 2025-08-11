const express = require('express');
const router = express.Router();

class ApiRoutes {
  constructor(roomManager) {
    this.roomManager = roomManager;
    this.setupRoutes();
  }

  // 获取房间信息
  getRoomInfo(req, res) {
    const { roomId } = req.params;
    const roomInfo = this.roomManager.getRoomInfo(roomId);
    res.json(roomInfo);
  }

  // 设置路由
  setupRoutes() {
    router.get('/rooms/:roomId', (req, res) => this.getRoomInfo(req, res));
  }

  // 获取路由器
  getRouter() {
    return router;
  }
}

module.exports = ApiRoutes;