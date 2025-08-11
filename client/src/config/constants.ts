// 服务器配置
export const SERVER_CONFIG = {
  URL: 'http://localhost:3301',
  RECONNECTION_ATTEMPTS: 5,
  RECONNECTION_DELAY: 1000
};

// 游戏配置
export const GAME_CONFIG = {
  WIDTH: window.innerWidth,
  HEIGHT: window.innerHeight,
  BACKGROUND_COLOR: '#2c3e50',
  PHYSICS: {
    GRAVITY: { x: 0, y: 0 },
    DEBUG: false
  }
};

// 房间配置
export const ROOM_CONFIG = {
  MAX_USERS: 4,
  DEFAULT_POSITION: {
    x: 400,
    y: 300
  }
};

// WebRTC配置
export const WEBRTC_CONFIG = {
  MEDIA_CONSTRAINTS: {
    video: true,
    audio: true
  },
  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};

// UI配置
export const UI_CONFIG = {
  VIDEO_ELEMENT_CLASS: 'video-element',
  LOCAL_VIDEO_CLASS: 'video-element local-video'
};