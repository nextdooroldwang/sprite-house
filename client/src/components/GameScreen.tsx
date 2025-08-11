import React from 'react';
import { User } from '../App';
import { useSocket } from '../hooks/useSocket';
import { useWebRTC } from '../hooks/useWebRTC';
import { usePhaser } from '../hooks/usePhaser';
import GameUI from './GameUI';
import VideoContainer from './VideoContainer';

interface GameScreenProps {
  user: User;
  roomId: string;
  onLogout: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ user, roomId, onLogout }) => {
  // 使用自定义Hooks管理不同的逻辑
  const { socket, roomUsers } = useSocket({ user, roomId, onLogout });
  const { localStream, remoteStreams } = useWebRTC({ socket, roomUsers });
  const { gameRef } = usePhaser({ socket, user, roomId });

  return (
    <div className="game-screen">
      <GameUI 
        user={user} 
        roomId={roomId} 
        roomUsers={roomUsers} 
        onLogout={onLogout} 
      />
      
      <div ref={gameRef} className="phaser-game" />
      
      <VideoContainer 
        localStream={localStream} 
        remoteStreams={remoteStreams} 
      />
    </div>
  );
};

export default GameScreen;