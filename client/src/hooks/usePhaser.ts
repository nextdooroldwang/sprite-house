import { useEffect, useRef } from 'react';
import { Game } from 'phaser';
import { Socket } from 'socket.io-client';
import GameScene from '../game/GameScene';
import { User } from '../App';
import { GAME_CONFIG } from '../config/constants';

interface UsePhaserProps {
  socket: Socket | null;
  user: User;
  roomId: string;
}

interface UsePhaserReturn {
  gameRef: React.RefObject<HTMLDivElement>;
  phaserGame: Game | null;
}

export const usePhaser = ({ socket, user, roomId }: UsePhaserProps): UsePhaserReturn => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Game | null>(null);

  useEffect(() => {
    if (!socket || !gameRef.current || phaserGameRef.current) return;

    // 初始化Phaser游戏配置
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: GAME_CONFIG.WIDTH,
      height: GAME_CONFIG.HEIGHT,
      parent: gameRef.current,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: GAME_CONFIG.PHYSICS.GRAVITY,
          debug: GAME_CONFIG.PHYSICS.DEBUG
        }
      },
      scene: GameScene,
      backgroundColor: GAME_CONFIG.BACKGROUND_COLOR
    };

    // 创建Phaser游戏实例
    phaserGameRef.current = new Game(config);
    
    // 将socket和用户信息传递给游戏场景
    phaserGameRef.current.scene.start('GameScene', {
      socket,
      user: { ...user, id: socket.id },
      roomId
    });

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [socket, user, roomId]);

  return {
    gameRef,
    phaserGame: phaserGameRef.current
  };
};