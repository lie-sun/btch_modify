// pages/mall/main.js
var util = require('../../utils/util.js');
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
    this.getProductInfo();
  },

  getProductInfo: function () {
    var that = this;
    var userProvince = app.globalData.userProvince.replace('省', '');
    // var userLocation = app.globalData.userLocation.replace('市', '');

    var url = `${app.apiUrl}serviceNetwork/store/instrument/index?page=1&pageshow=2&province=${userProvince}&city=${userProvince}`;
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

  bindProductDetail: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    
    wx.navigateTo({
      url: `detail/detail?id=${id}`,
    })
  },

  bindProductType: function (e) {
    var index = e.currentTarget.dataset.index;
    var type = this.data.product[index].type;

    this.setData({
      activeIndex: index
    })

    wx.navigateTo({
      url: 'list/list?type=' + type,
    })
  },

  bindGoServiceNet: function () {
    wx.navigateTo({
      url: '/pages/user/service-site/service-site',
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

  bindSortList: function () {
    wx.navigateTo({
      url: 'sort/sort',
    })
  }
})