// 微信小游戏与Web平台兼容适配器
const isWeixinGame = typeof wx !== 'undefined' && !!wx.getSystemInfoSync;

const WxAdapter = {
  getStorageSync(key) {
    if (isWeixinGame) {
      return wx.getStorageSync(key);
    } else {
      return localStorage.getItem(key);
    }
  },
  setStorageSync(key, value) {
    if (isWeixinGame) {
      wx.setStorageSync(key, value);
    } else {
      localStorage.setItem(key, value);
    }
  },
  vibrateShort() {
    if (isWeixinGame) {
      wx.vibrateShort();
    } else if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }
};

export default WxAdapter; 