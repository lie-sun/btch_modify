// pages/company/company.js
var util = require('../../utils/util.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPersonPicker: true,
    personIndex: 0,
    personRange: [],
    isTradePicker: true,
    tradeIndex: 0,
    trade: [],
    isPositionPicker: true,
    positionIndex: 0,
    position: [],
    loading: false,
    disabled: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCompanyInfo();
  },

  getCompanyInfo: function () {
    var that = this;
    var url = `${app.apiUrl}selector/enterprise`;

    util.req(url, 'GET', {}, function(data) {
      that.setData({
        personRange: data.scale,
        trade: data.industry,
        position: data.work
      })
    }, function() {
      util.toast("数据请求失败");
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

  // 信息选择
  pickerChange: function (e) {
    var id = e.target.dataset.id;
    switch (id) {
      case "1":
        this.setData({
          isPersonPicker: false,
          personIndex: e.detail.value
        })
        break;
      case "2":
        this.setData({
          isTradePicker: false,
          tradeIndex: e.detail.value
        })
        break;
      case "3":
        this.setData({
          isPositionPicker: false,
          positionIndex: e.detail.value
        })
        break;
      default:
        break;
    }
  },

  formSubmit: function (e) {
    var that = this;
    var obj = e.detail.value;
    if (obj.companyName == "") {
      util.toast('请填写单位名称');
      return;
    }
    if (obj.personRange === 0) {
      util.toast('请选择人员规模');
      return;
    }
    if (obj.trade === 0) {
      util.toast('请选择行业');
      return;
    }
    if (obj.position === 0) {
      util.toast('请选择职务');
      return;
    }
    // 提交
    var url = `${app.apiUrl}auth/enterprise`;
    var data = {
      company: obj.companyName,
      scale: that.data.personRange[obj.personRange],
      trade: that.data.trade[obj.trade],
      work: that.data.position[obj.position]
    };

    that.setData({
      loading: true,
      disabled: true
    })
    util.req(url, 'POST', data, function(data) {
      if (data.ret == 0) {
        util.toast(data.body, 'success');
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        util.toast(data.msg)
      }
    }, function() {
      util.toast(data.msg)
    }, true, function() {
      that.setData({
        loading: false,
        disabled: false
      })
    });
  },
})