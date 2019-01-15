// pages/select/select.js
var util = require('../../../utils/util.js');
var apiUrl = 'https://batu.bchltech.cn/BaTuMapping/app/';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chapter: [
      { id: 1, section: "模拟考试一"},
      { id: 2, section: "模拟考试二"},
      { id: 3, section: "模拟考试三"},
      { id: 4, section: "模拟考试四"},
      { id: 5, section: "模拟考试五"},
      { id: 6, section: "模拟考试六"},
      { id: 7, section: "模拟考试七"},
      { id: 8, section: "模拟考试八"},
      { id: 9, section: "模拟考试九"},
      { id: 10, section: "模拟考试十"}
    ],
    pageCount: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var url = `${apiUrl}question/count`;
    util.req(url, 'GET', {}, function(data) {
      that.setData({
        pageCount: data
      })
    },function() {
      util.req('数据请求错误')
    });
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

  randomGOTopic: function () {
    var id = Math.floor(Math.random() * 10);
    var pageShow = 0;

    wx.navigateTo({
      url: `section/section?id=${id}&pageShow=${pageShow}`,
    })
  },

  selectChapter: function (e) {
    var index = e.currentTarget.dataset.index;
    var id = this.data.chapter[index].id;
    var pageShow = 0;
    
    wx.navigateTo({
      url: `section/section?id=${id}&pageShow=${pageShow}`,
    })
  }
})