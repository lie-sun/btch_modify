// pages/quick-guide/quick-guide.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [
      '/images/quick/step_1.jpg',
      '/images/quick/step_2.jpg',
      '/images/quick/step_3.jpg'
    ],
    indicatorDots: true,
    autoplay: false,
    current: 0,
    btnChange: false
  },

  getImageIndex: function (e) {
    if (e.detail.current == this.data.imgUrls.length - 1) {
      this.setData({
        btnChange: true,
        current: e.detail.current
      })
    } else {
      this.setData({
        btnChange: false,
        current: e.detail.current
      })
    }
  },

  goNext: function () {
    var index = this.data.current + 1;
    if (index > this.data.imgUrls.length - 1) {
      return;
    }
    this.setData({
      current: index
    })
  },

  goMiniPro: function () {
    wx.switchTab({
      url: '../index/index',
    })
  },

  setContainerHeight: function (e) {
    // 图片原始宽度
    var imgWidth = 570;//e.detail.width;
    // 图片原始高度
    var imgHeight = e.detail.height;
    // 同步获取设备宽度
    var sysInfo = wx.getSystemInfoSync();
    // 获取屏幕宽度
    var screenWidth = sysInfo.screenWidth;
    // 获取屏幕和原图的比例
    var scale = screenWidth / imgWidth;
    // 设置容器的高度
    this.setData({
      height: parseInt(imgHeight * scale)
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})