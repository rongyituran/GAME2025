// UI渲染
import { GAME_WIDTH, GAME_HEIGHT } from './config.js'
import WxAdapter from './wx-adapter.js'

export default class GameUI {
  constructor(databus) {
    this.databus = databus
    // 获取屏幕信息
    const systemInfo = wx.getSystemInfoSync()
    this.screenWidth = systemInfo.windowWidth
    this.screenHeight = systemInfo.windowHeight
  }

  render(ctx) {
    ctx.save()
    
    // 设置文字样式
    ctx.fillStyle = '#fff'
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 3
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.font = '24px Arial'
    
    // 添加文字阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2

    // 分数
    const scoreText = `分数: ${this.databus.score}`
    ctx.strokeText(scoreText, 20, 20)
    ctx.fillText(scoreText, 20, 20)

    // 最高分
    const highScoreText = `最高分: ${this.databus.highScore}`
    ctx.strokeText(highScoreText, 20, 50)
    ctx.fillText(highScoreText, 20, 50)

    // 连跳
    if (this.databus.combo > 1) {
      const comboText = `连跳: ${this.databus.combo}`
      ctx.strokeText(comboText, 20, 80)
      ctx.fillText(comboText, 20, 80)
    }

    // 飞行模式提示
    if (this.databus.flightMode) {
      ctx.textAlign = 'center'
      ctx.font = '28px Arial'
      let text = '飞行模式!'
      
      if (this.databus.flightEndWarning) {
        if (Math.floor(Date.now() / 200) % 2 === 0) {
          text = '即将结束!'
        }
      }
      
      const x = this.screenWidth / 2
      const y = 100
      ctx.strokeText(text, x, y)
      ctx.fillText(text, x, y)
    }

    // 游戏结束界面
    if (this.databus.gameOver) {
      this.renderGameOver(ctx)
    }

    ctx.restore()
  }

  renderGameOver(ctx) {
    // 半透明黑色背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, 0, this.screenWidth, this.screenHeight)

    // 重置阴影
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    const centerX = this.screenWidth / 2
    const centerY = this.screenHeight / 2

    // 游戏结束标题
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = 'bold 36px Arial'
    ctx.fillText('游戏结束', centerX, centerY - 100)

    // 分数显示
    ctx.font = '28px Arial'
    ctx.fillText(`最终分数: ${this.databus.score}`, centerX, centerY - 20)
    ctx.fillText(`最高分: ${this.databus.highScore}`, centerX, centerY + 20)

    // 重新开始提示
    ctx.font = '24px Arial'
    ctx.fillText('点击屏幕重新开始', centerX, centerY + 80)

    // 添加装饰性元素
    this.drawGameOverDecorations(ctx, centerX, centerY)
  }

  drawGameOverDecorations(ctx, centerX, centerY) {
    // 绘制装饰性圆圈
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(centerX, centerY - 100, 100, 0, Math.PI * 2)
    ctx.stroke()

    // 绘制星星
    const starCount = 5
    const radius = 80
    for (let i = 0; i < starCount; i++) {
      const angle = (i / starCount) * Math.PI * 2
      const x = centerX + Math.cos(angle) * radius
      const y = (centerY - 100) + Math.sin(angle) * radius
      this.drawStar(ctx, x, y, 10, '#fff')
    }
  }

  drawStar(ctx, x, y, size, color) {
    ctx.save()
    ctx.fillStyle = color
    ctx.beginPath()
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2
      const length = i % 2 === 0 ? size : size / 2
      const pointX = x + Math.cos(angle) * length
      const pointY = y + Math.sin(angle) * length
      if (i === 0) {
        ctx.moveTo(pointX, pointY)
      } else {
        ctx.lineTo(pointX, pointY)
      }
    }
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
} 