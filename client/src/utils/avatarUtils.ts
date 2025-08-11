// 头像工具类
export interface AvatarInfo {
  id: string;
  name: string;
  spriteX: number;
  spriteY: number;
  width: number;
  height: number;
}

// 头像配置 - 9个头像在3x3网格中排列，总图片1024x1024
export const AVATAR_CONFIG = {
  SPRITE_SHEET: '/images/openart-image_aBhEYcGQ_1754888267179_raw.png',
  AVATAR_SIZE: Math.floor(1024 / 3), // 每个头像约341x341像素
  GRID_COLS: 3,
  GRID_ROWS: 3
};

// 生成头像信息数组
export const generateAvatarList = (): AvatarInfo[] => {
  const avatars: AvatarInfo[] = [];
  const { AVATAR_SIZE, GRID_COLS, GRID_ROWS } = AVATAR_CONFIG;
  
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const index = row * GRID_COLS + col;
      avatars.push({
        id: `avatar_${index + 1}`,
        name: `头像 ${index + 1}`,
        spriteX: col * AVATAR_SIZE,
        spriteY: row * AVATAR_SIZE,
        width: AVATAR_SIZE,
        height: AVATAR_SIZE
      });
    }
  }
  
  return avatars;
};

// 获取头像的CSS背景位置
export const getAvatarBackgroundPosition = (avatar: AvatarInfo): string => {
  return `-${avatar.spriteX}px -${avatar.spriteY}px`;
};

// 获取头像的CSS样式（用于游戏场景，使用原始尺寸）
export const getAvatarStyle = (avatar: AvatarInfo) => {
  return {
    backgroundImage: `url(${AVATAR_CONFIG.SPRITE_SHEET})`,
    backgroundPosition: getAvatarBackgroundPosition(avatar),
    backgroundSize: `${AVATAR_CONFIG.GRID_COLS * AVATAR_CONFIG.AVATAR_SIZE}px ${AVATAR_CONFIG.GRID_ROWS * AVATAR_CONFIG.AVATAR_SIZE}px`,
    width: `${avatar.width}px`,
    height: `${avatar.height}px`,
    backgroundRepeat: 'no-repeat'
  };
};

// 获取头像的CSS样式（用于选择器，使用较小的显示尺寸）
export const getAvatarSelectorStyle = (avatar: AvatarInfo, displaySize: number = 64) => {
  const scale = displaySize / AVATAR_CONFIG.AVATAR_SIZE;
  return {
    backgroundImage: `url(${AVATAR_CONFIG.SPRITE_SHEET})`,
    backgroundPosition: `-${avatar.spriteX * scale}px -${avatar.spriteY * scale}px`,
    backgroundSize: `${AVATAR_CONFIG.GRID_COLS * AVATAR_CONFIG.AVATAR_SIZE * scale}px ${AVATAR_CONFIG.GRID_ROWS * AVATAR_CONFIG.AVATAR_SIZE * scale}px`,
    width: `${displaySize}px`,
    height: `${displaySize}px`,
    backgroundRepeat: 'no-repeat'
  };
};