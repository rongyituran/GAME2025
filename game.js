// 微信小游戏主入口
import { GAME_WIDTH, GAME_HEIGHT, GAME_GRAVITY } from './config.js'
import DataBus from './databus.js'
import GameUI from './ui.js'
import { PlatformManager } from './platform.js'
import Player from './player.js'
import { BirdManager } from './bird.js'
import AudioManager from './audio.js'
import EffectSystem from './effects.js'
import { PowerUpManager } from './powerup.js'

// 初始化画布
const systemInfo = wx.getSystemInfoSync()
const screenWidth = systemInfo.windowWidth
const screenHeight = systemInfo.windowHeight

// 计算游戏缩放比例和偏移量
const GAME_SCALE = Math.min(screenWidth / GAME_WIDTH, screenHeight / GAME_HEIGHT)
const SCALED_WIDTH = GAME_WIDTH * GAME_SCALE
const SCALED_HEIGHT = GAME_HEIGHT * GAME_SCALE
const offsetX = (screenWidth - SCALED_WIDTH) / 2
const offsetY = (screenHeight - SCALED_HEIGHT) / 2

export default class Game {
  constructor() {
    // 创建画布
    this.canvas = wx.createCanvas()
    this.canvas.width = screenWidth
    this.canvas.height = screenHeight
    this.ctx = this.canvas.getContext('2d')
    
    // 初始化游戏状态
    this.databus = new DataBus()
    this.audioManager = new AudioManager()
    this.effectSystem = new EffectSystem()
    this.powerUpManager = new PowerUpManager()
    this.platformManager = new PlatformManager(screenWidth, screenHeight, this.powerUpManager)
    this.player = new Player(this.platformManager.platforms[0], this.databus)
    this.birdManager = new BirdManager()
    this.ui = new GameUI(this.databus)
    
    // 设置触摸事件
    this.bindTouchEvents()
    
    // 开始游戏循环
    this.loop()

    this.isFlying = false
    this.remainingPlatformsToFly = 0
    this.flyingStartPlatform = null
  }

  // 应用游戏世界到屏幕的坐标转换
  applyGameTransform() {
    this.ctx.save()
    this.ctx.translate(offsetX, offsetY)
    this.ctx.scale(GAME_SCALE, GAME_SCALE)
  }

  // 恢复画布状态
  restoreGameTransform() {
    this.ctx.restore()
  }

  update() {
    if (this.databus.gameOver) return
    
    // 更新游戏对象
    this.player.update()
    this.platformManager.update(this.player.x)
    this.birdManager.update()
    this.powerUpManager.update()
    this.effectSystem.update()
    
    // 检查道具碰撞
    const powerupResult = this.powerUpManager.checkCollisions(this.player)
    if (powerupResult.collected) {
      if (this.audioManager.enabled) {
        this.audioManager.playPowerup()
      }
      
      // 获取当前平台
      const currentPlatform = this.platformManager.getLandingPlatform(this.player.x, this.player.y)
      if (currentPlatform) {
        this.isFlying = true
        this.remainingPlatformsToFly = powerupResult.platformsToFly
        this.flyingStartPlatform = currentPlatform
        currentPlatform.hasPowerUp = false
        
        // 设置玩家位置和状态
        this.player.y = currentPlatform.y - 100  // 设置初始飞行高度
        this.player.startFlying()
      }
    }
    
    // 检查玩家是否落地
    if (this.player.state === 'fall') {
      const platform = this.platformManager.getLandingPlatform(this.player.x, this.player.y)
      if (platform) {
        this.player.land(platform)
        if (this.audioManager.enabled) {
          this.audioManager.playLand()
        }
      }
    }
    
    // 处理飞行模式
    if (this.isFlying && this.flyingStartPlatform) {
      // 自动向前移动
      this.player.x += 8
      this.player.y = this.flyingStartPlatform.y - 100 // 保持固定高度

      // 检查是否经过了足够的平台
      const platformsPassed = this.getPlatformsPassed(this.flyingStartPlatform)
      if (platformsPassed >= this.remainingPlatformsToFly) {
        this.isFlying = false
        this.flyingStartPlatform = null
        this.player.stopFlying()
      }
    }
    
    // 检查游戏结束条件
    if (this.player.y > GAME_HEIGHT) {
      this.databus.gameOver = true
      if (this.audioManager.enabled) {
        this.audioManager.playGameOver()
      }
    }
  }

  render() {
    // 清空画布
    this.ctx.clearRect(0, 0, screenWidth, screenHeight)
    
    // 绘制渐变背景
    const gradient = this.ctx.createLinearGradient(0, 0, 0, screenHeight)
    gradient.addColorStop(0, '#87CEEB')  // 天空蓝
    gradient.addColorStop(1, '#E0F7FA')  // 浅蓝色
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, screenWidth, screenHeight)

    // 绘制装饰性云朵背景
    this.drawBackgroundClouds()
    
    // 应用游戏世界变换
    this.applyGameTransform()
    
    // 计算相机位置
    const cameraX = Math.max(0, this.player.x - GAME_WIDTH * 0.3)
    
    // 绘制游戏元素
    this.platformManager.render(this.ctx, cameraX)
    this.birdManager.render(this.ctx, cameraX)
    this.powerUpManager.render(this.ctx, cameraX)
    this.player.render(this.ctx, cameraX)
    this.effectSystem.render(this.ctx, cameraX)
    
    // 恢复画布状态
    this.restoreGameTransform()
    
    // 绘制UI(使用屏幕坐标)
    this.ui.render(this.ctx)
  }

  drawBackgroundClouds() {
    const time = Date.now() * 0.0002
    this.ctx.save()
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    
    // 第一层远景云
    for (let i = 0; i < 5; i++) {
      const x = ((time * 10 + i * 200) % screenWidth) - 100
      const y = 100 + i * 120
      this.drawDecoCloud(x, y, 80)
    }
    
    // 第二层近景云
    for (let i = 0; i < 3; i++) {
      const x = ((time * 20 + i * 300) % screenWidth) - 150
      const y = 200 + i * 150
      this.drawDecoCloud(x, y, 120)
    }
    
    this.ctx.restore()
  }

  drawDecoCloud(x, y, size) {
    this.ctx.beginPath()
    this.ctx.arc(x, y, size * 0.5, 0, Math.PI * 2)
    this.ctx.arc(x + size * 0.4, y - size * 0.1, size * 0.3, 0, Math.PI * 2)
    this.ctx.arc(x + size * 0.8, y, size * 0.4, 0, Math.PI * 2)
    this.ctx.arc(x + size * 0.4, y + size * 0.1, size * 0.3, 0, Math.PI * 2)
    this.ctx.fill()
  }

  loop() {
    this.update()
    this.render()
    requestAnimationFrame(this.loop.bind(this))
  }

  bindTouchEvents() {
    wx.onTouchStart(e => {
      if (this.databus.gameOver) {
        this.databus.reset()
        this.platformManager.reset()
        this.player.reset(this.platformManager.platforms[0])
        return
      }
      
      this.player.startCharge()
    })
    
    wx.onTouchEnd(e => {
      if (!this.databus.gameOver) {
        this.player.endCharge()
        this.audioManager.playJump()
      }
    })
  }

  reset() {
    this.isFlying = false
    this.remainingPlatformsToFly = 0
    this.flyingStartPlatform = null
  }

  getCurrentPlatform() {
    return this.platformManager.platforms.find(platform => 
      this.player.x >= platform.x && 
      this.player.x <= platform.x + platform.width
    )
  }

  getPlatformsPassed(startPlatform) {
    let count = 0
    let foundStart = false

    for (const platform of this.platformManager.platforms) {
      if (platform === startPlatform) {
        foundStart = true
      } else if (foundStart && platform.x > startPlatform.x) {
        count++
      }
    }

    return count
  }
}

// 启动游戏
let game = new Game() 