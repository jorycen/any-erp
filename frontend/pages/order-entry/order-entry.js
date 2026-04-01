const app = getApp()

Page({
  data: {
    pnCode: '',
    snCode: '',
    productInfo: null,
    customerName: '',
    customerPhone: '',
    subsidyAmount: 0,
    finalAmount: 0
  },

  async onPNInput(e) {
    const pn = e.detail.value
    this.setData({ pnCode: pn })
    if (pn.length >= 6) {
      this.fetchProductInfo(pn)
    }
  },

  fetchProductInfo(pn) {
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${app.globalData.baseUrl}/inventory/products/${pn}`,
      header: { 'Authorization': `Bearer ${token}` },
      success: (res) => {
        if (res.data.success) {
          const product = res.data.data
          // 计算本地预览补贴 (15% off)
          const discount = product.BASE_PRICE * 0.15
          const subsidy = product.CATEGORY_ID === 1 ? Math.min(discount, 1500) : Math.min(discount, 500)
          
          this.setData({
            productInfo: { ...product, subsidy: subsidy.toFixed(2) },
            subsidyAmount: subsidy.toFixed(2),
            finalAmount: (product.BASE_PRICE - subsidy).toFixed(2)
          })
        }
      }
    })
  },

  async onSNInput(e) {
    const sn = e.detail.value
    this.setData({ snCode: sn })
    if (sn.length >= 8) {
      this.fetchSNStatus(sn)
    }
  },

  fetchSNStatus(sn) {
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${app.globalData.baseUrl}/inventory/sns/${sn}`,
      header: { 'Authorization': `Bearer ${token}` },
      success: (res) => {
        if (res.data.success) {
          if (res.data.data.STATUS !== 1) {
            wx.showModal({ title: 'SN 状态异常', content: '该码已售或不在库，请核实', showCancel: false })
          }
        }
      }
    })
  },

  scanPN() {
    wx.scanCode({ success: (res) => { this.setData({ pnCode: res.result }); this.fetchProductInfo(res.result) } })
  },

  scanSN() {
    wx.scanCode({ success: (res) => { this.setData({ snCode: res.result }); this.fetchSNStatus(res.result) } })
  },

  onCustomerNameInput(e) { this.setData({ customerName: e.detail.value }) },
  onCustomerPhoneInput(e) { this.setData({ customerPhone: e.detail.value }) },

  async submitOrder() {
    const { pnCode, snCode, productInfo, customerName, customerPhone } = this.data
    const token = wx.getStorageSync('token')

    wx.showLoading({ title: '正在开单...' })

    wx.request({
      url: `${app.globalData.baseUrl}/orders`,
      method: 'POST',
      header: { 'Authorization': `Bearer ${token}` },
      data: {
        customerName,
        customerPhone,
        items: [{
          pnCode: pnCode,
          snCode: snCode,
          categoryId: productInfo.CATEGORY_ID,
          price: productInfo.BASE_PRICE
        }]
      },
      success: (res) => {
        if (res.data.success) {
          wx.showToast({ title: '开单成功' })
          setTimeout(() => { wx.navigateBack() }, 1500)
        } else {
          wx.showModal({ title: '开单失败', content: res.data.message })
        }
      },
      complete: () => { wx.hideLoading() }
    })
  }
})
