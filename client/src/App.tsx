import React, { useEffect, useState } from 'react';
import LoginScreen from './components/LoginScreen';
import GameScreen from './components/GameScreen';
import './App.css';
import { SERVER_CONFIG } from './config/constants';

export interface User {
  id: string;
  username: string;
  avatar: string;
  x: number;
  y: number;
}

const App: React.FC = () => {
  // 身份与会话状态
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [lineProfile, setLineProfile] = useState<{ userId: string; name?: string; picture?: string } | null>(null);

  // 游戏会话状态（加入房间后）
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [roomId, setRoomId] = useState<string>('');
  const [authenticating, setAuthenticating] = useState<boolean>(false);
  const [prefilledRoomId, setPrefilledRoomId] = useState<string>('');

  const handleLogin = (username: string, avatar: string, room: string) => {
    const user: User = {
      id: '',
      username,
      avatar,
      x: 400,
      y: 300
    };
    setCurrentUser(user);
    setRoomId(room);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setRoomId('');
  };

  // 处理 LINE 回调 /callback?code=xxx&state=ROOMID
  useEffect(() => {
    const handleLineCallback = async () => {
      if (window.location.pathname !== '/callback') return;

      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state') || '';

      if (!code) return;
      try {
        setAuthenticating(true);
        const resp = await fetch('/api/auth/line/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });
        const data = await resp.json();
        if (!resp.ok || !data?.ok) throw new Error(data?.error || 'LINE 登录失败');

        const profile = data.profile || {};
        setLineProfile({
          userId: profile.userId,
          name: profile.name,
          picture: profile.picture
        });
        setIsAuthenticated(true);
        setPrefilledRoomId(state || '');
      } catch (err) {
        console.error(err);
        alert('LINE 登录失败，请重试');
      } finally {
        // 清理 URL 回首页
        window.history.replaceState({}, '', '/');
        setAuthenticating(false);
      }
    };

    handleLineCallback();
  }, []);

  const handleLineLogin = () => {
    // 使用绝对后端地址，避免 CRA 开发服务器将 HTML 导航请求拦截为 SPA 刷新
    window.location.href = `${SERVER_CONFIG.URL}/api/auth/line/login`;
  };

  // 未通过 LINE 登录时，先进行 LINE 登录
  if (!isAuthenticated) {
    return (
      <div className="App" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="login-form" style={{ width: 360, padding: '2rem', background: 'rgba(255,255,255,0.9)', borderRadius: 8 }}>
          <h1 style={{ marginTop: 0 }}>🏠 Sprite House</h1>
          <p style={{ opacity: 0.8 }}>请先使用 LINE 登录，随后可以选择房间并进入游戏。</p>
          <button
            onClick={handleLineLogin}
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '0.75rem',
              background: '#06C755',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            {authenticating ? '正在跳转...' : '使用 LINE 登录'}
          </button>
        </div>
      </div>
    );
  }

  // 已通过 LINE 登录但尚未加入房间：显示房间选择页面
  return (
    <div className="App">
      {authenticating && (
        <div style={{ padding: '2rem', textAlign: 'center' }}>正在通过 LINE 登录...</div>
      )}
      {!authenticating && (!isLoggedIn ? (
        <LoginScreen
          onLogin={handleLogin}
          initialUsername={lineProfile?.name || 'LINE 用户'}
          initialRoomId={prefilledRoomId}
        />
      ) : (
        <GameScreen 
          user={currentUser!} 
          roomId={roomId} 
          onLogout={handleLogout}
        />
      ))}
    </div>
  );
};

export default App;