// pages/mall/list/list.js
var util = require('../../../utils/util.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    product: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var type = options.type;
    wx.setNavigationBarTitle({
      title: type
    })
    this.getProductInfo(type);
  },

  getProductInfo: function(type) {
    var that = this;
    var url = `${app.apiUrl}serviceNetwork/store/instrument?type=${type}`;
    util.req(url, 'GET', {}, function (data) {
      if (data.ret == 0) {
        that.setData({
          product: data.body
        })
      } else {
        util.toast(data.msg);
      }
    }, function () {
      util.toast('接口请求失败')
    })
  },

  bindProductDetail: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;

    wx.navigateTo({
      url: `../detail/detail?id=${id}`,
    })
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

  
})