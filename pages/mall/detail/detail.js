// pages/rent/rent-detail/rent-detail.js
var util = require('../../../utils/util.js');
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
var app = getApp();
var id = '';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: ["产品信息", "产品参数", "配置清单", "购买须知"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    product: [],
    productID: '',
    showFlag: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      productID: options.id
    });
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'K4TBZ-T4562-YLRUP-CJ4XX-4YPE7-J6B3O'
    });
    // 获取产品信息
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - res.windowWidth / 4) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
  },

  getProductDetail: function () {
    var that = this;
    var userProvince = app.globalData.userProvince.replace('省','');
    var userLocation = app.globalData.userLocation.replace('市', '');

    var url = `${app.apiUrl}serviceNetwork/store/instrument/${that.data.productID}?province=${userProvince}&city=${userLocation}`;

    util.req(url, 'GET', {}, function (data) {
      if (data.ret == 0) {
        that.setData({
          product: data.body,
          showFlag: true
        })
      } else {
        util.toast(data.msg)
      }
    }, function () {
      util.toast('接口请求失败')
    })
  },

  goServiceNet: function () {
    wx.navigateTo({
      url: '/pages/user/service-site/service-site',
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
    this.getProductDetail();
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

  imageLoadError: function () {
    console.log("图片加载失败");
    this.setData({
      loadError: false
    })
  },

  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },

  getUserLocation: function (address) {
    // 调用接口
    qqmapsdk.geocoder({
      address: address,
      success: function (res) {
        var latitude = res.result.location.lat;
        var longitude = res.result.location.lng;

        wx.openLocation({
          latitude: latitude,
          longitude: longitude,
        })
      },
      fail: function (res) {
        util.toast("地理位置获取失败");
      }
    });
  },

  goToAddress: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var service = that.data.product.services;
    var address = service[index].addr;

    that.getUserLocation(address);

    // if (service[index].payScore == 0) {
    //   // 已经支付过BT
    //   return;
    // } else {
    //   // 未支付BT
    //   wx.showModal({
    //     title: '温馨提示',
    //     content: '查看服务网点联系人的手机号或地址需要消耗1BT，是否继续？',
    //     success: res => {
    //       if (res.confirm) {
    //         // 发送至后台
    //         var userId = service[index].sid;
    //         var url = `${app.apiUrl}serviceNetwork/own?id=${userId}`;

    //         util.req(url, 'POST', {}, function (data) {
    //           if (data.ret == 0) {
    //             var phone = "service[" + index + "].phone";
    //             var addr = "service[" + index + "].addr";

    //             that.setData({
    //               [phone]: data.body.phone,
    //               [addr]: data.body.addr,
    //             });

    //             wx.navigateTo({
    //               url: `/pages/user/service-site/points/points?result=1`
    //             })
    //           } else {
    //             wx.navigateTo({
    //               url: `/pages/user/service-site/points/points?msg=${data.msg}&result=0`
    //             })
    //           }
    //         }, function () {
    //           util.toast("数据提交失败");
    //         });
    //       }

    //       if (res.cancel) {
    //         return;
    //       }
    //     }
    //   })
    // }
  },

  bingDailTel: function (e) {
    // 查看电话号码
    var that = this;
    var service = this.data.product.services;

    if (service[e.currentTarget.dataset.id].payScore == 0) {
      wx.makePhoneCall({
        phoneNumber: service[e.currentTarget.dataset.id].phone,
      });
      return;
    }

    wx.showModal({
      title: '温馨提示',
      content: '查看服务网点联系人的手机号需要消耗1BT，是否继续？',
      success: res => {
        if (res.confirm) {
          // 发送至后台
          var userId = service[e.currentTarget.dataset.id].sid;
          var url = `${app.apiUrl}serviceNetwork/own?id=${userId}`;

          util.req(url, 'POST', {}, function (data) {
            if (data.ret == 0) {
              var phone = "service[" + e.currentTarget.dataset.id + "].phone";
              var addr = "service[" + e.currentTarget.dataset.id + "].addr";

              that.setData({
                [phone]: data.body,
                [addr]: data.body,
              });

              wx.navigateTo({
                url: `/pages/user/service-site/points/points?result=1`
              })
            } else {
              wx.navigateTo({
                url: `/pages/user/service-site/points/points?msg=${data.msg}&result=0`
              })
            }
          }, function () {
            util.toast("数据提交失败");
          });
        }

        if (res.cancel) {
          return;
        }
      }
    })
  }
})