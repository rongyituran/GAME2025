// 游戏配置常量
export const GAME_WIDTH = 750    // 游戏世界宽度
export const GAME_HEIGHT = 1334  // 游戏世界高度
export const GAME_GRAVITY = 0.4  // 重力加速度

// 平台相关配置
export const MIN_PLATFORM_WIDTH = 120  // 最小平台宽度
export const MAX_PLATFORM_WIDTH = 180 // 最大平台宽度

// 平台类型配置
export const PLATFORM_TYPES = {
  EASY: {
    distance: { min: 120, max: 180 },
    height: { min: -30, max: 30 }
  },
  MEDIUM: {
    distance: { min: 200, max: 260 },
    height: { min: -40, max: 40 }
  },
  HARD: {
    distance: { min: 280, max: 340 },
    height: { min: -50, max: 50 }
  }
} 