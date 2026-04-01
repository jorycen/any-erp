App({
  onLaunch() {
    // 初始化微信云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-8glwjlnq4c74f7f1', // 您提供的环境 ID
        traceUser: true,
      })
    }

    // 检查登录状态
    const token = wx.getStorageSync('token')
    if (!token) {
      wx.reLaunch({
        url: '/pages/login/login',
      })
    }
  },
  globalData: {
    userInfo: null,
    // 云托管服务的基础路径 (部署后请修改为实际生成的公网域名或内部服务名)
    baseUrl: 'https://ainuoyun-erp-xxxxxxxx-cloud1-8glwjlnq4c74f7f1.service.tcloudbase.com/api/v1'
  }
})
