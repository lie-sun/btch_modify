// pages/user/user-rent/user-rent.js
var app = getApp();
var util = require('../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    myRent: [],
    // 点击的产品信息
    selectedProdcutInfo: {},
    flag: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOurRentInfo();
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
  
  },

  getOurRentInfo: function () {
    var that = this;
    var url = `${app.apiUrl}instrument/own`;
    util.req(url, 'GET', {}, function(data) {
      // for (var i = 0; i < data.length; i++) {
      //   data[i].img = data[i].img.split(',');
      // }
      that.setData({
        myRent: data,
        flag: true
      })
    }, function() {
      setTimeout(()=>{
        util.toast("数据请求失败")
      },0)
    });
  },

  // 我的租赁详情
  rentProductInfo: function (e) {
    var _this = this;
    var goodsId = e.currentTarget.dataset.goodsid;
    wx.navigateTo({
      url: 'rent-info/rent-info?id='+goodsId,
    })
  },
  goToRent: function () {
    wx.reLaunch({
      url: '/pages/rent/rent',
    })
  }
})