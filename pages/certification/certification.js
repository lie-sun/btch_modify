// pages/certification/certification.js
var util = require("../../utils/util.js");
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isUserCertStr: '',
    isPhoneCertStr: '',
    isUserCert: false,
    isPhoneCert: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //this.checkCertInfo(options);
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
    this.getUserCertInfo();
  },

  // 获取用户认证信息
  getUserCertInfo: function () {
    var url = `${app.apiUrl}auth`;
    var that = this;

    util.req(url, 'GET', {}, function (data) {
      // 判断是否认证
      that.checkCertInfo(data.body);
    }, function () {
      util.toast('接口请求失败')
    });
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
  
  },

  checkCertInfo: function (options) {
    var isCert = parseInt(options.realnameAuth);
    var isPhoneCert = parseInt(options.phoneAuth);

    if (isCert == 1) {
      this.setData({
        isUserCertStr: '已认证',
        isUserCert: true
      })
    } else if (isCert == -1){
      this.setData({
        isUserCertStr: '未认证',
        isUserCert: false
      })
    } else if (isCert == 0) {
      this.setData({
        isUserCertStr: '待审核',
        isUserCert: false
      })
    }

    if (isPhoneCert == 1) {
      this.setData({
        isPhoneCertStr: '已绑定',
        isPhoneCert: true
      })
    } else if (isPhoneCert == -1){
      this.setData({
        isPhoneCertStr: '未绑定',
        isPhoneCert: false
      })
    } else if (isPhoneCert == 0) {
      this.setData({
        isPhoneCertStr: '待审核',
        isPhoneCert: false
      })
    }
  },

  bindPhoneNum: function () {
    // if (this.data.isPhoneCert) {
    //   util.toast("您已经绑定过了手机号");
    // } else {
    //   wx.navigateTo({
    //     url: 'phone-num/phone-num',
    //   })
    // }

    wx.navigateTo({
      url: 'phone-num/phone-num',
    })
  },

  bindCert: function () {
    // if (this.data.isUserCert) {
    //   util.toast("您已经身份认证了")
    // } else {
    //   wx.navigateTo({
    //     url: '../auth/auth',
    //   })
    // }

    wx.navigateTo({
      url: '../auth/auth',
    })
  }
})