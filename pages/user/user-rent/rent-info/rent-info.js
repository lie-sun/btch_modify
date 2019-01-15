// pages/user/user-rent/rent-info/rent-info.js
var app = getApp();
var util = require('../../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods: {}, // 产品信息
    tabs: ["出租信息", "产品参数", "配置清单", "租赁须知"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getUserRentInfo(options.id);
    
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - res.windowWidth / 4) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
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

  getUserRentInfo: function (id) {
    var that = this;
    var url = `${app.apiUrl}instrument?id=${id}`;

    util.req(url, 'GET', {}, function (data) {
      if (data.ret == 0) {
        data.body.img_url = data.body.img_url.split(",");
        that.setData({
          goods: data.body
        })
      } else {
        setTimeout(() => {
          util.toast(data.msg)
        }, 0)
      }
    }, function () {
      setTimeout(() => {
        util.toast('数据请求失败');
      }, 0)
    });
  },

  // tab
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },

  // 拨打电话
  dailPhoneNumber: function () {
    var phone = this.data.goods.mobile;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  }
})