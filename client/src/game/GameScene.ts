import Phaser from 'phaser';
import { Socket } from 'socket.io-client';
import { User } from '../App';
import { AVATAR_CONFIG, generateAvatarList } from '../utils/avatarUtils';

interface GameData {
  socket: Socket;
  user: User;
  roomId: string;
}

class GameScene extends Phaser.Scene {
  private socket!: Socket;
  private currentUser!: User;
  private roomId!: string;
  private players: Map<string, Phaser.GameObjects.Container> = new Map();
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: any;
  private localPlayer!: Phaser.GameObjects.Container;
  private lastMoveTime = 0;
  private moveThrottle = 50; // 50ms throttle for movement updates
  
  // 移动端控制相关
  private isMobile = false;
  private touchControls: {
    upButton?: Phaser.GameObjects.Image;
    downButton?: Phaser.GameObjects.Image;
    leftButton?: Phaser.GameObjects.Image;
    rightButton?: Phaser.GameObjects.Image;
  } = {};
  private activeTouch = {
    up: false,
    down: false,
    left: false,
    right: false
  };

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: GameData) {
    this.socket = data.socket;
    this.currentUser = data.user;
    this.roomId = data.roomId;
  }

  preload() {
    // 创建简单的像素风格纹理
    this.load.image('floor', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    
    // 加载头像精灵图
    this.load.image('avatars', AVATAR_CONFIG.SPRITE_SHEET);
    
    // 创建角色纹理（简单的圆形，作为备用）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x3498db);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 检测是否为移动设备
    this.isMobile = this.sys.game.device.input.touch;
    
    // 设置更大的世界边界（比屏幕大2倍）
    const worldWidth = this.cameras.main.width * 2;
    const worldHeight = this.cameras.main.height * 2;
    
    // 设置摄像机边界
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    
    // 创建地板
    const floor = this.add.tileSprite(0, 0, worldWidth, worldHeight, 'floor');
    floor.setOrigin(0, 0);
    floor.setTint(0x34495e);

    // 创建网格
     const gridGraphics = this.add.graphics();
     gridGraphics.lineStyle(1, 0x2c3e50, 0.3);
     
     const gridSize = 50;
     for (let x = 0; x < worldWidth; x += gridSize) {
       gridGraphics.moveTo(x, 0);
       gridGraphics.lineTo(x, worldHeight);
     }
     for (let y = 0; y < worldHeight; y += gridSize) {
       gridGraphics.moveTo(0, y);
       gridGraphics.lineTo(worldWidth, y);
     }
     gridGraphics.strokePath();
     
     // 添加地图边界标记
     const borderGraphics = this.add.graphics();
     borderGraphics.lineStyle(4, 0xe74c3c, 0.8);
     borderGraphics.strokeRect(0, 0, worldWidth, worldHeight);
     
     // 在地图四个角落添加标记文字
     this.add.text(20, 20, '地图左上角', { fontSize: '16px', color: '#e74c3c' });
     this.add.text(worldWidth - 120, 20, '地图右上角', { fontSize: '16px', color: '#e74c3c' });
     this.add.text(20, worldHeight - 40, '地图左下角', { fontSize: '16px', color: '#e74c3c' });
     this.add.text(worldWidth - 120, worldHeight - 40, '地图右下角', { fontSize: '16px', color: '#e74c3c' });

    // 创建本地玩家
    this.createPlayer(this.currentUser.id, this.currentUser, true);
    
    // 设置摄像机跟随本地玩家
    this.cameras.main.startFollow(this.localPlayer);

    // 设置输入控制
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasdKeys = this.input.keyboard!.addKeys('W,S,A,D');
    
    // 如果是移动设备，创建触摸控制
    if (this.isMobile) {
      this.createTouchControls();
    }

    // Socket事件监听
    this.socket.on('user-moved', (data: { userId: string; x: number; y: number }) => {
      this.updatePlayerPosition(data.userId, data.x, data.y);
    });

    this.socket.on('user-joined', (user: User) => {
      this.createPlayer(user.id, user, false);
    });

    this.socket.on('user-left', (userId: string) => {
      this.removePlayer(userId);
    });

    this.socket.on('room-users', (users: User[]) => {
      users.forEach(user => {
        if (user.id !== this.currentUser.id) {
          this.createPlayer(user.id, user, false);
        }
      });
    });
  }

  update() {
    if (!this.localPlayer) return;

    const speed = 200;
    let velocityX = 0;
    let velocityY = 0;

    // 检查键盘输入
    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
      velocityX = -speed;
    } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
      velocityX = speed;
    }

    if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
      velocityY = -speed;
    } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
      velocityY = speed;
    }
    
    // 检查触摸输入（移动端）
    if (this.isMobile) {
      if (this.activeTouch.left) {
        velocityX = -speed;
      } else if (this.activeTouch.right) {
        velocityX = speed;
      }
      
      if (this.activeTouch.up) {
        velocityY = -speed;
      } else if (this.activeTouch.down) {
        velocityY = speed;
      }
    }

    // 更新位置
    if (velocityX !== 0 || velocityY !== 0) {
      const deltaTime = this.game.loop.delta;
      const newX = this.localPlayer.x + (velocityX * deltaTime / 1000);
      const newY = this.localPlayer.y + (velocityY * deltaTime / 1000);

      // 边界检查（使用世界边界）
      const worldWidth = this.cameras.main.width * 2;
      const worldHeight = this.cameras.main.height * 2;
      const boundedX = Phaser.Math.Clamp(newX, 16, worldWidth - 16);
      const boundedY = Phaser.Math.Clamp(newY, 16, worldHeight - 16);

      this.localPlayer.setPosition(boundedX, boundedY);

      // 节流发送位置更新
      const now = Date.now();
      if (now - this.lastMoveTime > this.moveThrottle) {
        this.socket.emit('user-move', {
          x: boundedX,
          y: boundedY
        });
        this.lastMoveTime = now;
      }
    }
  }

  private createTouchControls() {
    const buttonSize = 60;
    const margin = 30;
    const alpha = 0.7;
    
    // 创建方向按钮的图形
    const createButtonGraphic = (direction: string) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(0x333333, alpha);
      graphics.fillCircle(0, 0, buttonSize / 2);
      graphics.lineStyle(3, 0xffffff, alpha);
      
      // 绘制箭头
      const arrowSize = 15;
      switch (direction) {
        case 'up':
          graphics.moveTo(0, -arrowSize);
          graphics.lineTo(-arrowSize / 2, arrowSize / 2);
          graphics.moveTo(0, -arrowSize);
          graphics.lineTo(arrowSize / 2, arrowSize / 2);
          break;
        case 'down':
          graphics.moveTo(0, arrowSize);
          graphics.lineTo(-arrowSize / 2, -arrowSize / 2);
          graphics.moveTo(0, arrowSize);
          graphics.lineTo(arrowSize / 2, -arrowSize / 2);
          break;
        case 'left':
          graphics.moveTo(-arrowSize, 0);
          graphics.lineTo(arrowSize / 2, -arrowSize / 2);
          graphics.moveTo(-arrowSize, 0);
          graphics.lineTo(arrowSize / 2, arrowSize / 2);
          break;
        case 'right':
          graphics.moveTo(arrowSize, 0);
          graphics.lineTo(-arrowSize / 2, -arrowSize / 2);
          graphics.moveTo(arrowSize, 0);
          graphics.lineTo(-arrowSize / 2, arrowSize / 2);
          break;
      }
      graphics.strokePath();
      
      return graphics;
    };
    
    // 创建按钮并设置位置
    const screenHeight = this.cameras.main.height;
    
    // 左侧方向控制
      this.touchControls.leftButton = createButtonGraphic('left') as any;
      if (this.touchControls.leftButton) {
        this.touchControls.leftButton.setPosition(margin + buttonSize, screenHeight - margin - buttonSize);
        this.touchControls.leftButton.setScrollFactor(0); // 固定在屏幕上，不随摄像机移动
        this.touchControls.leftButton.setDepth(1000);
      }
      
      this.touchControls.rightButton = createButtonGraphic('right') as any;
      if (this.touchControls.rightButton) {
        this.touchControls.rightButton.setPosition(margin + buttonSize * 3, screenHeight - margin - buttonSize);
        this.touchControls.rightButton.setScrollFactor(0); // 固定在屏幕上，不随摄像机移动
        this.touchControls.rightButton.setDepth(1000);
      }
      
      this.touchControls.upButton = createButtonGraphic('up') as any;
      if (this.touchControls.upButton) {
        this.touchControls.upButton.setPosition(margin + buttonSize * 2, screenHeight - margin - buttonSize * 2);
        this.touchControls.upButton.setScrollFactor(0); // 固定在屏幕上，不随摄像机移动
        this.touchControls.upButton.setDepth(1000);
      }
      
      this.touchControls.downButton = createButtonGraphic('down') as any;
      if (this.touchControls.downButton) {
        this.touchControls.downButton.setPosition(margin + buttonSize * 2, screenHeight - margin);
        this.touchControls.downButton.setScrollFactor(0); // 固定在屏幕上，不随摄像机移动
        this.touchControls.downButton.setDepth(1000);
      }
    
    // 设置触摸事件
     this.setupTouchEvents();
   }
   
   setupTouchEvents() {
     // 为每个按钮设置触摸事件
     const buttons = [
       { button: this.touchControls.leftButton, direction: 'left' },
       { button: this.touchControls.rightButton, direction: 'right' },
       { button: this.touchControls.upButton, direction: 'up' },
       { button: this.touchControls.downButton, direction: 'down' }
     ];
     
     buttons.forEach(({ button, direction }) => {
       if (button) {
         button.setInteractive();
         
         // 按下时
         button.on('pointerdown', () => {
           this.activeTouch[direction as keyof typeof this.activeTouch] = true;
           button.setTint(0x888888); // 按下时变暗
         });
         
         // 松开时
         button.on('pointerup', () => {
           this.activeTouch[direction as keyof typeof this.activeTouch] = false;
           button.clearTint(); // 恢复原色
         });
         
         // 移出按钮区域时
         button.on('pointerout', () => {
           this.activeTouch[direction as keyof typeof this.activeTouch] = false;
           button.clearTint(); // 恢复原色
         });
       }
     });
   }
  


  private createPlayer(id: string, user: User, isLocal: boolean) {
    if (this.players.has(id)) {
      return; // 玩家已存在
    }

    // 创建玩家容器
    const playerContainer = this.add.container(user.x, user.y);

    // 获取头像信息
    const avatarList = generateAvatarList();
    const avatarInfo = avatarList.find(a => a.id === user.avatar) || avatarList[0];

    // 创建头像精灵
    let avatarSprite: Phaser.GameObjects.Image;
    
    if (this.textures.exists('avatars')) {
      avatarSprite = this.add.image(0, 0, 'avatars');
      // 设置裁剪区域显示特定头像
      avatarSprite.setCrop(
        avatarInfo.spriteX,
        avatarInfo.spriteY,
        avatarInfo.width,
        avatarInfo.height
      );
      avatarSprite.setDisplaySize(32, 32);
    } else {
      // 备用方案：使用圆形
      const circle = this.add.circle(0, 0, 16, isLocal ? 0xe74c3c : 0x3498db);
      circle.setStrokeStyle(2, 0xffffff);
      avatarSprite = circle as any;
    }

    // 添加边框效果
    if (isLocal) {
      const border = this.add.circle(0, 0, 18, 0x000000, 0);
      border.setStrokeStyle(3, 0xe74c3c);
      playerContainer.add(border);
    }

    // 创建用户名标签
    const nameText = this.add.text(0, -40, user.username, {
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 4, y: 2 }
    });
    nameText.setOrigin(0.5);

    // 添加到容器
    playerContainer.add([avatarSprite, nameText]);

    // 存储玩家
    this.players.set(id, playerContainer);

    if (isLocal) {
      this.localPlayer = playerContainer;
    }
  }

  private updatePlayerPosition(userId: string, x: number, y: number) {
    const player = this.players.get(userId);
    if (player) {
      // 平滑移动
      this.tweens.add({
        targets: player,
        x: x,
        y: y,
        duration: 100,
        ease: 'Linear'
      });
    }
  }

  private removePlayer(userId: string) {
    const player = this.players.get(userId);
    if (player) {
      player.destroy();
      this.players.delete(userId);
    }
  }
}

export default GameScene;