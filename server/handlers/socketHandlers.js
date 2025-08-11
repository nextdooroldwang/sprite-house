class SocketHandlers {
  constructor(io, roomManager) {
    this.io = io;
    this.roomManager = roomManager;
  }

  // 处理用户加入房间
  handleJoinRoom(socket, data) {
    const { roomId, username, avatar } = data;
    
    // 检查房间是否已满
    if (this.roomManager.isRoomFull(roomId)) {
      socket.emit('room-full');
      return;
    }

    // 添加用户到房间
    const user = this.roomManager.addUserToRoom(roomId, socket.id, { username, avatar });
    
    // 加入Socket.io房间
    socket.join(roomId);
    
    // 通知房间内其他用户
    socket.to(roomId).emit('user-joined', user);
    
    // 发送当前房间用户列表给新用户
    const roomUsers = this.roomManager.getRoomUsers(roomId);
    socket.emit('room-users', roomUsers);
    
    console.log(`用户 ${username} 加入房间 ${roomId}`);
  }

  // 处理用户移动
  handleUserMove(socket, data) {
    const result = this.roomManager.updateUserPosition(socket.id, data.x, data.y);
    
    if (result) {
      // 广播给房间内其他用户
      socket.to(result.roomId).emit('user-moved', result.position);
    }
  }

  // 处理WebRTC offer
  handleWebRTCOffer(socket, data) {
    socket.to(data.target).emit('webrtc-offer', {
      offer: data.offer,
      sender: socket.id
    });
  }

  // 处理WebRTC answer
  handleWebRTCAnswer(socket, data) {
    socket.to(data.target).emit('webrtc-answer', {
      answer: data.answer,
      sender: socket.id
    });
  }

  // 处理WebRTC ICE candidate
  handleWebRTCIceCandidate(socket, data) {
    socket.to(data.target).emit('webrtc-ice-candidate', {
      candidate: data.candidate,
      sender: socket.id
    });
  }

  // 处理用户断开连接
  handleDisconnect(socket) {
    console.log('用户断开连接:', socket.id);
    
    const result = this.roomManager.removeUserFromRoom(socket.id);
    
    if (result && result.room) {
      // 通知房间内其他用户
      socket.to(result.roomId).emit('user-left', socket.id);
    }
  }

  // 设置Socket事件监听器
  setupSocketListeners(socket) {
    console.log('用户连接:', socket.id);
    
    socket.on('join-room', (data) => this.handleJoinRoom(socket, data));
    socket.on('user-move', (data) => this.handleUserMove(socket, data));
    socket.on('webrtc-offer', (data) => this.handleWebRTCOffer(socket, data));
    socket.on('webrtc-answer', (data) => this.handleWebRTCAnswer(socket, data));
    socket.on('webrtc-ice-candidate', (data) => this.handleWebRTCIceCandidate(socket, data));
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }
}

module.exports = SocketHandlers;