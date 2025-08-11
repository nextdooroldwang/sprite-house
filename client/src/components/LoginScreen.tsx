import React, { useState } from 'react';
import AvatarSelector from './AvatarSelector';

interface LoginScreenProps {
  onLogin: (username: string, avatar: string, roomId: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('avatar_1');
  const [roomId, setRoomId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && roomId.trim()) {
      onLogin(username.trim(), avatar, roomId.trim());
    }
  };

  const generateRandomRoomId = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(randomId);
  };

  return (
    <div className="login-screen">
      <div className="login-form">
        <h1>🏠 Sprite House</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入您的用户名"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="avatar">选择头像</label>
            <AvatarSelector
              selectedAvatar={avatar}
              onAvatarSelect={setAvatar}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="roomId">房间ID</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="输入房间ID或点击生成"
                required
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={generateRandomRoomId}
                style={{
                  padding: '0.75rem',
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                生成
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            className="login-button"
            disabled={!username.trim() || !roomId.trim()}
          >
            进入房间
          </button>
        </form>
        
        <div style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
          <p>💡 提示：每个房间最多支持4人同时在线</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;