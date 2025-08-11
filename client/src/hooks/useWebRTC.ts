import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import WebRTCManager from '../services/WebRTCManager';
import { User } from '../App';
import { WEBRTC_CONFIG } from '../config/constants';

interface UseWebRTCProps {
  socket: Socket | null;
  roomUsers: User[];
}

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  webrtcManager: WebRTCManager | null;
}

export const useWebRTC = ({ socket, roomUsers }: UseWebRTCProps): UseWebRTCReturn => {
  const webrtcManagerRef = useRef<WebRTCManager | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());

  useEffect(() => {
    if (!socket) return;

    // 初始化WebRTC管理器
    webrtcManagerRef.current = new WebRTCManager(socket);
    const webrtcManager = webrtcManagerRef.current;

    // 获取本地媒体流
    navigator.mediaDevices.getUserMedia(WEBRTC_CONFIG.MEDIA_CONSTRAINTS)
      .then((stream) => {
        setLocalStream(stream);
        webrtcManager.setLocalStream(stream);
      })
      .catch((error) => {
        console.error('获取媒体流失败:', error);
      });

    // WebRTC事件监听
    webrtcManager.on('remoteStream', (userId: string, stream: MediaStream) => {
      setRemoteStreams(prev => new Map(prev.set(userId, stream)));
    });

    return () => {
      if (webrtcManagerRef.current) {
        webrtcManagerRef.current.cleanup();
        webrtcManagerRef.current = null;
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  // 处理房间用户变化
  useEffect(() => {
    if (!webrtcManagerRef.current || !socket) return;

    const webrtcManager = webrtcManagerRef.current;

    // 为每个已存在的用户创建WebRTC连接
    roomUsers.forEach((roomUser) => {
      if (roomUser.id !== socket.id) {
        webrtcManager.createPeerConnection(roomUser.id, true);
      }
    });
  }, [roomUsers, socket]);

  // 处理用户离开
  useEffect(() => {
    if (!webrtcManagerRef.current) return;

    const webrtcManager = webrtcManagerRef.current;
    const currentUserIds = new Set(roomUsers.map(user => user.id));
    
    // 移除已离开用户的连接
    remoteStreams.forEach((_, userId) => {
      if (!currentUserIds.has(userId)) {
        webrtcManager.removePeerConnection(userId);
        setRemoteStreams(prev => {
          const newStreams = new Map(prev);
          newStreams.delete(userId);
          return newStreams;
        });
      }
    });
  }, [roomUsers, remoteStreams]);

  return {
    localStream,
    remoteStreams,
    webrtcManager: webrtcManagerRef.current
  };
};