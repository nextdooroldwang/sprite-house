class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.userSockets = new Map();
  }

  // 创建或获取房间
  getOrCreateRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        users: new Map(),
        maxUsers: 4
      });
    }
    return this.rooms.get(roomId);
  }

  // 检查房间是否已满
  isRoomFull(roomId) {
    const room = this.rooms.get(roomId);
    return room && room.users.size >= room.maxUsers;
  }

  // 添加用户到房间
  addUserToRoom(roomId, socketId, userData) {
    const room = this.getOrCreateRoom(roomId);
    
    const user = {
      id: socketId,
      username: userData.username,
      avatar: userData.avatar,
      x: 400,
      y: 300,
      roomId
    };

    room.users.set(socketId, user);
    this.userSockets.set(socketId, { roomId, user });
    
    return user;
  }

  // 从房间移除用户
  removeUserFromRoom(socketId) {
    const userSocket = this.userSockets.get(socketId);
    if (!userSocket) return null;

    const { roomId } = userSocket;
    const room = this.rooms.get(roomId);
    
    if (room) {
      room.users.delete(socketId);
      
      // 如果房间为空，删除房间
      if (room.users.size === 0) {
        this.rooms.delete(roomId);
      }
    }
    
    this.userSockets.delete(socketId);
    return { roomId, room };
  }

  // 更新用户位置
  updateUserPosition(socketId, x, y) {
    const userSocket = this.userSockets.get(socketId);
    if (!userSocket) return null;

    const { roomId } = userSocket;
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const roomUser = room.users.get(socketId);
    if (roomUser) {
      roomUser.x = x;
      roomUser.y = y;
      return { roomId, position: { id: socketId, x, y } };
    }
    
    return null;
  }

  // 获取房间用户列表
  getRoomUsers(roomId) {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.users.values()) : [];
  }

  // 获取房间信息
  getRoomInfo(roomId) {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return {
        exists: false,
        users: [],
        maxUsers: 4
      };
    }

    return {
      exists: true,
      users: Array.from(room.users.values()),
      maxUsers: room.maxUsers,
      currentUsers: room.users.size
    };
  }

  // 获取用户所在房间ID
  getUserRoomId(socketId) {
    const userSocket = this.userSockets.get(socketId);
    return userSocket ? userSocket.roomId : null;
  }
}

module.exports = RoomManager;