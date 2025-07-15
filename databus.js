// 全局状态管理
import WxAdapter from './wx-adapter.js'
export default class DataBus {
  constructor() {
    this.reset()
    this.loadHighScore()
  }
  reset() {
    this.score = 0
    this.combo = 0
    this.gameOver = false
    this.flightMode = false
    this.flightDistance = 0
    this.flightModeTipTimer = 0 // 飞行模式提示计时
    this.flightEndWarning = false // 飞行模式即将结束警告
    this.flightEndWarningTimer = 0 // 警告计时器
  }

  saveHighScore() {
    try {
      WxAdapter.setStorageSync('highScore', this.highScore)
    } catch (e) {}
  }

  loadHighScore() {
    try {
      // 兼容微信和Web
      const score = WxAdapter.getStorageSync('highScore')
      this.highScore = score ? parseInt(score) : 0
    } catch (e) {
      this.highScore = 0
    }
  }
} 