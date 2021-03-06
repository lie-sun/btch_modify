// pages/rent/rent-detail/rent-detail.js
var util = require('../../../utils/util.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsID: null, // 当前商品信息
    goodsInfo: [],
    tabs: ["产品参数", "配置清单","性能指数"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    height: 0,
    loading: false,
    disabled: false,
    loadError: true,
    productID: '',
    indicatorDots: true,
    phoneStr: 0,
    checkboxItems: [
      { name: '送货', value: '0', checked: true },
      { name: '自取', value: '1' }
    ],
    rentBoxWrap: false,
    rentCount: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      productID: options.id
    })
    // 获取产品信息
    // that.getProductInfo(options.id);
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
    this.getProductInfo(this.data.productID);
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

  getProductInfo: function (id) {
    var that = this;
    var url = `${app.apiUrl}instrument?id=${id}`;

    util.req(url, 'GET', {}, function(data){
      if (data.ret == 0) {
        data.body.img_url = data.body.img_url.split(",");
        data.body.date_end = data.body.date_end.split(".")[0];
        data.body.deposit = parseInt(data.body.deposit);
        if (data.body.configures) {
          data.body.configures = util.fmtConfig(data.body.configures);
        }
        if (data.body.parameters) {
          data.body.parameters = util.fmtConfig(data.body.parameters);
        }

        that.setData({
          goodsInfo: data.body,
          phoneStr: data.body.mobile
        })
      } else {
        setTimeout(()=>{
          util.toast(data.msg)
        },0)
      }
    }, function(){
      setTimeout(() => {
        util.toast('数据请求失败');
      }, 0)
    });
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

  // 查看联系方式
  viewContactInfo: function () {
    var that = this;
    var phoneStr = that.data.goodsInfo.mobile;

    if (phoneStr.length > 5) {
      wx.makePhoneCall({
        phoneNumber: phoneStr
      })
      return;
    }

    if (phoneStr.length < 5) {
      var url = `${app.apiUrl}instrument/own?id=${that.data.goodsInfo.productID}`;
      that.setData({
        loading: true,
        disabled: true
      })
      util.req(url, 'POST', {}, function(data) {
        if (data.ret == 0) {
          var phone = data.body;
          // util.toast(data.body, 'success');
          // 扣除积分成功
          wx.navigateTo({
            url: '../points/points?phone='+phone,
          })
        } else {
          //util.toast(data.msg);
          // 扣除积分失败
          wx.navigateTo({
            url: '../fail/fail?errorMsg='+data.msg
          })
        }
      }, function() {
        util.toast("数据请求失败")
      }, true, function() {
        that.setData({
          loading: false,
          disabled: false
        })
      });
    }
  },

  bindRent: function() {
    this.setData({
      rentBoxWrap: true
    })
  },

  bindMaskClick: function() {
    this.setData({
      rentBoxWrap: false
    })
  },

  bindRentConfirm: function() {
    this.setData({
      rentBoxWrap: false
    })
  },

  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value);

    var checkboxItems = this.data.checkboxItems, values = e.detail.value;
    for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
      checkboxItems[i].checked = false;

      for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (checkboxItems[i].value == values[j]) {
          checkboxItems[i].checked = true;
          break;
        }
      }
    }

    this.setData({
      checkboxItems: checkboxItems
    });
  },

  bindRentCountReduce: function() {
    var rentCount = this.data.rentCount;
    rentCount--;
    if (rentCount < 1) {
      this.setData({
        rentCount: 1
      })
    } else {
      this.setData({
        rentCount: rentCount
      })
    }
  },

  bindRentCountAdd: function () {
    var rentCount = this.data.rentCount;
    rentCount++;
    this.setData({
      rentCount: rentCount
    })
  }
})