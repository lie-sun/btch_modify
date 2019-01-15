// pages/hire/hire.js
var util = require("../../../../utils/util.js");
var city = require("../../../../utils/const.js");
var app = getApp();
var list = [];
var OSSUrl = 'https://batuoss.oss-cn-beijing.aliyuncs.com';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // product type
    isProductPicker: true,
    proIndex: 0,
    addProShow: true,
    // product factory
    isFactoryPicker: true,
    factoryIndex: 0,
    factory: [],
    addFactoryShow: true,
    // product model
    isModelPicker: true,
    modelIndex: 0,
    model: [],
    addModelShow: true,
    // day rent
    isDayRentPicker: true,
    rentIndex: [0, 0],
    dayRentType: [["0", "100", "500", "1000"], ["500", "1000", "1000", "10000"]],
    // select city
    isCityPicker: true,
    cityIndex: 0,
    // rent data
    isDataPicker: true,
    date: "",
    // pick goods way
    isGoodsPicker: true,
    goodsIndex: 0,
    goods: ["上门自提", "邮寄"],
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
    configDetailUrl: '', // 配置详情的地址
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
    productType: '',
    productFactory: '',
    productModel: '',
    uploadImageUrl: [],
    uploadImageFlag: false,
    loading: false,
    disabled: false,
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
    this.getHireInfo(options.id);
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
    this.checkAuthCert();
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
          isPersonAuth: true
        })
      }
    }, function () {
      util.toast('接口请求失败')
    });
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

  getHireInfo: function (id) {
    var that = this;
    var url = `${app.apiUrl}instrument/secondHandler?id=${id}`;

    util.req(url, 'GET', {}, function (data) {
      if (data.ret == 0) {
        console.log(data.body.img_url.split(','));
        data.body.img_url = data.body.img_url.split(',');
        data.body.date_year = data.body.date_year ? data.body.date_year.substring(0, 10) : '';
        that.setData({
          productInfo: data.body
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

  getOSSAccessKey: function () {
    var that = this;
    var url = `${app.apiUrl}oss/auth`;
    // 获取OSS密钥
    util.req(url, 'GET', {}, function (data) {
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

  factoryTip: function () {
    if (this.data.factoryDisabled) {
      wx.showToast({
        title: '请重新选择产品类型获取对应的厂家和型号',
        icon: 'none',
        duration: 1800
      })
      return;
    }
  },

  modelTip: function () {
    if (this.data.modelDisabled) {
      wx.showToast({
        title: '请重新选择产品类型获取对应的厂家和型号',
        icon: 'none',
        duration: 1800
      })
      return;
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
            addFactoryShow: false,
            isFactoryPicker: true,
            addModelShow: false
          })
          return;
        }

        this.setData({
          addFactoryShow: true,
          isFactoryPicker: false,
          factoryIndex: e.detail.value
        })
        this.storageSelectFactory(index);
        break;
      case "3":
        this.setData({
          isDayRentPicker: false,
          "rentIndex[0]": e.detail.value[0],
          "rentIndex[1]": e.detail.value[1]
        })
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
            isModelPicker: true
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
      [model]: this.data.productModel
    })

    //console.log(this.data.getProductPic);
    // 获取缩略图


  },

  // 提交发布的仪器信息
  formSubmit: function (e) {
    var that = this;
    var obj = e.detail.value;

    // 生产厂家
    if (!that.data.addFactoryShow) {
      if (obj.addProductFactory == "") {
        util.toast("请选择或添加生产厂家");
        return false;
      }
    }
    // 产品型号
    if (!this.data.addModelShow) {
      if (this.data.productModel == "") {
        util.toast("请选择或添加产品型号");
        return;
      }
    }

    if (obj.productNum == "") {
      util.toast("请填写数量");
      return false;
    }

    if (obj.depositAmount == "") {
      util.toast("请填写售价金额");
      return false;
    }

    if (!that.data.productInfo.city && that.data.multiArray[1][that.data.multiIndex[1]] == undefined) {
      util.toast("请选择所在城市");
      return false;
    }

    // 获取厂家
    var factory = '';
    if (that.data.addFactoryShow) {
      if (that.data.factoryIndex === 0) {
        factory = that.data.productInfo.factory;
      } else {
        factory = that.data.factory[that.data.factoryIndex];
      }
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

    var img_url = that.data.uploadImageUrl.length != 0 ? that.data.uploadImageUrl : that.data.productInfo.img_url;

    var pick_up_type = "";
    if (that.data.goodsIndex === 0) {
      pick_up_type = that.data.productInfo.pick_up_type;
    } else {
      pick_up_type = that.data.goods[obj.goodsWay];
    }

    // var rent_day = "";
    // if (that.data.rentIndex === 0) {
    //   rent_day = that.data.productInfo.rent_day;
    // } else {
    //   rent_day = that.data.dayRentType[0][that.data.rentIndex[0]] + "-" + that.data.dayRentType[1][that.data.rentIndex[1]];
    // }

    var pickerCity = that.data.multiArray[1][that.data.multiIndex[1]];
    var city = pickerCity == undefined ? that.data.productInfo.city : pickerCity;

    // 获取地理位置
    var lat = '', lon = '';
    if (!pickerCity) {
      lat = that.data.productInfo.lat;
      lon = that.data.productInfo.lon;
    } else {
      lat = 0;
      lon = 0;
    }

    var url = `${app.apiUrl}instrument/secondHandler`;
    var data = {
      productID: that.data.productInfo.productID,
      type: that.data.proType[that.data.proIndex],
      factory: factory,
      model: model,
      img_url: img_url,
      number: obj.productNum,
      deposit: obj.depositAmount,
      // rent_day: rent_day,
      params_url: that.data.productTypeUrl ? that.data.productTypeUrl : that.data.productInfo.params_url,
      config_url: that.data.configDetailUrl ? that.data.configDetailUrl : that.data.productInfo.config_url,
      item_note: obj.remarksInfo,
      city: city,
      date_year: that.data.date ? that.data.date : that.data.productInfo.date_year,
      // mobile: obj.phoneNum,
      // date_end: obj.rentDate ? obj.rentDate : that.data.productInfo.date_end,
      pick_up_type: pick_up_type,//that.data.goods[obj.goodsWay],
      pick_up_address: that.data.goodsAddr ? that.data.goodsAddr : that.data.productInfo.pick_up_address,
      lon: lon,
      lat: lat
    };

    that.setData({
      loading: true,
      disabled: true
    })
    //console.log(data);
    util.req(url, 'PUT', data, function (data) {
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
                  url: '/pages/certification/certification'
                })
              }

              if (res.cancel) {
                wx.switchTab({
                  url: '/pages/index/index'
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
    }, true, function () {
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

  previewConfigImage: function (e) {
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
      success: function (res) {
        //console.log(res.address);
        that.setData({
          goodsAddr: res.address
        })
      }
    })
  }
})