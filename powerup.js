// 道具系统
export class PowerUp {
  constructor(x, y) {
    this.x = x
    this.y = y - 60  // 降低道具位置，更容易触碰
    this.width = 50  // 增加道具尺寸
    this.height = 50
    this.collected = false
    this.floatOffset = 0  // 用于悬浮动画
    this.floatSpeed = 0.05  // 悬浮速度
    this.rotation = 0  // 添加旋转效果
  }

  update() {
    // 悬浮动画
    this.floatOffset = Math.sin(Date.now() * this.floatSpeed) * 12  // 增加浮动幅度
    // 缓慢旋转
    this.rotation = (Date.now() * 0.001) % (Math.PI * 2)
  }

  render(ctx, cameraX) {
    if (this.collected) return

    ctx.save()
    const screenX = this.x - cameraX

    // 移动到道具中心点
    ctx.translate(screenX + this.width/2, this.y + this.floatOffset + this.height/2)
    ctx.rotate(this.rotation)

    // 增大飞机图标尺寸
    const scale = 1.3
    ctx.scale(scale, scale)

    // 绘制飞机图标
    // 机身
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.moveTo(-20, 0)
    ctx.lineTo(20, 0)
    ctx.lineTo(15, 8)
    ctx.lineTo(-15, 8)
    ctx.closePath()
    ctx.fill()

    // 机翼
    ctx.beginPath()
    ctx.moveTo(-10, -5)
    ctx.lineTo(10, 0)
    ctx.lineTo(-10, 5)
    ctx.closePath()
    ctx.fill()

    // 尾翼
    ctx.beginPath()
    ctx.moveTo(15, -3)
    ctx.lineTo(20, 0)
    ctx.lineTo(15, 3)
    ctx.closePath()
    ctx.fill()

    // 发光效果
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 40)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(0, 0, 40, 0, Math.PI * 2)
    ctx.fill()

    // 闪烁效果
    const glowOpacity = (Math.sin(Date.now() * 0.005) + 1) * 0.4
    ctx.strokeStyle = `rgba(255, 255, 255, ${glowOpacity})`
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(0, 0, 35, 0, Math.PI * 2)
    ctx.stroke()

    ctx.restore()
  }

  checkCollision(player) {
    if (this.collected) return false
    
    // 获取道具的实际位置（考虑浮动效果）
    const powerupY = this.y + this.floatOffset
    
    // 大幅增加碰撞检测范围
    const collisionMargin = 40
    
    // 使用更大的碰撞盒
    const powerupBox = {
      left: this.x - collisionMargin,
      right: this.x + this.width + collisionMargin,
      top: powerupY - collisionMargin,
      bottom: powerupY + this.height + collisionMargin
    }
    
    const playerBox = {
      left: player.x,
      right: player.x + player.width,
      top: player.y,
      bottom: player.y + player.height
    }
    
    // 检查玩家和道具的碰撞（更宽松的判定）
    return !(
      powerupBox.left > playerBox.right ||
      powerupBox.right < playerBox.left ||
      powerupBox.top > playerBox.bottom ||
      powerupBox.bottom < playerBox.top
    )
  }
}

export class PowerUpManager {
  constructor() {
    if (!(this instanceof PowerUpManager)) {
      throw new Error('PowerUpManager 必须使用 new 关键字实例化')
    }
    this.powerups = []
    this.spawnChance = 0.1  // 降低到10%的生成概率
    this.lastSpawnPlatformId = -1  // 记录上一次生成道具的平台ID
    this.platformsToFly = 5  // 飞行模式飞过的平台数
  }

  reset() {
    this.powerups = []
    this.lastSpawnPlatformId = -1
  }

  shouldSpawnPowerUp(platform) {
    // 确保传入了有效的平台对象
    if (!platform || typeof platform.id === 'undefined') {
      return false
    }

    // 确保同一平台不会生成多个道具
    if (platform.id === this.lastSpawnPlatformId) {
      return false
    }

    // 检查附近平台是否已有道具
    const hasNearbyPowerup = this.powerups.some(powerup => 
      Math.abs(powerup.x - (platform.x + platform.width/2)) < platform.width * 2
    )

    if (hasNearbyPowerup) {
      return false
    }

    // 10%概率生成道具
    const shouldSpawn = Math.random() < this.spawnChance
    if (shouldSpawn) {
      this.lastSpawnPlatformId = platform.id
    }
    return shouldSpawn
  }

  spawnPowerUp(platform) {
    const x = platform.x + platform.width/2 - 20  // 居中放置
    const y = platform.y  // 在平台上方
    this.powerups.push(new PowerUp(x, y))
  }

  update() {
    this.powerups.forEach(powerup => powerup.update())
  }

  render(ctx, cameraX) {
    this.powerups.forEach(powerup => powerup.render(ctx, cameraX))
  }

  checkCollisions(player) {
    for (let powerup of this.powerups) {
      if (!powerup.collected && powerup.checkCollision(player)) {
        powerup.collected = true
        return {
          collected: true,
          platformsToFly: this.platformsToFly  // 返回需要飞过的平台数
        }
      }
    }
    return {
      collected: false,
      platformsToFly: 0
    }
  }

  // 清理已收集和超出屏幕的道具
  cleanup(playerX) {
    this.powerups = this.powerups.filter(powerup => 
      !powerup.collected && powerup.x > playerX - 400
    )
  }
} 