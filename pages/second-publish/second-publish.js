// pages/hire/hire.js
var util = require("../../utils/util.js");
var city = require("../../utils/const.js");
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
var app = getApp();
var list = [];
var OSSUrl = 'https://image.bchltech.cn';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    city: "",
    // product type
    isProductPicker: true,
    proIndex: 0,
    // product factory
    isFactoryPicker: true,
    factoryIndex: 0,
    factory: [],
    addFactoryShow: true,
    // product model
    modelIndex: 0,
    isModelPicker: true,
    model: [],
    addModelShow: true,
    // day rent
    // isDayRentPicker: true,
    // rentIndex: [-1,-1],
    // dayRentType: [],
    // select city
    isCityPicker: true,
    cityIndex: 0,
    // rent data
    isDataPicker: true,
    date: "",
    // pick goods way
    isGoodsPicker: true,
    goodsIndex: 0,
    goods: [],
    // upload
    files: [],
    productFiles: [],
    configFiles: [],
    // hackIOS
    hackIOS: "",
    // 省市选择
    multiIndex: [-1, -1],
    multiArray: city.provinceArray,
    objectMultiArray: city.cityArray,
    // 取货地址
    goodsAddr: "",
    uploadGropress: 0, // 图片文件上传进度
    uploadConfigGropress: 0,
    OSSKey: {
      accessid: '',
      policy: '',
      signature: '',
      dir: ''
    },
    uploadFlag: false,
    uploadConfigFlag: false,
    productTypeUrl: '', // 产品参数的地址
    configDetailUrl:'', // 配置详情的地址
    uploadImagesUrl: [],
    proType: [],
    proTypeSortArray: [],
    getProductPic: {
      type: '',
      product: '',
      model: ''
    },
    factoryDisabled: true,
    modelDisabled: true,
    productFactory: '',
    productModel: '',
    modelArray: [],
    uploadImageUrl: [],
    uploadImageFlag: false,
    loading: false,
    disabled: false,
    latitude: '',
    longitude: '',
    phone: '',//电话认证
    imgUrl: '',
    topicPic: '',
    authFlag: false,
    currentDate: '',
    productParamsUrl: '',// 产品参数默认配置图
    configParamsUrl: '',// 配置详情默认配置图
    isPersonAuth: false // 是否实名认证
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取OSS密钥
    this.getOSSAccessKey();
    // ios的textarea左侧内边距hack
    var system = wx.getSystemInfoSync();
    if (system.platform == "ios") {
      this.setData({
        hackIOS: "10px"
      })
    }
    // 获取产品类型
    this.getProductSort();
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'K4TBZ-T4562-YLRUP-CJ4XX-4YPE7-J6B3O'
    });
    this.getUserLocation();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 获取顶部图片
    var that = this;
    var url = `${app.apiUrl}resource/otherAds`;

    util.req(url, 'GET', {}, function (data) {
      that.setData({
        topicPic: data.ads_second_handler_send
      });
    }, function () {
      util.req("请求接口失败");
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 检查是否个人认证
    this.checkAuthCert();
    var currentDate = util.fmtDate(new Date());
    // 获取当前日期
    this.setData({
      currentDate: currentDate
    });
    this.getServerData();
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

  getServerData: function () {
    var that = this;
    var url = `${app.apiUrl}selector/rent`;

    util.req(url, 'GET', {}, function(data){
      var min = data.rent.left;
      var max = data.rent.right;

      var dayRentType = [min, max];

      that.setData({
        goods: data.pickup,
        dayRentType: dayRentType
      })
    },function(){
      util.req("数据请求失败");
    });
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
                that.setData({
                  authFlag: true
                })
              } else if (res.confirm) {
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
        if (!!city) {
          that.setData({
            city: city
          })
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
        proType: machineSortArray,
        proTypeSortArray: data
      })
    }, function () {
      util.toast('请求接口失败')
    });
  },

  // 检查是否个人认证
  checkAuthCert: function () {
    var url = `${app.apiUrl}auth`;
    var that = this;

    util.req(url, 'GET', {}, function (data) {
      var phoneAuth = data.body.phoneAuth,
        realnameAuth = data.body.realnameAuth,
        enterpriseAuth = data.body.enterpriseAuth;
      // 个人认证
      if (!(phoneAuth == 1 && realnameAuth == 1)) {
        that.setData({
          isPersonAuth: false
        })
      }

      if (phoneAuth == 1 && realnameAuth == 1) {
        that.setData({
          isPersonAuth: true,
          phone: data.body.phone
        })
      }
    }, function () {
      util.toast('接口请求失败')
    });
  },

  getOSSAccessKey: function () {
    var that = this;
    var url = `${app.apiUrl}oss/auth`;
    // 获取OSS密钥
    util.req(url, 'GET', {}, function (data) {
      if (data.ret == 0) {
        data = data.body;
        var accessid = 'OSSKey.accessid',
          policy = 'OSSKey.policy',
          signature = 'OSSKey.signature',
          dir = 'OSSKey.dir';

        that.setData({
          [accessid]: data.accessid,
          [policy]: data.policy,
          [signature]: data.signature,
          [dir]: data.dir
        })
      } else {
        util.toast(data.msg)
      }
    }, function () {
      util.toast('数据请求失败');
    }, true);
  },

  // 省市二级联动
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

  // picker change event
  pickerChange: function (e) {
    var id = e.target.dataset.id;
    var index = e.detail.value;

    switch (id) {
      case "1":
        this.setData({
          isProductPicker: false,
          proIndex: e.detail.value
        })
        this.storageSelectSort(index);
        break;
      case "2":
        // 选择添加
        if (index == this.data.factory.length - 1) {
          this.setData({
            productModel: '',
            productFactory: '',
            addFactoryShow: false,
            isFactoryPicker: true,
            isModelPicker: true,
            addModelShow: false,
            modelDisabled: true
          })
          return;
        }
        
        this.setData({
          model: [],
          productModel: '',
          productFactory: '',
          addFactoryShow: true,
          addModelShow: true,
          isModelPicker: true,
          isFactoryPicker: false,
          factoryIndex: e.detail.value
        })
       
        this.storageSelectFactory(index);
        break;
      case "3":
        this.setData({
          isDayRentPicker: false,
          rentIndex: e.detail.value
        })

        var left = this.data.dayRentType[0][this.data.rentIndex[0]];
        var right = this.data.dayRentType[1][this.data.rentIndex[1]];
        if (left > right) {
          this.setData({
            isDayRentPicker: true
          });
          util.toast("请选择正确的租金范围")
        }

        break;
      case "4":
        this.setData({
          isCityPicker: false,
          "multiIndex[0]": e.detail.value[0],
          "multiIndex[1]": e.detail.value[1]
        })
        break;
      case "5":
        this.setData({
          isDataPicker: false,
          date: e.detail.value
        })
        break;
      case "6":
        this.setData({
          isGoodsPicker: false,
          goodsIndex: e.detail.value
        })
        break;
      // 产品型号
      case "7":
        if (index == this.data.model.length - 1) {
          this.setData({
            addModelShow: false,
            isModelPicker: true,
            productModel: '',
            productFactory: ''
          })
          return;
        }

        this.setData({
          addModelShow: true,
          isModelPicker: false,
          modelIndex: e.detail.value
        })
        // 获取产品缩略图
        this.getProductPic();
        break;
      default:
        break;
    }
  },

  // 存放产品类型
  storageSelectSort: function (index) {
    var obj = this.data.proTypeSortArray[index];
    var arrIndex = obj.id;

    if (this.data.factory.length != 0) {
      this.setData({
        model: [],
        factory: [],
        isFactoryPicker: true,
        isModelPicker: true
      })
    }

    this.getMachineFactory(arrIndex);
  },

  // 存放产品厂家
  storageSelectFactory: function (index) {
    var obj = this.data.factoryArray[index];
    var arrIndex = obj.id;
    
    if (this.data.model.length != 0) {
      this.setData({
        model: [],
        productModel: '',
        productFactory: '',
        modelDisabled: false,
        isFactoryPicker: true,
        isModelPicker: true
      })
    }
 
    this.getModelFactory(arrIndex);
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
      factoryArray.push("添加生产厂家");
      that.setData({
        factory: factoryArray,
        factoryArray: data,
        factoryDisabled: false // 厂家可选择
      })
    }, function () {
      util.toast('请求接口失败')
    });
  },

  // 获取产品型号
  getModelFactory: function (id) {
    var that = this;
    var url = `${app.apiUrl}index/model?${id}`;
    util.req(url, 'GET', {}, function (data) {
      var machineArray = [];
      for (var i = 0; i < data.length; i++) {
        machineArray.push(data[i].name);
      }
      machineArray.push("添加产品型号");
      that.setData({
        model: machineArray,
        modelArray: data,
        modelDisabled: false// 型号可点击
      })
    }, function () {
      util.toast('请求接口失败')
    });
  },

  getProductFactory: function (e) {
    this.setData({
      productFactory: e.detail.value
    })
  },

  getProductModel: function (e) {
    this.setData({
      productModel: e.detail.value
    })
  },

  // 获取产品的缩略图
  getProductPic: function () {
    // 获取缩略图
    var porductType = 'getProductPic.type',
      product = 'getProductPic.product',
      model = 'getProductPic.model';
    
    this.setData({
      [porductType]: this.data.proType[this.data.proIndex],
      [product]: this.data.factory[this.data.factoryIndex],
      [model]: this.data.model[this.data.modelIndex],
      imgUrl: this.data.modelArray[this.data.modelIndex].img ? this.data.modelArray[this.data.modelIndex].img : "",
      productParamsUrl: this.data.modelArray[this.data.modelIndex].prop ? this.data.modelArray[this.data.modelIndex].prop : "",// 产品参数默认配置图
      configParamsUrl: this.data.modelArray[this.data.modelIndex].attr ? this.data.modelArray[this.data.modelIndex].attr : ""// 配置详情默认配置图
    })
  },

  // 提交发布的仪器信息
  formSubmit: function (e) {
    var that = this;
    var obj = e.detail.value;
    
    // 产品类型
    if (obj.productType === 0) {
      util.toast("请选择产品类型");
      return;
    }

    // 生产厂家
    if (that.data.addFactoryShow) {
      if (obj.manufacturer === 0) {
        util.toast("请选择或添加生产厂家");
        return;
      }
    } else {
      if (obj.addProductFactory == "") {
        util.toast("请选择或添加生产厂家");
        return;
      }
    }

    // 产品型号
    if (this.data.addModelShow) {
      if (this.data.modelIndex === 0) {
        util.toast("请选择或添加产品型号");
        return;
      }
    } else {
      if (this.data.productModel == "") {
        util.toast("请选择或添加产品型号");
        return;
      }
    }

    // 图片上传
    if (!that.data.uploadImageFlag) {
      util.toast("至少添加一张产品图片");
      return;
    }

    if (obj.productNum == "") {
      util.toast("请填写数量");
      return;
    }

    if (that.data.date == "") {
      util.toast("请选择出厂日期");
      return;
    }

    if (obj.depositAmount == "") {
      util.toast("请填写售价金额");
      return;
    }

    if (!that.data.city && that.data.multiArray[1][that.data.multiIndex[1]] == undefined) {
      util.toast("请选择所在城市");
      return;
    }

    if (obj.rentDate == "") {
      util.toast("请选择租赁截止日期");
      return;
    }

    if (obj.goodsWay === 0) {
      util.toast("请选择取货方式");
      return;
    }

    if (that.data.goodsAddr == "") {
      util.toast("请选择取货地址");
      return;
    }

    // 获取厂家
    var factory = '';
    if (that.data.addFactoryShow) {
      factory = that.data.factory[that.data.factoryIndex];
    } else {
      factory = that.data.productFactory;
    }

    // 获取型号
    var model = '';
    if (that.data.addModelShow) {
      if (that.data.modelIndex === 0) {
        model = that.data.productInfo.model;
      } else {
        model = that.data.model[that.data.modelIndex];
      }
    } else {
      model = that.data.productModel;
    }

    // var rent_day = that.data.dayRentType[0][that.data.rentIndex[0]] + "-" + that.data.dayRentType[1][that.data.rentIndex[1]];
    var pickerCity = that.data.multiArray[1][that.data.multiIndex[1]];
    var city = pickerCity == undefined ? that.data.city : pickerCity;

    var url = `${app.apiUrl}instrument/secondHandler`;
    var data = {
      type: that.data.proType[that.data.proIndex],
      factory: factory,
      model: model,
      img_url: that.data.uploadImageUrl,
      number: obj.productNum,
      deposit: obj.depositAmount,
      date_year: that.data.date,
      params_url: that.data.productTypeUrl,
      config_url: that.data.configDetailUrl,
      item_note: obj.remarksInfo,
      city: city,
      // mobile: that.data.isPhoneAuth ? obj.phoneNum : 0,// 已经认证
      date_end: obj.rentDate,
      pick_up_type: that.data.goods[obj.goodsWay],
      pick_up_address: that.data.goodsAddr,
      lon: that.data.longitude || 0,
      lat: that.data.latitude || 0
    };

    that.setData({
      loading: true,
      disabled: true
    })

    util.req(url, 'POST', data, function (data) {
      if (data.ret == 0) {
        if (!that.data.isPersonAuth) {
          wx.showModal({
            title: '温馨提示',
            content: '亲，您的仪器租赁信息已经上传成功，需要您实名认证，开启您的仪器租赁之旅呦。',
            cancelText: '等会认证',
            cancelColor: '#999',
            confirmText: '去认证',
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '../certification/certification'
                })
              }

              if (res.cancel) {
                wx.switchTab({
                  url: '../index/index'
                })
              }
            }
          })
        } else {
          setTimeout(() => {
            util.toast(data.body, 'success');
          }, 0);
          setTimeout(() => {
            wx.navigateBack()
          }, 1500);
        }
      } else {
        util.toast(data.msg);
      }
    }, function () {
      util.toast('数据请求失败');
    }, true, function() {
      that.setData({
        loading: false,
        disabled: false
      })
    });
  },

  onUploadUrl: function (data) {
    this.setData({
      uploadImageUrl: data.detail.url,
      uploadImageFlag: data.detail.flag
    })
  },

  chooseProductImage: function () {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        that.setData({
          productFiles: res.tempFilePaths
        });

        var imgSrc = res.tempFilePaths[0];
        that.uploadImageOSS(imgSrc);
      }
    })
  },

  uploadImageOSS: function (imgSrc) {
    var that = this;
    // 图片上传至OSS()
    if (imgSrc.indexOf('http://tmp/') != -1) {
      var filename = imgSrc.replace('http://tmp/', "");
    }
    if (imgSrc.indexOf('wxfile://') != -1) {
      var filename = imgSrc.replace('wxfile://', "");
    }
    // 图片上传至OSS
    var uploadTask = wx.uploadFile({
      url: OSSUrl,
      filePath: imgSrc,
      name: 'file',
      header: {
        'Content-Type': 'multipart/form-data'
      },
      formData: {
        name: imgSrc,
        key: `${that.data.OSSKey.dir}${filename}`,
        policy: that.data.OSSKey.policy,
        OSSAccessKeyId: that.data.OSSKey.accessid,
        success_action_status: "200",
        signature: that.data.OSSKey.signature
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            uploadFlag: true, // 上传成功标志
            productTypeUrl: `${OSSUrl}/${that.data.OSSKey.dir}${filename}`
          })
          util.toast('上传成功', 'success');
        } else {
          util.toast('上传失败');
        }
      },
      fail: function (res) {
        util.toast('上传失败');
      }
    })

    uploadTask.onProgressUpdate((res) => {
      that.setData({
        uploadGropress: res.progress
      })
    })
  },

  chooseConfigImage: function () {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          configFiles: res.tempFilePaths
        });

        var imgSrc = res.tempFilePaths[0];
        that.uploadConfigImageOSS(imgSrc);
      }
    })
  },

  uploadConfigImageOSS: function (imgSrc) {
    var that = this;
    // 图片上传至OSS()
    if (imgSrc.indexOf('http://tmp/') != -1) {
      var filename = imgSrc.replace('http://tmp/', "");
    }
    if (imgSrc.indexOf('wxfile://') != -1) {
      var filename = imgSrc.replace('wxfile://', "");
    }
    // 图片上传至OSS
    var uploadTask = wx.uploadFile({
      url: OSSUrl,
      filePath: imgSrc,
      name: 'file',
      header: {
        'Content-Type': 'multipart/form-data'
      },
      formData: {
        name: imgSrc,
        key: `${that.data.OSSKey.dir}${filename}`,
        policy: that.data.OSSKey.policy,
        OSSAccessKeyId: that.data.OSSKey.accessid,
        success_action_status: "200",
        signature: that.data.OSSKey.signature
      },
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            uploadConfigFlag: true, // 上传成功标志
            configDetailUrl: `${OSSUrl}/${that.data.OSSKey.dir}${filename}`
          })
          //console.log(that.data.configDetailUrl);
          util.toast('上传成功', 'success');
        } else {
          util.toast('上传失败');
        }
      },
      fail: function (res) {
        util.toast('上传失败');
      }
    })

    uploadTask.onProgressUpdate((res) => {
      that.setData({
        uploadConfigGropress: res.progress
      })
    })
  },

  // 选择图片预览
  previewProductImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.productFiles // 需要预览的图片http链接列表
    })
  },

  previewExampleImage: function (e) {
    var imgUrl = this.data.imgUrl.split(',');
    wx.previewImage({
      current: imgUrl, // 当前显示图片的http链接
      urls: imgUrl // 需要预览的图片http链接列表
    })
  },

  previewParamsImage: function(e) {
    var imgUrl = this.data.productParamsUrl.split(',');
    wx.previewImage({
      current: imgUrl, // 当前显示图片的http链接
      urls: imgUrl// 需要预览的图片http链接列表
    })
  },

  previewConfigsImage: function (e) {
    var imgUrl = this.data.configParamsUrl.split(',');
    wx.previewImage({
      current: imgUrl, // 当前显示图片的http链接
      urls: imgUrl // 需要预览的图片http链接列表
    })
  },

  previewConfigImage: function (e) {
    var imgUrl = this.data.configParamsUrl.split(',');
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.configFiles // 需要预览的图片http链接列表
    })
  },

  // 图片删除
  uploaderProductImageDel: function () {
    this.setData({
      productFiles: []
    })
  },

  uploaderConfigImageDel: function () {
    this.setData({
      configFiles: []
    })
  },

  // 地图选择
  selectLocation: function () {
    var that = this;
    wx.chooseLocation({
      success: function(res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          goodsAddr: res.address
        })
      }
    })
  }
})