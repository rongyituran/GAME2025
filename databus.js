// 全局状态管理
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
    if (this.score > this.highScore) {
      this.highScore = this.score
      try {
        wx.setStorageSync('highScore', this.highScore)
      } catch (e) {
        console.error('保存最高分失败:', e)
      }
    }
  }

  loadHighScore() {
    try {
      this.highScore = wx.getStorageSync('highScore') || 0
    } catch (e) {
      console.error('加载最高分失败:', e)
      this.highScore = 0
    }
  }
} 