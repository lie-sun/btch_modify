// pages/user/user-account/user-account.js
var util = require('../../../utils/util.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    clickType: 1,
    payList: [],
    scoreInfo: [],
    payIndex: 0,
    userCanUse: 0,// 可用权限
    payConsumeRecord: [] // 充值消费记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取充值积分类型
    this.getPayScoreList();
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
    this.getCanUseScore();
  },

  // 获取可用权限
  getCanUseScore: function () {
    var that = this;
    var url = `${app.apiUrl}user/score`;
    util.req(url, 'GET', {}, function (data) {
      if (data.ret == 0) {
        if (!!data.body) {
          that.setData({
            userCanUse: data.body.scoreFree
          })
        }
      } else {
        setTimeout(() => {
          util.toast(data.msg)
        }, 0)
      }
    }, function () {
      setTimeout(() => {
        util.toast("数据请求失败")
      }, 0)
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

  bindTip: function (e) {
    this.setData({
      clickType: e.currentTarget.dataset.id
    })
  },

  bindRecord: function (e) {
    var that = this;
    that.setData({
      clickType: e.currentTarget.dataset.id
    })
    var url = `${app.apiUrl}user/score/detail`;
    util.req(url, 'GET', {}, function(data){
      for (var i = 0; i < data.body.length; i++) {
        data.body[i].date = data.body[i].date.split('.')[0];
      }
      if (data.ret == 0) {
        that.setData({
          payConsumeRecord: data.body
        })
      } else {
        setTimeout(() => {
          util.toast(data.msg);
        }, 0);
      }
    }, function(){
      setTimeout(() => {
        util.toast('数据请求失败');
      }, 0);
    });
  },

  // 立即充值
  getPayScoreList: function () {
    var that = this;
    var url = `${app.apiUrl}pay/score`;
    util.req(url, 'GET', {}, function(data) {
      if (data.ret == 0) {
        data = data.body;
        var paymentList = [];
        for (var i = 0; i < data.length; i++) {
          data[i].amount = parseInt(data[i].amount);
          paymentList.push("充值"+data[i].amount+"元获得"+data[i].score+"BT");
        }

        that.setData({
          payList: paymentList,
          scoreInfo: data
        })
      } else {
        setTimeout(() => {
          util.toast(data.msg);
        }, 0)
      }
    }, function(){
      setTimeout(() => {
        util.toast("数据请求失败");
      }, 0)
    });
  },

  pickerChange: function (e) {
    var that = this;
    var suid = that.data.scoreInfo[e.detail.value].suid;
    var url = `${app.apiUrl}/pay/wechat?suid=${suid}`;

    util.req(url, 'POST', {}, function(data) {
      if (data.ret == 0) {
        wx.requestPayment({
          timeStamp: data.body.timeStamp,
          nonceStr: data.body.nonceStr,
          package: data.body.package,
          signType: 'MD5',
          paySign: data.body.paySign,
          success: function (res) {
            if (res.errMsg != "requestPayment:ok") {
              util.toast('调用支付失败');
            }
          },
          fail: function () {
            console.log('调用支付失败');
          }
        })
      } else {
        util.toast(data.msg);
      }
    }, function() {
      util.toast("数据请求失败")
    });
  }
})