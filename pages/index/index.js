//index.js
//获取应用实例

var util = require('../../utils/util.js');
var app = getApp();

Page({
  data: {
    imgUrls:[],
    subImgs: [],
    defaultImg: '../../images/index/error.jpg',
    circular: true,//衔接滑动
    autoplay: true,//自动切换
    indicatorDots: true,//显示指示点
    phone: '18303519946',
    goTopIcon: true,
    scrollTop: 0,
    height: 0
  },

  onLoad: function () {
    this.getSwiperImages();
    this.getHomeImages();
  },

  onShow: function () {
    app.globalData.tipShow = true;
  },

  onReady: function () {
    
  },

  // 转发分享
  onShareAppMessage: function () {

  },

  // 获取轮播图
  getSwiperImages: function () {
    var that = this;
    var url = `${app.apiUrl}resource/scrollImages`;
    util.req(url, 'GET', {}, function(data) {
      that.setData({
        imgUrls: data
      })
    }, function () {
      util.toast('接口请求失败')
    })
  },

  // 底部图片
  getHomeImages: function () {
    var that = this;
    var url = `${app.apiUrl}resource/ads/home`;
    util.req(url, 'GET', {}, function (data) {
      that.setData({
        subImgs: data
      })
    }, function () {
      util.toast('接口请求失败')
    })
  },

  setContainerHeight: function (e) {
    // 图片原始宽度
    var imgWidth = e.detail.width;
    // 图片原始高度
    var imgHeight = e.detail.height;
    // 同步获取设备宽度
    var sysInfo = wx.getSystemInfoSync();
    // 获取屏幕宽度
    var screenWidth = sysInfo.screenWidth;
    // 获取屏幕和原图的比例
    var scale = screenWidth / imgWidth;
    // 设置容器的高度
    this.setData({
      height: parseInt(imgHeight * scale)
    })
  },
  // 图片加载错误替换默认图片
  errorMsg: function (e) {
    if (e.type == "error") {
      console.log("图片加载失败");
      var errorImgIndex = e.currentTarget.dataset.errorimg;//获取错误图片循环的下标
      var imgList = this.data.imgUrls;//将图片列表数据绑定到变量
      imgList[errorImgIndex] = this.data.defaultImg;//错误图片替换为默认图片
      this.setData({
        imgUrls: imgList
      })
    }
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

  onPageScroll: function (e) {
    if (e.scrollTop > 50) {
      this.setData({
        goTopIcon: false
      })
    } else {
      this.setData({
        goTopIcon: true
      })
    }
  },

  goTop: function () {
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  }
})
