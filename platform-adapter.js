// 平台适配器，兼容微信小游戏和Web
const isWeixinGame = typeof wx !== 'undefined' && !!wx.getSystemInfoSync;

const PlatformAdapter = {
  getSystemInfo() {
    if (isWeixinGame) {
      return wx.getSystemInfoSync();
    } else {
      return {
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight
      };
    }
  },
  createCanvas() {
    if (isWeixinGame) {
      return wx.createCanvas();
    } else {
      let canvas = document.getElementById('gameCanvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'gameCanvas';
        document.body.appendChild(canvas);
      }
      return canvas;
    }
  },
  onTouchStart(cb) {
    if (isWeixinGame) {
      wx.onTouchStart(cb);
    } else {
      const canvas = document.getElementById('gameCanvas');
      canvas.addEventListener('touchstart', cb);
      canvas.addEventListener('mousedown', cb);
    }
  },
  onTouchEnd(cb) {
    if (isWeixinGame) {
      wx.onTouchEnd(cb);
    } else {
      const canvas = document.getElementById('gameCanvas');
      canvas.addEventListener('touchend', cb);
      canvas.addEventListener('mouseup', cb);
    }
  }
};

export default PlatformAdapter; 