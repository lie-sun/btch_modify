// pages/user/service-site/get-auth/get-auth.js
var util = require("../../../../utils/util.js");
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    phoneAuth: -1,
    proxyAuth: -1,
    companyAuth: -1,
    service: {
      name: '',
      proxy: '',
      phone: '',
      sid: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var sid = 'service.sid';
    this.setData({
      [sid]: options.sid
    })
    // this.checkAuth(options.sid);
  },

  checkAuth: function(sid) {
    var that = this;
    var url = `${app.apiUrl}serviceNetwork?sid=${sid}`;

    util.req(url, 'GET', {}, function(data) {
      if (data.ret == 0) {
        var name = 'service.name',
            proxy = 'service.proxy',
            phone = 'service.phone',
            status = 'service.status';
        var proxyFactory = [];

        for (var i = 0; i < data.body.proxy.length; i++) {
          proxyFactory.push(data.body.proxy[i].product);
        }

        for (var j = 0; j < data.body.proxy.length; j++) {
          if (data.body.proxy[j].qualAuth == 24) {
            that.setData({
              proxyAuth: 24
            })
            break;
          } else {
            that.setData({
              proxyAuth: 0
            })
          }
        }
            
        that.setData({
          phoneAuth: data.body.phoneAuth,
          companyAuth: data.body.licenseAuth,
          [name]: data.body.company,
          [proxy]: proxyFactory,
          [phone]: data.body.phone,
          [status]: data.body.status
        })
      } else {
        setTimeout(() => {
          util.toast(data.msg);
        }, 0)
      }
    }, function() {
      setTimeout(() => {
        util.toast("数据请求失败");
      }, 0)
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
    this.checkAuth(this.data.service.sid);
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
    return {
      title: '自定义转发标题',
      path: '/page/user?id=123',
      imageUrl: ''
    }
  },

  goPhoneAuth: function () {
    var phone = this.data.service.status > 0 ? this.data.service.phone : "";
    var proxy = JSON.stringify(this.data.service.proxy);

    wx.navigateTo({
      url: `../auth-phone/auth-phone?company=${this.data.service.name}&proxy=${proxy}&phone=${phone}&sid=${this.data.service.sid}`
    })
  },

  goProxyAuth: function () {
    var proxy = JSON.stringify(this.data.service.proxy);
    wx.navigateTo({
      url: `../auth-proxy/auth-proxy?company=${this.data.service.name}&proxy=${proxy}&phone=${this.data.service.phone}&sid=${this.data.service.sid}`
    })
  },

  goCompanyAuth: function () {
    var proxy = JSON.stringify(this.data.service.proxy);
    wx.navigateTo({
      url: `../auth-company/auth-company?company=${this.data.service.name}&proxy=${proxy}&phone=${this.data.service.phone}&sid=${this.data.service.sid}`
    })
  }
})