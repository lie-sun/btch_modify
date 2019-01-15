// pages/rent/rent.js// pages/rent/rent.js
var city = require("../../utils/const.js");
var util = require("../../utils/util.js");
var app = getApp();
var currentPage = 1;
var pageReco = 1;
var list = [];
var page = 1;
var pageShow = 6;

var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    city: "",
    multiIndex: [0, 0],
    multiArray: city.provinceArray,
    objectMultiArray: city.cityArray,
    factory: [],// 厂家
    factoryArray: [],// 厂家
    model: [],// 仪器型号
    modelArray: [],// 仪器型号
    machine: [],// 仪器分类
    machineSortArray: [],// 仪器分类
    modelDisabled: true,// 禁点击型号
    factoryDisabled: true,// 禁止点击厂家
    cityIndex: 0,
    isCityPicker: true,
    isFactoryPicker: true,
    isModelPicker: true,
    tapActive: 0,
    submitMachineInfo: {
      type: '',
      product: '',
      model: '',
      page: currentPage,
      lat: '',
      lon: '',
      city: ''
    },
    latitude: '',
    longitude: '',
    productInfo: [],
    productReco: [],
    loadMore: false,
    loadMoreReco: false,
    showFlag: false,
    authFlag: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'K4TBZ-T4562-YLRUP-CJ4XX-4YPE7-J6B3O'
    });

    if (!(app.globalData.latitude && app.globalData.userLocation)) {
      this.getUserLocation();
    }
    this.getUserLocationCity();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 获取仪器分类
    this.getProductSort();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
                that.setData({
                  authFlag: true,
                  latitude: 0,
                  longitude: 0
                })
              }
              if (res.confirm) {
                wx.reLaunch({
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

        that.setData({
          latitude: latitude,
          longitude: longitude
        })

        that.getLocal(latitude, longitude);
      },
      fail: function (res) {
        that.setData({
          city: '未知'
        })
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
        that.setData({
          city: city
        })
      },
      fail: function (res) {
        console.log('定位失败' + res);
        that.setData({
          city: '未知'
        })
      },
      complete: function (res) {
        console.log('定位完成' + res);
      }
    })
  },


  getUserLocationCity: function () {
    var machineLocation = 'submitMachineInfo.city',
      machineLat = 'submitMachineInfo.lat',
      machineLon = 'submitMachineInfo.lon';
    this.setData({
      city: this.data.city || app.globalData.userLocation,
      [machineLat]: this.data.latitude || app.globalData.latitude || 0,
      [machineLon]: this.data.longitude || app.globalData.longitude || 0,
      [machineLocation]: this.data.city || app.globalData.userLocation
    })
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

  // 获取默认的仪器列表(传经纬度)
  getProductList: function () {
    var that = this;
    var lat = app.globalData.latitude || that.data.latitude || 0;
    var lon = app.globalData.longitude || that.data.longitude || 0;
    var city = app.globalData.userLocation || that.data.city;
    var modeType = that.data.machineSortArray[0].name;

    var url = `${app.apiUrl}index/instrument/secondHandler?lat=${lat}&lon=${lon}&city=${city}&page=${currentPage}&type=${modeType}`;
    util.req(url, 'GET', {}, function (data) {
      if (data.ret == 0) {
        if (data.body.length == 0) {
          that.getProductReco();
        }

        for (var i = 0; i < data.body.length; i++) {
          data.body[i].deposit = parseInt(data.body[i].deposit);
          data.body[i].date_year = data.body[i].date_year ? data.body[i].date_year.substring(0, 4) : '';
        }
        that.setData({
          productInfo: data.body,
          showFlag: true
        })

        if (currentPage != data.count) {
          that.setData({
            loadMore: true
          })
        }
        // 获取RTK厂家
        that.selectItemTap(0, true);
      }
    }, function () {
      util.toast('数据请求失败')
    });
  },

  // 获取仪器推荐
  getProductReco: function (load) {
    var that = this;
    var lat = app.globalData.latitude || that.data.latitude || 0;
    var lon = app.globalData.longitude || that.data.longitude || 0;
    var city = that.data.submitMachineInfo.city;
    var type = that.data.submitMachineInfo.type || that.data.machineSortArray[0].name;;

    var url = `${app.apiUrl}index/instrument/secondHandler/recommend?lat=${lat}&lon=${lon}&city=${city}&type=${type}&page=${pageReco}&pageShow=${pageShow}`;

    util.req(url, 'GET', {}, function (data) {
      if (data.ret == 0) {
        if (pageReco == data.count) {
          that.setData({
            loadMoreReco: false
          })
        } else {
          that.setData({
            loadMoreReco: true
          })
        }

        if (load && load == 2) {
          data.body = that.data.productReco.concat(data.body);
        }

        for (var i = 0; i < data.body.length; i++) {
          data.body[i].date_year = data.body[i].date_year ? data.body[i].date_year.substring(0, 4) : '';
        }

        that.setData({
          productReco: data.body
        })
      }
    }, function () {
      util.toast('数据请求失败')
    }, true);
  },

  // 获取仪器分类
  getProductSort: function () {
    var that = this;
    var url = `${app.apiUrl}index/type`;
    util.req(url, 'GET', {}, function (data) {
      var machineSortArray = [];
      for (var i = 0; i < data.length; i++) {
        machineSortArray.push(data[i].name);
      }
      that.setData({
        machine: machineSortArray,
        machineSortArray: data
      })

      // 获取产品列表
      that.getProductList();
    }, function () {
      util.toast('请求接口失败')
    }, true);
  },

  multiPickerColumnChange: function (e) {
    var that = this;
    switch (e.detail.column) {
      case 0:
        list = []
        for (var i = 0; i < that.data.objectMultiArray.length; i++) {
          if (that.data.objectMultiArray[i].parid == that.data.objectMultiArray[e.detail.value].regid) {
            list.push(that.data.objectMultiArray[i].regname)
          }
        }
        that.setData({
          "multiArray[1]": list,
          "multiIndex[0]": e.detail.value,
          "multiIndex[1]": 0
        })

    }
  },

  pickerChange: function (e) {
    var that = this;
    var id = e.target.dataset.id;
    switch (id) {
      case "1":
        that.setData({
          isCityPicker: false,
          "multiIndex[0]": e.detail.value[0],
          "multiIndex[1]": e.detail.value[1],
          loadMore: false
        })
        var machineLocation = 'submitMachineInfo.city';
        that.setData({
          [machineLocation]: that.data.multiArray[1][that.data.multiIndex[1]]
        })

        currentPage = 1;
        pageReco = 1;
        // 地理位置改变后重新发送至服务器
        that.submitSearchKey();
        break;
      case "2":
        // 厂家选择后型号自动选择 仪器没有更新
        if (that.data.model.length != 0) {
          var model = 'submitMachineInfo.model';
          that.setData({
            [model]: '',
            isModelPicker: true
          })
        }

        var machineFactory = 'submitMachineInfo.product';
        var facotry = that.data.factory[e.detail.value];

        that.setData({
          isFactoryPicker: facotry ? false : true,
          factoryIndex: e.detail.value,
          [machineFactory]: facotry ? facotry : '',
          loadMore: false
        })

        currentPage = 1;
        pageReco = 1;
        that.submitSearchKey();

        // 获取选择的厂家ID
        var factoryArr = that.data.factoryArray;
        var factoryID = factoryArr[e.detail.value].id;
        // 获取型号
        var url = `${app.apiUrl}index/model?${factoryID}`;
        util.req(url, 'GET', {}, function (data) {
          var machineArray = [];
          for (var i = 0; i < data.length; i++) {
            machineArray.push(data[i].name);
          }
          that.setData({
            model: machineArray,
            modelArray: data,
            modelDisabled: false// 型号可点击
          })
        }, function () {
          util.toast('请求接口失败')
        });
        break;
      case "3":
        var machineModel = 'submitMachineInfo.model';
        var model = that.data.model[e.detail.value];

        that.setData({
          isModelPicker: model ? false : true,
          modelIndex: e.detail.value,
          [machineModel]: model ? model : ''
        })

        // 获取仪器的列表(type,factory,model,page,pageShow,lat,lon)
        that.getMachineList();
        break;
      default:
        break;
    }
  },

  // 获取查询的仪器列表
  getMachineList: function () {
    // 获取地理位置
    var machineLocation = 'submitMachineInfo.city';
    var machineLat = 'submitMachineInfo.lat';
    var machineLon = 'submitMachineInfo.lon';
    var lat = '', lon = '';

    if (this.data.city) {
      lat = app.globalData.latitude;
      lon = app.globalData.longitude;
    }

    this.setData({
      [machineLat]: lat,
      [machineLon]: lon,
      loadMore: false
    })

    currentPage = 1;
    pageReco = 1;
    // 提交查询关键词到服务器
    this.submitSearchKey();
  },

  // 提交查询关键词到服务器
  submitSearchKey: function (load) {
    var that = this;
    var url = `${app.apiUrl}index/instrument/secondHandler`;
    var data = {
      type: that.data.submitMachineInfo.type,
      product: that.data.submitMachineInfo.product,
      model: that.data.submitMachineInfo.model,
      page: currentPage,
      lat: that.data.submitMachineInfo.lat,
      lon: that.data.submitMachineInfo.lon,
      city: that.data.submitMachineInfo.city
    };
    util.req(url, 'GET', data, function (data) {
      if (data.ret == 0) {
        if (currentPage == data.count) {
          that.setData({
            loadMore: false
          })
        } else {
          that.setData({
            loadMore: true
          })
        }

        if (load && load == 1) {
          data.body = that.data.productInfo.concat(data.body);
        }
        console.log(data.body)
        if (data.body.length != 0) {
          for (var i = 0; i < data.body.length; i++) {
            data.body[i].date_year = data.body[i].date_year ? data.body[i].date_year.substring(0, 4) : "";
          }
        }
        
        that.setData({
          productInfo: data.body,
          showFlag: true
        });

        if (data.body.length == 0) {
          that.getProductReco();
        }
      }
    }, function () {
      setTimeout(() => {
        util.toast('数据请求失败')
      }, 0)
    });
  },

  // 选择仪器分类
  selectItemTap: function (e, flag) {
    var id = e.target ? e.target.dataset.id : e;
    switch (id) {
      case 0:
        this.setData({
          tapActive: 0,
          loadMore: false
        });
        this.storageSelectSort(id);
        currentPage = 1;
        pageReco = 1;
        // 提交查询关键词到服务器
        if (!flag) { this.submitSearchKey(); }
        break;
      case 1:
        this.setData({
          tapActive: 1,
          loadMore: false
        });
        this.storageSelectSort(id);
        currentPage = 1;
        pageReco = 1;
        // 提交查询关键词到服务器
        this.submitSearchKey();
        break;
      case 2:
        this.setData({
          tapActive: 2,
          loadMore: false
        });
        this.storageSelectSort(id);
        currentPage = 1;
        pageReco = 1;
        // 提交查询关键词到服务器
        this.submitSearchKey();
        break;
      case 3:
        this.setData({
          tapActive: 3,
          loadMore: false
        });
        this.storageSelectSort(id);
        currentPage = 1;
        pageReco = 1;
        // 提交查询关键词到服务器
        this.submitSearchKey();
        break;
      default:
        break;
    }
  },

  // 存储选择的仪器分类
  storageSelectSort: function (index) {
    var obj = this.data.machineSortArray[index];
    var arrIndex = obj.id;
    var machineInfoObj = 'submitMachineInfo.type';
    var factory = 'submitMachineInfo.product';
    var model = 'submitMachineInfo.model';


    if (this.data.factory.length != 0) {
      this.setData({
        [factory]: '',
        isFactoryPicker: true,
        [model]: '',
        isModelPicker: true
      })
    }

    this.getMachineFactory(arrIndex);
    this.setData({
      [machineInfoObj]: obj.name,
    })
  },

  // 获取仪器厂家
  getMachineFactory: function (id) {
    var that = this;
    var url = `${app.apiUrl}index/product?${id}`;
    util.req(url, 'GET', {}, function (data) {
      var factoryArray = [];
      for (var i = 0; i < data.length; i++) {
        factoryArray.push(data[i].name);
      }
      that.setData({
        factory: factoryArray,
        factoryArray: data,
        modelDisabled: true,
        factoryDisabled: false // 厂家可选择
      })
    }, function () {
      util.toast('请求接口失败')
    });
  },

  // 加载更多
  loadMoreProduct: function () {
    currentPage = currentPage + 1;// 页数加1
    this.submitSearchKey(1);
  },

  loadMoreReco: function () {
    pageReco = pageReco + 1;// 页数加1
    this.getProductReco(2);
  }
})