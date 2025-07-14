// 玩家角色
import { GAME_GRAVITY } from './config.js'

const PLAYER_SIZE = 100
const JUMP_COEF = 0.003
const MAX_CHARGE = 1500
const FLIGHT_SPEED = 6
const AIR_RESISTANCE = 0.99
const MAX_HORIZONTAL_SPEED = 12
const MAX_VERTICAL_SPEED = 15

export default class Player {
  constructor(platform, databus) {
    this.databus = databus
    this.reset(platform)
    this.animationFrame = 0
    this.animationTimer = 0
    this.facingRight = true
    this.isFlying = false
  }
  reset(platform) {
    this.x = platform.x + platform.width/2 - PLAYER_SIZE/2
    this.y = platform.y - PLAYER_SIZE
    this.vx = 0
    this.vy = 0
    this.state = 'stand' // stand, charge, jump, fall
    this.chargeStart = 0
    this.chargeTime = 0
    this.chargePercent = 0
    this.facingRight = true
  }
  startCharge() {
    if (this.state === 'stand') {
      this.state = 'charge'
      this.chargeStart = Date.now()
      this.chargePercent = 0
    }
  }
  endCharge() {
    if (this.state === 'charge') {
      this.chargeTime = Math.min(Date.now() - this.chargeStart, MAX_CHARGE)
      this.chargePercent = this.chargeTime / MAX_CHARGE
      const power = this.chargeTime * JUMP_COEF
      
      const powerMultiplier = Math.pow(this.chargePercent, 1.2)
      this.vx = Math.min(power * 10 * powerMultiplier, MAX_HORIZONTAL_SPEED)
      this.vy = -Math.min(power * 12 * powerMultiplier, MAX_VERTICAL_SPEED)
      
      this.state = 'jump'
      this.facingRight = true
    }
  }
  startFlying() {
    this.isFlying = true
    this.state = 'flying'
    this.vx = 0
    this.vy = 0
  }
  stopFlying() {
    this.isFlying = false
    this.state = 'fall'
    this.vx = 0
    this.vy = 0
  }
  update() {
    // 更新动画计时器
    this.animationTimer++
    if (this.animationTimer >= 5) {
      this.animationTimer = 0
      this.animationFrame = (this.animationFrame + 1) % 4
    }

    if (this.isFlying) {
      // 飞行模式下不受重力影响
      return
    }

    // 根据状态更新
    switch (this.state) {
      case 'charging':
        // 蓄力时保持静止
        this.vx = 0
        this.vy = 0
        break
        
      case 'jump':
      case 'fall':
        // 应用重力
        this.vx *= AIR_RESISTANCE
        this.vx = Math.min(Math.max(this.vx, -MAX_HORIZONTAL_SPEED), MAX_HORIZONTAL_SPEED)
        this.vy = Math.min(Math.max(this.vy, -MAX_VERTICAL_SPEED), MAX_VERTICAL_SPEED)
        
        this.x += this.vx
        this.y += this.vy
        this.vy += GAME_GRAVITY
        if (this.vy > 0) this.state = 'fall'
        break
        
      case 'stand':
        // 静止状态
        this.vx = 0
        this.vy = 0
        break
    }
  }
  land(platform) {
    this.state = 'stand'
    this.vx = 0
    this.vy = 0
    this.x = platform.x + platform.width/2 - PLAYER_SIZE/2
    this.y = platform.y - PLAYER_SIZE
    this.databus.score += 100
    this.databus.combo = (this.databus.combo || 0) + 1
  }
  render(ctx, cameraX) {
    ctx.save()
    const screenX = this.x - cameraX

    // 如果在飞行状态，添加特效
    if (this.state === 'flying') {
      // 速度线
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(screenX - 30, this.y + PLAYER_SIZE/2)
      ctx.lineTo(screenX, this.y + PLAYER_SIZE/2)
      ctx.stroke()
    }

    // 绘制蓄力条
    if (this.state === 'charge') {
      const chargeTime = Date.now() - this.chargeStart
      const chargePercent = Math.min(chargeTime / MAX_CHARGE, 1)
      
      // 蓄力条背景
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillRect(screenX, this.y - 20, PLAYER_SIZE, 10)
      
      // 蓄力条边框
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.strokeRect(screenX, this.y - 20, PLAYER_SIZE, 10)
      
      // 根据蓄力程度改变颜色
      let chargeColor
      if (chargePercent < 0.3) {
        chargeColor = '#4CAF50'  // 绿色
      } else if (chargePercent < 0.6) {
        chargeColor = '#FFC107'  // 黄色
      } else if (chargePercent < 0.9) {
        chargeColor = '#FF9800'  // 橙色
      } else {
        chargeColor = '#F44336'  // 红色
      }
      
      // 绘制渐变蓄力条
      const gradient = ctx.createLinearGradient(screenX, 0, screenX + PLAYER_SIZE * chargePercent, 0)
      gradient.addColorStop(0, chargeColor)
      gradient.addColorStop(1, '#fff')
      
      ctx.fillStyle = gradient
      ctx.fillRect(screenX, this.y - 20, PLAYER_SIZE * chargePercent, 10)
      
      // 添加发光效果
      ctx.shadowColor = chargeColor
      ctx.shadowBlur = 10
      ctx.strokeStyle = chargeColor
      ctx.strokeRect(screenX, this.y - 20, PLAYER_SIZE * chargePercent, 10)
      ctx.shadowBlur = 0
    }

    // 绘制小兔子
    ctx.translate(screenX + PLAYER_SIZE/2, this.y + PLAYER_SIZE/2)
    if (!this.facingRight) {
      ctx.scale(-1, 1)
    }
    ctx.translate(-PLAYER_SIZE/2, -PLAYER_SIZE/2)

    // 绘制阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.beginPath()
    ctx.ellipse(PLAYER_SIZE/2, PLAYER_SIZE/2 + 35, 40, 10, 0, 0, Math.PI * 2)
    ctx.fill()

    // 身体（椭圆）
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.ellipse(PLAYER_SIZE/2, PLAYER_SIZE/2 + 20, 45, 35, 0, 0, Math.PI * 2)
    ctx.fill()

    // 头部（圆形）
    ctx.beginPath()
    ctx.arc(PLAYER_SIZE/2, PLAYER_SIZE/2 - 10, 35, 0, Math.PI * 2)
    ctx.fill()

    // 耳朵
    const earWiggle = Math.sin(this.animationFrame * 0.5) * 4
    ctx.fillStyle = '#fff'
    // 左耳
    ctx.beginPath()
    ctx.ellipse(PLAYER_SIZE/2 - 15, PLAYER_SIZE/2 - 40 + earWiggle, 10, 25, -0.2, 0, Math.PI * 2)
    ctx.fill()
    // 右耳
    ctx.beginPath()
    ctx.ellipse(PLAYER_SIZE/2 + 15, PLAYER_SIZE/2 - 40 - earWiggle, 10, 25, 0.2, 0, Math.PI * 2)
    ctx.fill()

    // 耳朵内部
    ctx.fillStyle = '#ffcdd2'
    ctx.beginPath()
    ctx.ellipse(PLAYER_SIZE/2 - 15, PLAYER_SIZE/2 - 40 + earWiggle, 6, 20, -0.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(PLAYER_SIZE/2 + 15, PLAYER_SIZE/2 - 40 - earWiggle, 6, 20, 0.2, 0, Math.PI * 2)
    ctx.fill()

    // 眼睛
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(PLAYER_SIZE/2 - 15, PLAYER_SIZE/2 - 15, 5, 0, Math.PI * 2)
    ctx.arc(PLAYER_SIZE/2 + 15, PLAYER_SIZE/2 - 15, 5, 0, Math.PI * 2)
    ctx.fill()

    // 眼睛高光
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(PLAYER_SIZE/2 - 16, PLAYER_SIZE/2 - 16, 2, 0, Math.PI * 2)
    ctx.arc(PLAYER_SIZE/2 + 14, PLAYER_SIZE/2 - 16, 2, 0, Math.PI * 2)
    ctx.fill()

    // 鼻子
    ctx.fillStyle = '#ffb6c1'
    ctx.beginPath()
    ctx.ellipse(PLAYER_SIZE/2, PLAYER_SIZE/2 - 8, 7, 5, 0, 0, Math.PI * 2)
    ctx.fill()

    // 腮红
    ctx.fillStyle = 'rgba(255, 182, 193, 0.5)'
    ctx.beginPath()
    ctx.arc(PLAYER_SIZE/2 - 25, PLAYER_SIZE/2 - 5, 10, 0, Math.PI * 2)
    ctx.arc(PLAYER_SIZE/2 + 25, PLAYER_SIZE/2 - 5, 10, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }
} 