// pages/select/subject/subject.js
var util = require('../../../../utils/util.js');
var apiUrl = 'https://batu.bchltech.cn/BaTuMapping/app/';
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    subject: [],
    topicCount: 0,
    $index: 0,
    txt: '下一题',
    prev: '上一题',
    flag: false,
    disabled: false,
    panelShow: true,
    currentTopic: 1,
    topicPic: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      topicPic: app.globalData.topicPic
    })
    // 获取题目
    this.getErrorTopic();
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

  selectTopic: function () {
    this.setData({
      panelShow: false,
      currentTopic: this.data.$index
    })
  },

  closeSelectPanel: function () {
    this.setData({
      panelShow: true
    })
  },

  selectToTopic: function (e) {
    var index = e.currentTarget.dataset.index;
    if (index == this.data.subject.length - 1) {
      this.setData({
        txt: '返回',
        $index: index,
        panelShow: true
      })
    } else {
      this.setData({
        $index: index,
        panelShow: true,
        txt: '下一题'
      })
    }
  },

  goPrevTopic: function () {
    var index = this.data.$index - 1;
    if (index < 0) {
      wx.navigateBack()
    }
    this.setData({
      $index: index,
      txt: '下一题'
    })
  },

  goNextTopic: function () {
    this.setData({
      prev: '上一题'
    })
    var index = this.data.$index + 1;
    if (index > this.data.subject.length - 1) {
      wx.navigateBack()
      return;
    }
    if (index == this.data.subject.length - 1) {
      this.setData({
        $index: index,
        txt: '返回'
      })
      return;
    }

    if (!this.data.backAnswer) {
      this.setData({
        $index: index,
        flag: false
      })
    } else {
      this.setData({
        $index: index,
        flag: true
      })
    }
  },

  getErrorTopic: function () {
    var that = this;
    wx.getStorage({
      key: 'error_topic',
      success: function (res) {
        that.setData({
          subject: res.data,
          topicCount: res.data.length
        })
      },
    })
  }
})