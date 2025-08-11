import React from 'react';
import { User } from '../App';
import { generateAvatarList, getAvatarSelectorStyle } from '../utils/avatarUtils';

interface GameUIProps {
  user: User;
  roomId: string;
  roomUsers: User[];
  onLogout: () => void;
}

const GameUI: React.FC<GameUIProps> = ({ user, roomId, roomUsers, onLogout }) => {
  // 获取用户头像信息
  const avatarList = generateAvatarList();
  const avatarInfo = avatarList.find(a => a.id === user.avatar) || avatarList[0];

  return (
    <div className="game-ui">
      <div className="user-info">
        <div 
          className="user-avatar"
          style={{
            ...getAvatarSelectorStyle(avatarInfo, 40),
            borderRadius: '50%',
            border: '2px solid #e74c3c'
          }}
        />
        <div>
          <div>{user.username}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>房间: {roomId}</div>
        </div>
      </div>
      
      <div className="room-info">
        <div>在线用户: {roomUsers.length}/4</div>
      </div>
      
      <button className="logout-button" onClick={onLogout}>
        退出房间
      </button>
    </div>
  );
};

export default GameUI;