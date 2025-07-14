// 特效系统
class Particle {
  constructor(x, y, color, velocity, life = 60) {
    this.x = x
    this.y = y
    this.color = color
    this.vx = velocity.x
    this.vy = velocity.y
    this.alpha = 1
    this.life = life
    this.maxLife = life
    this.size = 4
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    this.vy += 0.1 // 重力
    this.life--
    this.alpha = this.life / this.maxLife
    return this.life > 0
  }

  render(ctx, cameraX = 0) {
    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x - cameraX, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

export default class EffectSystem {
  constructor() {
    this.colors = ['#ffeb3b', '#ffc107', '#ff9800', '#ff5722']
    this.reset()
  }

  reset() {
    this.particles = []
  }

  addLandingEffect(x, y) {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12
      const speed = 2 + Math.random() * 2
      const velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed - 2
      }
      const color = this.colors[Math.floor(Math.random() * this.colors.length)]
      this.particles.push(new Particle(x, y, color, velocity))
    }
  }

  addJumpEffect(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.PI + (Math.PI * i) / 8
      const speed = 1 + Math.random()
      const velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      }
      const color = this.colors[Math.floor(Math.random() * this.colors.length)]
      this.particles.push(new Particle(x, y, color, velocity))
    }
  }

  addFlightEffect(x, y) {
    if (Math.random() < 0.3) { // 控制粒子生成频率
      const velocity = {
        x: -2 - Math.random() * 2,
        y: (Math.random() - 0.5) * 2
      }
      const color = this.colors[Math.floor(Math.random() * this.colors.length)]
      this.particles.push(new Particle(x, y, color, velocity))
    }
  }

  update() {
    this.particles = this.particles.filter(p => p.update())
  }

  render(ctx, cameraX) {
    this.particles.forEach(p => p.render(ctx, cameraX))
  }
} 