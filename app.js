//app.js
var util = require('utils/util.js');
var QQMapWX = require('utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;

App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'K4TBZ-T4562-YLRUP-CJ4XX-4YPE7-J6B3O'
    });
    //this.getUserLocation();
  },
  onShow: function () {
    this.getUserLogin();
    this.getUserLocation();
  },
  // apiUrl: 'https://batu.bchltech.cn/BaTuMapping/app/',
  apiUrl: 'http://192.168.1.131:8080/BaTuMapping/app/',
  // apiUrl2: 'https://batu.bchltech.cn/BaTuMapp/app/',
  apiUrl2: 'http://192.168.1.131:8080/BaTuMapping/app/',

  getUserLogin: function () {
    var that = this;
    wx.login({
      success: res => {
        if (res.code) {
          wx.request({
            url: `${that.apiUrl}token?code=${res.code}`,
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              var TOKEN = res.header['Set-Cookie'];
              wx.setStorage({
                key: 'TOKEN',
                data: TOKEN
              })
            },
            fail: function () {
              util.toast('接口请求失败')
            }
          })
        } else {
          util.toast('获取用户登录状态失败')
        }
      },
      fail: function() {
        util.toast('登录失败')
      }
    })
  },
  getUserLocation: function () {
    var that = this;
    wx.getSetting({
      success: (res) => {
        //用户初次进入时不同意授权(res.authSetting['scope.userLocation] = false)
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {//非初始化进入该页面,且未授权
          wx.showModal({
            title: '授权提示',
            content: '体验更多的功能，需要获取您的地理位置。请确认授权。',
            success: function (res) {
              if (res.cancel) {
                console.info("授权失败");
              }
              if (res.confirm) {
                wx.redirectTo({
                  url: '../authorized/authorized'
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {// 初次进入小程序取消授权返回undefined
          that.village_LBS();
        } else {// 初次进入已经同意授权返回true
          that.village_LBS();
        }
      }
    })
  },

  // 获取用户地理位置
  village_LBS: function () {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude;
        var longitude = res.longitude;

        that.globalData.latitude = latitude;
        that.globalData.longitude = longitude;

        that.getLocal(latitude, longitude);
      },
      fail: function (res) {
        console.log("获取地理位置失败:" + JSON.stringify(res));
      }
    })
  },

  getLocal: function (latitude, longitude) {
    var that = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (res) {
        var city = res.result.ad_info.city;
        var province = res.result.ad_info.province;
        // console.log(res);
        that.globalData.userLocation = city;
        that.globalData.userProvince = province;

        that.globalData.adderss = res.result.address;
      },
      fail: function (res) {
        console.log('定位失败' + res);
      },
      complete: function (res) {
        // console.log('定位完成' + res);
      }
    })
  },
  globalData: {
    latitude: '',
    longitude: '',
    userLocation: '',
    userProvince: '',
    tipShow: true,
    topicPic: '',
    addProxyFlag: false,
    adderss:'',//用户地址
  }
})