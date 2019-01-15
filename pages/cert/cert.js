// pages/cert/cert.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  goCertPage: function() {
    wx.navigateTo({
      url: '/pages/certification/certification',
    })
  },

  goBackRent: function() {
    wx.navigateBack({})
  }
})