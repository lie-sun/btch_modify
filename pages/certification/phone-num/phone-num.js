// pages/certification/phone-num/phone-num.js
var app = getApp();
var util = require("../../../utils/util.js");
var second = 60; //60秒后可重新发送验证码

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInputPhone: "", //用户输入的手机号
    sendCodeBtn: true, //发送验证码按钮显示状态
    saveBtnLoading: false, //保存loading
    saveBtnDisabled: false, //禁用保存按钮
    phoneFocus: false,
    codeFocus: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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

  // 获取用户输入的手机号
  getPhoneNum: function (e) {
    this.setData({
      userInputPhone: e.detail.value
    })
  },

  // 发送验证码
  sendCheckCode: function () {
    if (!util.fmtPhoneNumber(this.data.userInputPhone)) {
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
        sendCodeBtn: false,
        second: _second
      })
    }

    setTimeout(function() {
      that.setTimeCountDown()
    }, 1000)
  },

  sendCode: function () {
    var url = `${app.apiUrl}sms?${this.data.userInputPhone}`;
    
    util.req(url, 'GET', {}, function(data) {
      if (data.ret == 0) {
        util.toast('验证码发送成功', 'success');
      } else {
        util.toast(data.msg);
      }
    }, function(data) {
      util.toast("验证码发送失败");
    }, true);
  },

  // 提交手机号及验证码
  formSubmit: function (e) {
    var phone = e.detail.value.userPhoneNum;
    var code = e.detail.value.userPhoneCode;

    if (!util.fmtPhoneNumber(phone)) {
      return;
    }

    if (code == "") {
      util.toast('请输入有效验证码');
      return;
    }
    // 提交手机号及验证码
    this.submitPhoneAndCode(phone, code);
  },

  submitPhoneAndCode: function (phone, code) {
    var that = this;
    // show loading
    that.setData({
      saveBtnLoading: true,
      saveBtnDisabled: true
    })
    
    var url = `${app.apiUrl}auth/phone`;
    var data = {
      phone: phone,
      code: code
    };

    util.req(url, 'POST', data, function(data) {
      if (data.ret == 0) {
        util.toast(data.body, 'success');
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        util.toast(data.msg);
      }
    }, function() {
      util.toast('数据请求失败');
    }, true, function() {
      that.setData({
        saveBtnLoading: false,
        saveBtnDisabled: false
      })
    });
  },

  // 获取手机号输入框焦点
  getPhoneFocus: function () {
    this.setData({
      phoneFocus: true
    })
  },

  // 获取验证码输入框焦点
  getCodeFocus: function () {
    this.setData({
      codeFocus: true
    })
  }
})
