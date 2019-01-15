//index.js
//获取应用实例
var util = require('../../utils/util.js');
var apiUrl = 'https://batu.bchltech.cn/BaTuMapping/app/';
const app = getApp()

Page({
  data: {
    answerPic: ''
  },
  //事件处理函数
  bindOrderTopic: function() {
    var topic_area = wx.getStorageSync('TOPIC_AREA');
    if (topic_area) {
      wx.showModal({
        title: '温馨提示',
        content: '您上次已经做到了第' + topic_area + '题，是否继续？',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: 'order/order?area=' + topic_area
            })
          }
          if (res.cancel) {
            wx.navigateTo({
              url: 'order/order'
            })
          }
        }
      })
    } else {
      wx.navigateTo({
        url: 'order/order'
      })
    }
  },
  
  bindRandomTopic: function () {
      wx.navigateTo({
        url: 'random/random'
      })
  },

  bindSpecialTopic: function () {
    wx.navigateTo({
      url: 'special/special',
    })
  },

  bindErrorTopic: function () {
    wx.navigateTo({
      url: 'error/error',
    })
  },

  bindSimulationTopic: function () {
    wx.navigateTo({
      url: 'simulation/simulation',
    })
  },

  onLoad: function() {
    // 获取顶部图片
    var that = this;
    var url = `${apiUrl}resource/otherAds`;

    util.req(url, 'GET', {}, function(data) {
      that.setData({
        answerPic: data.ads_question_home
      });
      app.globalData.topicPic = data.ads_question_answer
    }, function() {
      util.req("请求接口失败");
    });
  }
})
