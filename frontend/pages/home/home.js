const app = getApp()

Page({
  data: {
    todaySales: 0,
    monthlyCommission: '0.00',
    pendingVouchers: 0,
    lowStockCount: 0
  },

  async onShow() {
    this.checkLoginStatus()
    this.loadStats()
  },

  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    if (!token) {
      wx.reLaunch({ url: '/pages/login/login' })
    }
  },

  async loadStats() {
    const token = wx.getStorageSync('token')
    if (!token) return

    // 1. 获取并展示统计概要 (来自已实现的 /stats/my-performance)
    wx.request({
      url: `${app.globalData.baseUrl}/stats/my-performance`,
      header: { 'Authorization': `Bearer ${token}` },
      success: (res) => {
        if (res.data.success) {
          const { summary, list } = res.data.data
          const today = new Date().toISOString().split('T')[0]
          const todayOrders = list.filter(o => o.CREATE_TIME.startsWith(today)).length

          this.setData({
            todaySales: todayOrders,
            monthlyCommission: summary.totalCommission.toFixed(2),
            pendingVouchers: 0 // 后续逻辑完善
          })
        }
      }
    })
  },

  navToOrder() {
    wx.navigateTo({ url: '/pages/order-entry/order-entry' })
  },

  navToInventory() {
    wx.navigateTo({ url: '/pages/inventory/inventory' })
  },

  navToStockIn() {
    wx.showToast({ title: '采购功能仅限经理级使用', icon: 'none' })
    // 如果角色符合可以跳转
  },

  navToStats() {
    wx.switchTab({ url: '/pages/stats/stats' })
  }
})
