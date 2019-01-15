// pages/user/service-site/auth-phone/auth-phone.js
var util = require("../../../../utils/util.js");
var app = getApp();
var second = 60;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sendCodeBtn: true,
    sendCode: '发送验证码',
    company: '',
    proxy: [],
    phone: '',
    sid: '',
    code: '',
    addr: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      company: options.company,
      proxy: JSON.parse(options.proxy),
      phone: options.phone,
      sid: options.sid
    })
  },

  // 地图选择
  selectLocation: function () {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        that.setData({
          addr: res.address
        })
      }
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

  // 获取手机号
  getInputPhone: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },

  // 发送验证码
  sendCheckCode: function () {
    if (!util.fmtPhoneNumber(this.data.phone)) {
      return;
    }
    // 显示60秒倒计时按钮
    this.setData({
      sendCodeBtn: !this.data.sendCodeBtn
    })
    // 发送验证码
    this.sendCode();
    // 60秒倒计时
    this.setTimeCountDown();
  },

  // 60s倒计时
  setTimeCountDown: function () {
    var that = this;
    if (second == 0) {
      that.setData({
        sendCodeBtn: true
      })
      second = 60;
      return;
    } else {
      var _second = second--;
      that.setData({
        sendCodeDisabled: false,
        second: _second
      })
    }

    setTimeout(function () {
      that.setTimeCountDown()
    }, 1000)
  },

  sendCode: function () {
    var url = `${app.apiUrl}sms?${this.data.phone}`;

    util.req(url, 'GET', {}, function (data) {
      if (data.ret == 0) {
        setTimeout(() => {
          util.toast('发送成功', 'success');
        }, 0);
      } else {
        setTimeout(() => {
          util.toast(data.msg);
        }, 0)
      }
    }, function (data) {
      util.toast("发送失败");
    }, true);
  },

  getInputCode: function (e) {
    this.setData({
      code: e.detail.value
    })
  },

  submitPhoneAuth: function () {
    var that = this;
    if (!that.data.addr) {
      util.toast("请添加公司地址");
      return;
    }

    if (!that.data.code) {
      util.toast("请输入验证码");
      return;
    }

    var url = `${app.apiUrl}serviceNetwork/phone`;
    var data = {
      phone: that.data.phone,
      code: that.data.code,
      sid: that.data.sid,
      addr: that.data.addr
    };

    util.req(url, 'PUT', data, function(data) {
      if (data.ret == 0) {
        setTimeout(() => {
          util.toast(data.body, 'success');
          that.setData({
            code: ''
          })
        }, 0);
      } else {
        setTimeout(() => {
          util.toast(data.msg)
        }, 0)
      }
    }, function() {
      util.toast("数据请求失败");
    });
  }
})