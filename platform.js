// 平台管理与渲染
import { GAME_WIDTH, GAME_HEIGHT, MIN_PLATFORM_WIDTH, MAX_PLATFORM_WIDTH, PLATFORM_TYPES } from './config.js'

function randomBetween(a, b) {
  return Math.random() * (b - a) + a
}

export class Platform {
  static nextId = 0;  // 静态计数器用于生成唯一ID

  constructor(x, y, width, type = 'EASY') {
    this.id = Platform.nextId++  // 为每个平台分配唯一ID
    this.x = x
    this.y = y
    this.width = width
    this.type = type
    this.height = 40  // 增加高度
    this.hasPowerUp = false
    this.cloudOffset = Math.random() * Math.PI * 2 // 云朵飘动偏移
    this.cloudSpeed = 0.002 + Math.random() * 0.001  // 随机云朵飘动速度
  }

  render(ctx, cameraX) {
    ctx.save()
    
    // 根据难度设置云朵颜色
    switch(this.type) {
      case 'HARD':
        ctx.fillStyle = '#ffcdd2' // 浅红色云朵
        break
      case 'MEDIUM':
        ctx.fillStyle = '#fff9c4' // 浅黄色云朵
        break
      default:
        ctx.fillStyle = '#fff' // 白色云朵
    }
    
    const screenX = this.x - cameraX
    const cloudY = this.y + Math.sin(Date.now() * this.cloudSpeed + this.cloudOffset) * 5 // 增加飘动幅度

    // 绘制主云朵（增大尺寸）
    ctx.beginPath()
    ctx.arc(screenX + this.width * 0.3, cloudY + 15, this.width * 0.4, 0, Math.PI * 2)
    ctx.arc(screenX + this.width * 0.6, cloudY + 15, this.width * 0.45, 0, Math.PI * 2)
    ctx.arc(screenX + this.width * 0.15, cloudY + 20, this.width * 0.35, 0, Math.PI * 2)
    ctx.arc(screenX + this.width * 0.75, cloudY + 20, this.width * 0.35, 0, Math.PI * 2)
    ctx.fill()

    // 添加更多细节
    ctx.beginPath()
    ctx.arc(screenX + this.width * 0.45, cloudY + 10, this.width * 0.3, 0, Math.PI * 2)
    ctx.arc(screenX + this.width * 0.9, cloudY + 15, this.width * 0.25, 0, Math.PI * 2)
    ctx.fill()

    // 添加云朵阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.beginPath()
    ctx.arc(screenX + this.width * 0.3, cloudY + 18, this.width * 0.38, 0, Math.PI * 2)
    ctx.arc(screenX + this.width * 0.6, cloudY + 18, this.width * 0.43, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }
}

export class PlatformManager {
  constructor(screenWidth, screenHeight, powerUpManager) {
    this.screenWidth = screenWidth
    this.screenHeight = screenHeight
    this.platforms = []
    this.powerUpManager = powerUpManager
    this.reset()
  }

  reset() {
    this.platforms = []
    // 初始平台在游戏世界中间
    const firstWidth = randomBetween(MIN_PLATFORM_WIDTH, MAX_PLATFORM_WIDTH)
    this.platforms.push(new Platform(
      GAME_WIDTH/2 - firstWidth/2,  // 水平居中
      GAME_HEIGHT * 0.6,  // 垂直位置在60%处
      firstWidth,
      'EASY'
    ))
    // 生成第二个平台
    this.generateNext()
  }

  generateNext() {
    const last = this.platforms[this.platforms.length-1]
    const width = randomBetween(MIN_PLATFORM_WIDTH, MAX_PLATFORM_WIDTH)
    
    // 随机选择平台类型
    let type
    const rand = Math.random()
    if (rand < 0.5) {
      type = 'EASY'
    } else if (rand < 0.8) {
      type = 'MEDIUM'
    } else {
      type = 'HARD'
    }
    
    // 根据类型确定距离和高度变化
    const platformType = PLATFORM_TYPES[type]
    const distance = randomBetween(
      platformType.distance.min,
      platformType.distance.max
    )
    const heightChange = randomBetween(
      platformType.height.min,
      platformType.height.max
    )
    
    const x = last.x + distance + width/2 + last.width/2
    const y = last.y + heightChange
    
    // 确保平台不会太高或太低
    const minY = GAME_HEIGHT * 0.3
    const maxY = GAME_HEIGHT * 0.7
    
    const platform = new Platform(
      x,
      Math.min(Math.max(y, minY), maxY),
      width,
      type
    )

    this.platforms.push(platform)

    // 检查是否生成道具
    if (this.powerUpManager) {
      if (this.powerUpManager.shouldSpawnPowerUp(platform)) {
        platform.hasPowerUp = true
        // 计算道具的生成位置，确保在云朵正上方
        const powerUpX = platform.x + platform.width/2 - 20  // 居中放置
        const powerUpY = platform.y - 20  // 考虑云朵的高度
        this.powerUpManager.spawnPowerUp({
          ...platform,
          x: powerUpX,
          y: powerUpY
        })
      }
    }
  }

  update(playerX) {
    // 移除离玩家很远的平台
    this.platforms = this.platforms.filter(p => p.x + p.width > playerX - 400)
    // 保证前方有足够的平台
    while (this.platforms[this.platforms.length-1].x < playerX + 1000) {
      this.generateNext()
    }
  }

  // 获取前方第n个平台
  getPlatformAhead(n, playerX) {
    // 按x坐标排序平台
    const sortedPlatforms = this.platforms.sort((a, b) => a.x - b.x)
    // 找到当前平台的索引
    const currentIndex = sortedPlatforms.findIndex(p => p.x > playerX)
    // 返回前方第n个平台
    if (currentIndex + n < sortedPlatforms.length) {
      return sortedPlatforms[currentIndex + n]
    }
    // 如果前方平台不够，生成新的平台
    while (sortedPlatforms.length < currentIndex + n + 1) {
      this.generateNext()
    }
    return sortedPlatforms[currentIndex + n]
  }

  render(ctx, cameraX) {
    this.platforms.forEach(p => p.render(ctx, cameraX))
  }

  getLandingPlatform(playerX, playerY) {
    // 返回玩家下方最近的平台，落地判定范围收紧
    return this.platforms.find(p =>
      playerX + 25 > p.x && playerX - 25 < p.x + p.width &&
      playerY + 60 >= p.y - 5 && playerY + 60 <= p.y + 25
    )
  }
} 