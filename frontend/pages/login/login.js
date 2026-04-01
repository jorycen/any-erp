const app = getApp()

Page({
  data: {
    username: '',
    password: '',
    loading: false
  },

  onUserInput(e) {
    this.setData({ username: e.detail.value })
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },

  async handleLogin() {
    const { username, password } = this.data
    if (!username || !password) {
      wx.showToast({ title: '请输入账号密码', icon: 'none' })
      return
    }

    this.setData({ loading: true })
    wx.showLoading({ title: '登录中...' })

    wx.request({
      url: `${app.globalData.baseUrl}/auth/login`,
      method: 'POST',
      data: { username, password },
      success: (res) => {
        if (res.data.success) {
          wx.setStorageSync('token', res.data.data.token)
          wx.setStorageSync('user', res.data.data.user)
          wx.showToast({ title: '登录成功' })
          
          setTimeout(() => {
            wx.switchTab({ url: '/pages/home/home' })
          }, 1000)
        } else {
          wx.showModal({
            title: '登录失败',
            content: res.data.message || '用户名或密码错误',
            showCancel: false
          })
        }
      },
      fail: (err) => {
        wx.showToast({ title: '网络请求失败', icon: 'none' })
      },
      complete: () => {
        this.setData({ loading: false })
        wx.hideLoading()
      }
    })
  }
})
