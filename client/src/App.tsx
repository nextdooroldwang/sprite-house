import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import GameScreen from './components/GameScreen';
import './App.css';

export interface User {
  id: string;
  username: string;
  avatar: string;
  x: number;
  y: number;
}

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [roomId, setRoomId] = useState<string>('');

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

  return (
    <div className="App">
      {!isLoggedIn ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <GameScreen 
          user={currentUser!} 
          roomId={roomId} 
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default App;