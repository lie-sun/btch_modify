// pages/user/service-site/service-site.js
var city = require("../../../utils/const.js");
var citys = require("../../../utils/area.js");
var util = require("../../../utils/util.js");
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
var app = getApp();
var list = [];

Page({

  /**
   * 页面的初始数据
   */
  data: {
    city: '',
    province: '',
    multiIndex: [0, 0],
    multiIndexs: [0, 0],
    isCityPicker: true,
    authFlag: false,
    multiArray: city.provinceArray,
    objectMultiArray: city.cityArray,
    multiArrays: citys.provinceArray,
    objectMultiArrays: citys.cityArray,
    factory: [],
    areas: '',
    factoryIndex: 0,
    isFactoryPicker: true,
    isAreasPicker: true,
    service: [],
    cityDisabled: true,
    isHasData: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'K4TBZ-T4562-YLRUP-CJ4XX-4YPE7-J6B3O'
    });
    this.isGetUserLocation();
  },

  getCityNetSite: function () {
    var that = this;
    var city = this.data.city == "全部" ? " " : this.data.city.replace("市", "");
    var province = this.data.province.replace("省","");
    var url = `${app.apiUrl}serviceNetwork/brands?province=${province}&city=${city}`;

    util.req(url, 'GET', {}, function (data) {
      if (data.ret == 0) {
        var factoryArr = [];
        if (data.body.length != 0) {
          for (var i =0; i < data.body.length; i++) {
            factoryArr.push(data.body[i].product);
          }
          factoryArr.unshift("全部");
          that.setData({
            factory: factoryArr,
            isFactoryPicker: false,
          })
          // 获取服务网点列表
          that.getNetSiteList();
        } else {
          // 没有厂家
          var factory = that.data.factory;
          factory.push("全部");
          that.setData({
            factory: factory,
            isFactoryPicker: true,
          })
          that.getNetSiteList();
        }
      }
    }, function () {
      util.toast("数据请求失败");
    });
  },

  getNetSiteList: function () {
    var that = this;
    var city = this.data.city == "全部" ? " " : this.data.city.replace("市", "");
    var province = this.data.province.replace("省", "");
    // var factory = this.data.factory[this.data.factoryIndex] != "全部" ? this.data.factory[this.data.factoryIndex] : "";
    // var areas = this.data.areas == "" ? "" : this.data.areas;
    var url = `${app.apiUrl}serviceNetwork/list?city=${city}&province=${province}`;

    util.req(url, 'GET', {}, function(data) {
      if (data.ret == 0) {
        that.setData({
          service: data.body,
          isHasData: true
        })
      } else {
        setTimeout(() => {
          util.toast(data.msg);
        }, 0)
      }
    }, function() {
      util.toast("数据请求失败");
    });
  },

  isGetUserLocation: function () {
    var userLocation = app.globalData.userLocation;
    var userProvince = app.globalData.userProvince;

    if (userLocation && userProvince) {
      this.setData({
        city: userLocation,
        province: userProvince
      });
    } else {
      this.getServerLocation();
    }
  },

  getServerLocation: function () {
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
                that.setData({
                  authFlag: true
                })
              } else if (res.confirm) {
                wx.redirectTo({
                  url: '../../authorized/authorized'
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
        var province = res.result.ad_info.province;
        var city = res.result.ad_info.city;
        if (!!city) {
          that.setData({
            city: city,
            province: province
          })
          // 获取城市网点
          // that.getCityNetSite();
        } else {
          that.setData({
            city: app.globalData.userLocation
          })
        }
      },
      fail: function (res) {
        console.log('定位失败' + res);
      },
      complete: function (res) {
        console.log('定位完成' + res);
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
    // 获取城市网点
    // this.getCityNetSite();
    this.getNetSiteList();
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

  selectProvince: function () {
    if (this.data.cityDisabled) {
      util.toast("请重新选择省份");
      return;
    }
  },

  multiPickerColumnChange: function (e) {
    var that = this;
    switch (e.detail.column) {
      case 0:
        list = []
        for (var i = 0; i < that.data.objectMultiArrays.length; i++) {
          if (that.data.objectMultiArrays[i].parid == that.data.objectMultiArrays[e.detail.value].regid) {
            list.push(that.data.objectMultiArrays[i].regname)
          }
        }
        that.setData({
          "multiArrays[1]": list,
          "multiIndexs[0]": e.detail.value,
          "multiIndexs[1]": 0
        })
    }
  },

  pickerChange: function (e) {
    var that = this;
    var id = e.target.dataset.id;
    switch (id) {
      case "1":
        list = []
        for (var i = 0; i < that.data.objectMultiArray.length; i++) {
          if (that.data.objectMultiArray[i].parid == that.data.objectMultiArray[e.detail.value].regid) {
            list.push(that.data.objectMultiArray[i].regname)
          }
        }
        that.setData({
          isCityPicker: false,
          cityDisabled: false,
          isAreasPicker: true,
          areas: '',
          "multiArray[1]": list,
          "multiIndex[0]": e.detail.value,
          "multiIndex[1]": 0
        });

        that.getPickerProvince();
        break;
      case "2":
        that.setData({
          isCityPicker: false,
          isAreasPicker: true,
          areas: '',
          "multiIndex[1]": e.detail.value,
        })
        that.getPickerCity();
        break;
      case "3":
        // if (this.data.factory.length == 0) {
        //   return;
        // }
        // that.setData({
        //   factoryIndex: e.detail.value
        // })
        that.setData({
          isAreasPicker: false,
          "multiIndexs[0]": e.detail.value[0],
          "multiIndexs[1]": e.detail.value[1],
        })

        var authAreas = "";
        var province = that.data.multiArrays[0][that.data.multiIndexs[0]];
        var city = that.data.multiArrays[1][that.data.multiIndexs[1]];

        if (city == "全省" || province == city) {
          authAreas = province;
        } else {
          authAreas = province + city;
        }

        that.setData({
          areas: authAreas
        })
        that.getNetSiteList();
        break;
      default:
        break;
    }
  },

  getPickerProvince: function () {
    this.setData({
      city: '全部',
      factory: [],
      factoryIndex: 0,
      province: this.data.multiArray[0][this.data.multiIndex[0]]
    })
    this.getNetSiteList();
  },

  getPickerCity: function () {
    this.setData({
      factory: [],
      factoryIndex: 0,
      city: this.data.multiArray[1][this.data.multiIndex[1]],
    })
    // this.getCityNetSite();
    this.getNetSiteList();
  },

  goToAddNet: function () {
    wx.navigateTo({
      url: 'add/add'
    })
  },

  getAuth: function (e) {
    var that = this;
    var status = that.data.service[e.currentTarget.dataset.auth].status;
    var sid = that.data.service[e.currentTarget.dataset.auth].sid;

    if (status == 1) {
      wx.navigateTo({
        url: `get-auth/get-auth?sid=${sid}`
      })
    } else {
      return;
    }
  },

  goToAddress: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var address = that.data.service[index].addr;

    if (that.data.service[index].payScore == 0) {
      // 已经支付过BT
      that.getUserLocation(address);
    } else {
      // 未支付BT
      wx.showModal({
        title: '温馨提示',
        content: '查看服务网点联系人的手机号或地址需要消耗1BT，是否继续？',
        success: res => {
          if (res.confirm) {
            // 发送至后台
            var userId = that.data.service[index].sid;
            var url = `${app.apiUrl}serviceNetwork/own?id=${userId}`;

            util.req(url, 'POST', {}, function (data) {
              if (data.ret == 0) {
                var phone = "service[" + index + "].phone";
                var addr = "service[" + index + "].addr";

                that.setData({
                  [phone]: data.body.phone,
                  [addr]: data.body.addr,
                });

                wx.navigateTo({
                  url: `points/points?result=1`
                })
              } else {
                wx.navigateTo({
                  url: `points/points?msg=${data.msg}&result=0`
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
  },

  // 查看电话号码
  viewPhoneNum: function (e) {
    var that = this;
    
    if (that.data.service[e.currentTarget.dataset.id].payScore == 0) {
      wx.makePhoneCall({
        phoneNumber: that.data.service[e.currentTarget.dataset.id].phone
      });
      return;
    }

    wx.showModal({
      title: '温馨提示',
      content: '查看服务网点联系人的手机号需要消耗1BT，是否继续？',
      success: res => {
        if (res.confirm) {
          // 发送至后台
          var userId = this.data.service[e.currentTarget.dataset.id].sid;
          var url = `${app.apiUrl}serviceNetwork/own?id=${userId}`;

          util.req(url, 'POST', {}, function(data) {
            if (data.ret == 0) {
              var phone = "service[" + e.currentTarget.dataset.id + "].phone";
              var addr = "service[" + e.currentTarget.dataset.id + "].addr";

              that.setData({
                [phone]: data.body,
                [addr]: data.body,
              });

              wx.navigateTo({
                url: `points/points?result=1`
              })
            } else {
              wx.navigateTo({
                url: `points/points?msg=${data.msg}&result=0`
              })
            }
          }, function() {
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