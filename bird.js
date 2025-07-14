// 小鸟装饰
const BIRD_COLORS = ['#e57373','#f06292','#ba68c8','#64b5f6','#4db6ac','#ffd54f','#ff8a65','#a1887f']

class Bird {
  constructor(x, y, color, speed) {
    this.x = x
    this.y = y
    this.color = color
    this.speed = speed
  }
  update(screenWidth) {
    this.x += this.speed
    if (this.x > screenWidth + 40) this.x = -40
  }
  render(ctx, cameraX) {
    ctx.save()
    ctx.translate(this.x - cameraX, this.y)
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.ellipse(0, 0, 18, 10, 0, 0, Math.PI*2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(12, 0, 5, 0, Math.PI*2)
    ctx.fill()
    ctx.restore()
  }
}

export class BirdManager {
  constructor(screenWidth, screenHeight) {
    this.screenWidth = screenWidth
    this.screenHeight = screenHeight
    this.reset()
  }

  reset() {
    this.birds = []
    for(let i=0;i<8;i++) {
      this.birds.push(new Bird(
        Math.random()*this.screenWidth,
        80+Math.random()*120,
        BIRD_COLORS[i],
        0.6+Math.random()*0.7
      ))
    }
  }

  update() {
    this.birds.forEach(b=>b.update(this.screenWidth))
  }

  render(ctx, cameraX) {
    this.birds.forEach(b=>b.render(ctx, cameraX))
  }
} 