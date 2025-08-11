import { Socket } from 'socket.io-client';

class WebRTCManager {
  private socket: Socket;
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  private rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  constructor(socket: Socket) {
    this.socket = socket;
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.socket.on('webrtc-offer', async (data: { offer: RTCSessionDescriptionInit; senderId: string }) => {
      await this.handleOffer(data.offer, data.senderId);
    });

    this.socket.on('webrtc-answer', async (data: { answer: RTCSessionDescriptionInit; senderId: string }) => {
      await this.handleAnswer(data.answer, data.senderId);
    });

    this.socket.on('webrtc-ice-candidate', async (data: { candidate: RTCIceCandidateInit; senderId: string }) => {
      await this.handleIceCandidate(data.candidate, data.senderId);
    });
  }

  setLocalStream(stream: MediaStream) {
    this.localStream = stream;
    
    // 为所有现有连接添加流
    this.peerConnections.forEach((pc) => {
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
    });
  }

  createPeerConnection(userId: string, isInitiator: boolean): RTCPeerConnection {
    if (this.peerConnections.has(userId)) {
      return this.peerConnections.get(userId)!;
    }

    const peerConnection = new RTCPeerConnection(this.rtcConfiguration);
    this.peerConnections.set(userId, peerConnection);

    // 添加本地流
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // 处理远程流
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      this.emit('remoteStream', userId, remoteStream);
    };

    // 处理ICE候选
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('webrtc-ice-candidate', {
          targetId: userId,
          candidate: event.candidate
        });
      }
    };

    // 连接状态变化
    peerConnection.onconnectionstatechange = () => {
      console.log(`WebRTC连接状态 (${userId}):`, peerConnection.connectionState);
      
      if (peerConnection.connectionState === 'failed' || 
          peerConnection.connectionState === 'disconnected') {
        this.removePeerConnection(userId);
      }
    };

    // 如果是发起方，创建offer
    if (isInitiator) {
      this.createOffer(userId);
    }

    return peerConnection;
  }

  private async createOffer(userId: string) {
    const peerConnection = this.peerConnections.get(userId);
    if (!peerConnection) return;

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      this.socket.emit('webrtc-offer', {
        targetId: userId,
        offer: offer
      });
    } catch (error) {
      console.error('创建offer失败:', error);
    }
  }

  private async handleOffer(offer: RTCSessionDescriptionInit, senderId: string) {
    let peerConnection = this.peerConnections.get(senderId);
    
    if (!peerConnection) {
      peerConnection = this.createPeerConnection(senderId, false);
    }

    try {
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      this.socket.emit('webrtc-answer', {
        targetId: senderId,
        answer: answer
      });
    } catch (error) {
      console.error('处理offer失败:', error);
    }
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit, senderId: string) {
    const peerConnection = this.peerConnections.get(senderId);
    if (!peerConnection) return;

    try {
      await peerConnection.setRemoteDescription(answer);
    } catch (error) {
      console.error('处理answer失败:', error);
    }
  }

  private async handleIceCandidate(candidate: RTCIceCandidateInit, senderId: string) {
    const peerConnection = this.peerConnections.get(senderId);
    if (!peerConnection) return;

    try {
      await peerConnection.addIceCandidate(candidate);
    } catch (error) {
      console.error('添加ICE候选失败:', error);
    }
  }

  removePeerConnection(userId: string) {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(userId);
    }
  }

  cleanup() {
    this.peerConnections.forEach((pc) => {
      pc.close();
    });
    this.peerConnections.clear();
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
  }

  // 事件系统
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  private emit(event: string, ...args: any[]) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(...args));
    }
  }
}

export default WebRTCManager;