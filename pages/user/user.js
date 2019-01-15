// pages/user/user.js
var app = getApp();
var util = require('../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPersonalCert: false,// 是否个人认证
    enterpriseAuth: false,// 是否企业认证
    realnameAuth: false,// 个人身份认证
    phoneAuth: false,// 是否手机绑定
    userCanUse: 0,
    phone: "18303519946",
    userAvatarUrl: '',
    userNickName: '',
    userInfoFlag: true,
    isHasNetInfo: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //this.getUserCertInfo(); // 获取用户认证信息
    //this.getCanUseScore();// 获取可用权限
    this.getUserInfoCallBack();
  },

  getUserInfoCallBack: function () {
    var that = this;
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              that.setData({
                userAvatarUrl: res.userInfo.avatarUrl,
                userNickName: res.userInfo.nickName
              })

              if (that.userInfoReadyCallback) {
                that.userInfoReadyCallback(res)
              }
            }
          })
        }
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
    this.getUserCertInfo(); // 获取用户认证信息
    this.getCanUseScore();// 获取可用权限
    this.getServiceNetwork();// 判断是否有网点信息
  },

  getServiceNetwork: function () {
    var that = this;
    var url = `${app.apiUrl}serviceNetwork`;

    util.req(url, 'GET', {}, function (data) {
      if (data.ret == 0 && data.body && data.body.length != 0) {
        that.setData({
          isHasNetInfo: true
        })
      }
    }, function () {
      util.req("数据请求失败");
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

  // 获取用户认证信息
  getUserCertInfo: function () {
    var url = `${app.apiUrl}auth`;
    var that = this;

    util.req(url, 'GET', {}, function(data){
      var phoneAuth = data.body.phoneAuth,
          realnameAuth = data.body.realnameAuth,
          enterpriseAuth = data.body.enterpriseAuth;
          
      that.setData({
        realnameAuth: realnameAuth,
        phoneAuth: phoneAuth
      })

      // 个人认证
      if (phoneAuth == 1 && realnameAuth == 1) {
        that.setData({
          isPersonalCert: true
        })
      } else {
        that.setData({
          isPersonalCert: false
        })
      }
      // 企业认证
      if (enterpriseAuth == 1) {
        that.setData({
          enterpriseAuth: true
        })
      } else {
        that.setData({
          enterpriseAuth: false
        })
      }
    }, function(){
      util.toast('接口请求失败')
    });
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

  // 个人认证
  personalCert: function () {
    // if (this.data.isPersonalCert) {
    //   util.toast("您已经认证过了");
    // } else {
    //   wx.navigateTo({
    //     url: `../certification/certification?realnameAuth=${this.data.realnameAuth}&phoneAuth=${this.data.phoneAuth}`,
    //   })
    // }
    wx.navigateTo({
      url: `../certification/certification?realnameAuth=${this.data.realnameAuth}&phoneAuth=${this.data.phoneAuth}`,
    })
  },

  // 企业认证
  componyCert: function () {
    // if (this.data.enterpriseAuth) {
    //   util.toast("您已经认证过了");
    // } else {
    //   wx.navigateTo({
    //     url: `../company/company?enterpriseAuth=${this.data.enterpriseAuth}`,
    //   })
    // }
    wx.navigateTo({
      url: `../company/company?enterpriseAuth=${this.data.enterpriseAuth}`,
    })
  },

  // 拨打电话
  dailPhoneNumber: function (e) {
    var that = this;
    wx.showActionSheet({
      itemList: ['联系电话：' + that.data.phone],
      success: function (res) {
        if (res.tapIndex == 0) {
          wx.makePhoneCall({
            phoneNumber: that.data.phone,
          });
        }
      }
    })
    // wx.makePhoneCall({
    //   phoneNumber: this.data.phone
    // })
  },

  // 获取用户头像昵称
  getUserInfo: function (e) {
    var that = this;
    if (e.detail.userInfo && that.data.userInfoFlag) {
      that.setData({
        userInfoFlag: false,
        userNickName: e.detail.userInfo.nickName,
        userAvatarUrl: e.detail.userInfo.avatarUrl
      })
    } else {
      return;
    }

    var url = `${app.apiUrl}auth/nick?name=${that.data.userNickName}&img=${that.data.userAvatarUrl}`;
    util.req(url, 'PUT', {}, function(data){
      if (data.ret == 0 && data.body == 0) {
        that.setData({
          userInfoFlag: false
        })
      }
    }, function(){
      console.log("发送昵称失败");
    }, true);
  }
})