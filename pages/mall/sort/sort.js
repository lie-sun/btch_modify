// pages/mall/sort/sort.js
var util = require('../../../utils/util.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sort: [],
    activeIndex: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getSortList();
  },

  getSortList: function () {
    var that = this;
    var url = `${app.apiUrl}index/type`;
    util.req(url, 'GET', {}, function (data) {
      that.setData({
        sort: data
      })
    }, function () {
      util.toast('接口请求失败')
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

  bindProductType: function (e) {
    var index = e.currentTarget.dataset.index;
    var type = this.data.sort[index].name;
  
    this.setData({
      activeIndex: index
    })
    
    wx.navigateTo({
      url: '../list/list?type=' + type,
    })
  }
})