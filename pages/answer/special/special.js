// pages/select/select.js
var util = require('../../../utils/util.js');
var apiUrl = 'https://batu.bchltech.cn/BaTuMapping/app/';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chapter: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getChapter();
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

  getChapter: function () {
    var that = this;
    var url = `${apiUrl}question/section`;

    util.req(url, {}, 'GET', function(data) {
      that.setData({
        chapter: data
      })
    }, function() {
      util.toast("数据请求错误")
    });
  },

  selectChapter: function (e) {
    var index = e.currentTarget.dataset.index;
    var section = this.data.chapter[index].section;
    wx.navigateTo({
      url: 'section/section?section='+section,
    })
  }
})