import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { User } from '../App';
import { SERVER_CONFIG } from '../config/constants';

interface UseSocketProps {
  user: User;
  roomId: string;
  onLogout: () => void;
}

interface UseSocketReturn {
  socket: Socket | null;
  roomUsers: User[];
  isConnected: boolean;
}

export const useSocket = ({ user, roomId, onLogout }: UseSocketProps): UseSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [roomUsers, setRoomUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 初始化Socket连接
    socketRef.current = io(SERVER_CONFIG.URL);
    const socket = socketRef.current;

    // 连接事件
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket连接成功:', socket.id);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket连接断开');
    });

    // 房间相关事件
    socket.on('room-users', (users: User[]) => {
      setRoomUsers(users);
    });

    socket.on('user-joined', (newUser: User) => {
      setRoomUsers(prev => [...prev, newUser]);
    });

    socket.on('user-left', (userId: string) => {
      setRoomUsers(prev => prev.filter(u => u.id !== userId));
    });

    socket.on('room-full', () => {
      alert('房间已满，无法加入！');
      onLogout();
    });

    // 加入房间
    socket.emit('join-room', {
      roomId,
      username: user.username,
      avatar: user.avatar
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
    };
  }, [user, roomId, onLogout]);

  return {
    socket: socketRef.current,
    roomUsers,
    isConnected
  };
};