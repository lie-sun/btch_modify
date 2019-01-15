// pages/user/user-hire/user-hire.js
var app = getApp();
var util = require('../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    myHire: [],
    flag: false
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
    this.getOurHireInfo();
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

  getOurHireInfo: function () {
    var that = this;
    var url = `${app.apiUrl}instrument/upload`;
    util.req(url, 'GET', {}, function (data) {
      for (var i = 0; i < data.length; i++) {
        data[i].img_url = data[i].img_url.split(',');
        data[i].date_end = data[i].date_end.split('.')[0];
      }
      that.setData({
        myHire: data,
        flag: true
      })
    }, function () {
      setTimeout(() => {
        util.toast("数据请求失败")
      }, 0)
    });
  },

  hireProductInfo: function (e) {
    var id = e.currentTarget.dataset.goodsid;
    wx.navigateTo({
      url: 'hire-info/hire-info?id='+id,
    })
  },
  
  switchChange: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var i = e.currentTarget.dataset.index;
    var status = e.detail.value ? 24 : -1;
    var url = `${app.apiUrl}instrument/status?id=${id}&status=${status}`;

    util.req(url, 'PUT', {}, function(data){
      if (data.ret == 0){
        setTimeout(() => {
          util.toast(data.body, 'success')
        }, 0)

        var hireStatus = "myHire["+ i + "].status";

        that.setData({
          [hireStatus]: status
        })
      } else {
        setTimeout(() => {
          util.toast(data.msg)
        }, 0)
      }
    }, function(){
      setTimeout(() => {
        util.toast('数据请求失败')
      }, 0)
    });

    // 改变对象数组中的属性值
    // var i = e.currentTarget.dataset.index;
    // var status = "myHire["+ i + "].status";
    // var value = e.detail.value;

    // this.setData({
    //   [status]: value
    // })
  },

  goToHire: function () {
    wx.navigateTo({
      url: '/pages/hire/hire'
    })
  }
})