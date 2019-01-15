// pages/user/service-site/add/add.js
var OSSUrl = 'https://image.bchltech.cn';
var util = require("../../../../utils/util.js");
var city = require("../../../../utils/area.js");
var app = getApp();
var second = 60;
var list = [];

Page({

  /**
   * 页面的初始数据
   */
  data: {
    OSSKey: {
      accessid: '',
      policy: '',
      signature: '',
      dir: '',
      topicPic: ''
    },
    multiIndex: [0, 0],
    multiIndexs: [0, 0],
    multiArray: city.provinceArray,
    objectMultiArray: city.cityArray,
    netSiteInfo: {
      company: '',
      companyAddr: '',
      userName: '',
      userPhone: '',
      proxyProduct: [],
      addProduct: '',
      authArea: '',
      authAreas: '',
      proxyAuthUrl: '',
      personalAuthUrl: '',
      code: '',
      authDate: ''
    },
    provinceDisabled: false,
    companyDisabled: false,
    authCertFiles: [],
    authCertUrl: '',
    authPersonFiles: [],
    uploadPersonFlag: false, // 上传成功标志
    authPersonUrl: '',
    uploadFlag: false,
    update: false,
    phoneDisabled: true,
    phoneFocus: false,
    sendCodeBtn: true,
    sendCode: '发送验证码',
    // userInputPhone: '',
    brand: [],
    proxyArr: [],
    proxy: [],
    authArea: '',
    authAreas: [],
    proxyProduct: [],
    currentDate: '',
    endDate: '',
    licenseFlag: true,// 第一次提交营业执照成功
    // goOnAdd: true,
    addProduct: '',
    isSelectJXS: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取OSS密钥
    this.getOSSAccessKey();
    this.serviceNetwork();
    // 获取代理品牌
    this.addProxyProduct();
    //获取顶部广告图
    this.getTopAD();
  },

  getTopAD: function() {
    // 获取顶部图片
    var that = this;
    var url = `${app.apiUrl}resource/otherAds`;

    util.req(url, 'GET', {}, function (data) {
      that.setData({
        topicPic: data.ads_create_servicenet
      });
    }, function () {
      util.req("请求接口失败");
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
        setTimeout(() => {
          util.toast(data.msg);
        }, 0)
      }
    }, function () {
      util.toast('数据请求失败');
    }, true);
  },

  serviceNetwork: function () {
    var that = this;
    var url = `${app.apiUrl}serviceNetwork`;

    util.req(url, 'GET', {}, function(data) {
      if (data.ret == 0) {
        // 存在网点信息
        if (data.body) {
          var company = 'netSiteInfo.company',
              companyAddr = 'netSiteInfo.companyAddr',
              userName = 'netSiteInfo.userName',
              userPhone = 'netSiteInfo.userPhone',
              authArea = 'netSiteInfo.authArea',
              authAreas = 'netSiteInfo.authAreas',
              // userDateEnd = 'netSiteInfo.authDate',
              proxyProduct = 'netSiteInfo.proxyProduct',
              personalAuthUrl = 'netSiteInfo.personalAuthUrl';

          var proxyProductArr = [];
          var authAreaArr = [];

          proxyProductArr = data.body.proxys.split(',');
          authAreaArr = data.body.proxyAreas.split(',');

          if (data.body.areas != "") {
            that.setData({
              provinceDisabled: true
            })
          }

          var date = new Date();
          var endDate = date.getFullYear() + "-" + "12-" + "31";

          that.setData({
            licenseFlag: data.body.license != "" ? false : true, // 已经上传过执照
            [company]: data.body.company,
            companyDisabled: true,
            // [userDateEnd]: endDate,
            [companyAddr]: data.body.addr,
            [userName]: data.body.name,
            [userPhone]: data.body.phone,
            [authArea]: authAreaArr,
            [authAreas]: data.body.areas,
            [proxyProduct]: proxyProductArr,
            proxyArr: proxyProductArr,
            [personalAuthUrl]: data.body.license
          })
        } else {
          that.checkAuthCert();
        }
      } else {
        that.checkAuthCert();
      }
    });
  },

  // 地图选择
  selectLocation: function () {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        var companyAddr = 'netSiteInfo.companyAddr';
        that.setData({
          [companyAddr]: res.address
        })
      }
    })
  },

  // 检查是否个人认证
  checkAuthCert: function () {
    var url = `${app.apiUrl}auth`;
    var that = this;

    util.req(url, 'GET', {}, function (data) {
      if (data.ret == 0) {
        var date = new Date();
        var endDate = date.getFullYear() + "-" + "12-" + "31";
        var userDateEnd = 'netSiteInfo.authDate';

        that.setData({
          [userDateEnd]: endDate
        })

        if (data.body.company) {
          var companyName = 'netSiteInfo.company';
          that.setData({
            companyDisabled: true,
            [companyName]: data.body.company
          })
        }

        if (data.body.name) {
          var userName = 'netSiteInfo.userName';
          that.setData({
            [userName]: data.body.name
          })
        }

        if (data.body.phone) {
          var userPhone = 'netSiteInfo.userPhone';
          that.setData({
            [userPhone]: data.body.phone
          })
        } else {
          that.setData({
            phoneDisabled: false
          })
        }
      }
    }, function () {
      util.toast('接口请求失败')
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var date = new Date();
    var currentDate = util.fmtDate(date);

    // 获取当前日期
    this.setData({
      currentDate: currentDate
    });
  },

  pickerChange: function (e) {
    var date = 'netSiteInfo.authDate';
    this.setData({
      [date]: e.detail.value
    })
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

  // 授权区域选择
  pickerAreaChange: function (e) {
    var that = this;
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
    });

    // var authArea = 'netSiteInfo.authArea';
    var province = this.data.multiArray[0][this.data.multiIndex[0]];
    // var city = this.data.multiArray[1][this.data.multiIndex[1]];
    // var authArea = "";

    // if (city == "全省") {
    //   authArea = province;
    // } else {
    //   authArea = province == city ? province : province + city;
    // }

    // var area = this.data.authArea;

    // if (area.indexOf(authArea) != -1) {
    //   util.toast("请勿重复添加");
    //   return;
    // }
    // area.push(province);
    this.setData({
      authArea: province
    })
  },

  // 申请区域选择
  pickerAreasChange: function (e) {
    // if (this.data.netSiteInfo.authAreas != "") {
    //   util.toast("只能添加一个申请区域！");
    //   return;
    // }
    
    this.setData({
      "multiIndexs[0]": e.detail.value[0],
      "multiIndexs[1]": e.detail.value[1],
    })

    var getAuthArea = this.data.netSiteInfo.authArea;
    var province = this.data.multiArray[0][this.data.multiIndexs[0]];
    var city = this.data.multiArray[1][this.data.multiIndexs[1]];
    var authArea = "";

    if (city == "全省") {
      authArea = province;
    } else {
      authArea = province == city ? province : province + city;
    }

    var area = this.data.authAreas;
    // var authAreas = 'netSiteInfo.authAreas';

    area.push(authArea);

    this.setData({
      authAreas: area
    })
  },

  deleteItem: function (e) {
    var index = e.currentTarget.dataset.index;
    var authAreas = this.data.authAreas;

    authAreas.splice(index, 1);

    this.setData({
      authAreas: authAreas
    })
  },

  deleteProxyItem: function (e) {
    var index = e.currentTarget.dataset.index;
    var proxy = this.data.proxy;

    proxy.splice(index, 1);

    this.setData({
      proxy: proxy
    })
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
  // 修改手机号
  updatePhone: function () {
    var that = this;
    wx.showModal({
      title: '温馨提示',
      content: '您确认更换手机号码吗？',
      success: function (res) {
        var userPhone = 'netSiteInfo.userPhone';
        if (res.confirm) {
          that.setData({
            update: true,
            phoneFocus: true,
            [userPhone]: '',
            phoneDisabled: false,
          })
        }

        if (res.cancel) {
          return;
        }
      }
    })
  },

  // 获取手机号
  getInputPhone: function (e) {
    var userPhone = 'netSiteInfo.userPhone';
    this.setData({
      [userPhone]: e.detail.value
    })
  },

  // 发送验证码
  sendCheckCode: function () {
    if (!util.fmtPhoneNumber(this.data.netSiteInfo.userPhone)) {
      return;
    }
    // 显示60秒倒计时按钮
    this.setData({
      sendCodeBtn: !this.data.sendCodeBtn
    })
    // 发送验证码
    this.sendCode();
    // 60秒倒计时
    this.setTimeCountDown();
  },

  // 60s倒计时
  setTimeCountDown: function () {
    var that = this;
    if (second == 0) {
      that.setData({
        sendCodeBtn: true
      })
      second = 60;
      return;
    } else {
      var _second = second--;
      that.setData({
        sendCodeDisabled: false,
        second: _second
      })
    }

    setTimeout(function () {
      that.setTimeCountDown()
    }, 1000)
  },

  sendCode: function () {
    var url = `${app.apiUrl}sms?${this.data.netSiteInfo.userPhone}`;

    util.req(url, 'GET', {}, function (data) {
      if (data.ret == 0) {
        util.toast('发送成功', 'success');
      } else {
        setTimeout(() => {
          util.toast(data.msg);
        } ,0)
      }
    }, function (data) {
      util.toast("验证码发送失败");
    }, true);
  },

  // 上传授权证书
  uploadAuthImage: function () {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        that.setData({
          authCertFiles: res.tempFilePaths
        });

        var imgSrc = res.tempFilePaths[0];
        that.uploadAuthImageOSS(imgSrc);
      }
    })
  },

  uploadAuthImageOSS: function (imgSrc) {
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
            authCertUrl: `${OSSUrl}/${that.data.OSSKey.dir}${filename}`
          })
          console.log(that.data.uploadFlag+";"+that.data.authCertUrl);
          util.toast('上传成功', 'success');
        } else {
          util.toast('上传失败');
        }
      },
      fail: function (res) {
        util.toast('上传失败');
      }
    })
  },

  delUploadPic: function () {
    this.setData({
      authCertFiles: [],
      uploadFlag: false,
      authCertUrl: ''
    })

    console.log(this.data.authCertFiles + ";" + this.data.uploadFlag + ";" + this.data.authCertUrl);
  },

  // 选择图片预览
  previewAuthImage: function () {
    wx.previewImage({
      urls: this.data.authCertFiles // 需要预览的图片http链接列表
    })
  },

  // 上传授权证书
  uploadPersonAuthImage: function() {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        that.setData({
          authPersonFiles: res.tempFilePaths
        });

        var imgSrc = res.tempFilePaths[0];
        that.uploadPersonImageOSS(imgSrc);
      }
    })
  },

  uploadPersonImageOSS: function (imgSrc) {
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
            uploadPersonFlag: true, // 上传成功标志
            authPersonUrl: `${OSSUrl}/${that.data.OSSKey.dir}${filename}`
          })
          console.log(that.data.uploadPersonFlag + ";" + that.data.authPersonUrl);
          util.toast('上传成功', 'success');
        } else {
          util.toast('上传失败');
        }
      },
      fail: function (res) {
        util.toast('上传失败');
      }
    })
  },

  delUploadPersonPic: function () {
    this.setData({
      authPersonFiles: [],
      uploadPersonFlag: false,
      authPersonUrl: ''
    })

    //console.log(this.data.authPersonFiles + ";" + this.data.uploadPersonFlag + ";" + this.data.authPersonUrl);
  },

  // 选择图片预览
  previewPersonImage: function () {
    wx.previewImage({
      urls: this.data.authPersonFiles // 需要预览的图片http链接列表
    })
  },

  // 输入公司名称
  inputCompanyName: function (e) {
    var companyName = 'netSiteInfo.company';
    this.setData({
      [companyName]: e.detail.value
    })
  },

  // 输入姓名
  inputUserName: function (e) {
    var userName = 'netSiteInfo.userName';
    this.setData({
      [userName]: e.detail.value
    })
  },

  // 验证码
  inputPhoneCode: function (e) {
    var code = 'netSiteInfo.code';
    this.setData({
      [code]: e.detail.value
    })
  },

  // 输入添加产品
  inputAddProduct: function (e) {
    var addProduct = 'netSiteInfo.addProduct';
    this.setData({
      addProduct: e.detail.value,
      [addProduct]: e.detail.value
    })
  },

  // 选择代理品牌
  pickerBrand: function (e) {
    // 如果选择最后一个“经销商”
    if (e.detail.value == this.data.brand.length - 1) {
      this.setData({
        isSelectJXS: true
      })
    }
    // 已经认证后只能添加一个
    if (this.data.proxy.length == 1) {
        util.toast("请保存后继续添加");
        return;
    }
    var proxy = this.data.proxy; // 新增品牌
    proxy.push(this.data.brand[e.detail.value]);

    this.setData({
      proxy: proxy
    })
  },

  // 获取代理品牌
  addProxyProduct: function () {
    var that = this;
    var url = `${app.apiUrl}index/product`;

    util.req(url, 'GET', {}, function(data){
      var brand = [];
      for (var i = 0; i < data.length; i++) {
        brand.push(data[i].name);
      }
      brand = util.fmtArray(brand);
      brand.push("全系列");
      that.setData({
        brand: brand
      })
    }, function(){
      util.req("数据请求失败");
    });
  },

  // 提交网点信息
  submitNetInfo: function () {
    var that = this;
    // 输入信息校验
    if (!that.data.netSiteInfo.company) {
      util.toast("请填写公司名称");
      return;
    }

    if (!that.data.netSiteInfo.companyAddr) {
      util.toast("请添加公司地址");
      return;
    }

    if (!that.data.netSiteInfo.userName) {
      util.toast("请输入姓名");
      return;
    }

    if (!that.data.netSiteInfo.userPhone) {
      util.toast("请填写电话号码");
      return;
    }

    // 手机号修改
    if (!that.data.phoneDisabled) {
      if (!that.data.netSiteInfo.code) {
        util.toast("请输入验证码");
        return;
      }
    }

    // 代理品牌
    // if (!that.data.netSiteInfo.product && that.data.proxy.length == 0) {
    //   util.toast("请添加代理品牌");
    //   return;
    // }

    // if (!that.data.netSiteInfo.addProduct) {
    //   util.toast("请填写添加的产品");
    //   return;
    // }

    if (that.data.netSiteInfo.authAreas == "" && that.data.authArea == "") {
      util.toast("请选择所在省份");
      return;
    }

    // if (that.data.authAreas.length == "") {
    //   util.toast("请选择申请区域");
    //   return;
    // }

    // 授权证书
    // if (!that.data.isSelectJXS) {
    //   if (that.data.uploadFlag && that.data.authCertUrl) {
    //     var authUrl = "netSiteInfo.proxyAuthUrl";
    //     that.setData({
    //       [authUrl]: that.data.authCertUrl
    //     })
    //   } else {
    //     util.toast("请上传授权证书");
    //     return;
    //   }
    // }

    // 营业执照
    if (that.data.licenseFlag) {// 第一次上传时
      if (that.data.uploadPersonFlag && that.data.authPersonUrl) {
        var personalAuthUrl = "netSiteInfo.personalAuthUrl";
        that.setData({
          [personalAuthUrl]: that.data.authPersonUrl
        })
      }
    }

    var authArea = that.data.netSiteInfo.authArea;
    if (authArea != "") {
      authArea.push(...that.data.authAreas);
    } else {
      authArea = that.data.authAreas;
    }

    var proxys = that.data.netSiteInfo.proxyProduct;
    if (proxys != "") {
      proxys.push(...that.data.proxy);
    } else {
      proxys = that.data.proxy;
    }

    var url = `${app.apiUrl}serviceNetwork`;
    var data = {
      company: that.data.netSiteInfo.company,
      addr: that.data.netSiteInfo.companyAddr,
      name: that.data.netSiteInfo.userName,
      phone: that.data.netSiteInfo.userPhone,
      areas: that.data.netSiteInfo.authAreas == "" ? that.data.authArea : that.data.netSiteInfo.authAreas,// 授权区域
      proxyAreas: authArea,//that.data.authAreas,// 申请区域
      code: that.data.netSiteInfo.code,
      // date_end: that.data.netSiteInfo.authDate,
      // brand: that.data.netSiteInfo.addProduct,
      proxys: proxys,//that.data.proxy,
      // qualification: that.data.netSiteInfo.proxyAuthUrl,
      license: that.data.netSiteInfo.personalAuthUrl
    };

    util.req(url, 'POST', data, function(data) {
      if (data.ret == 0) {
        that.goOnAdd();
        app.globalData.addProxyFlag = true;

        wx.showModal({
          title: '温馨提示',
          content: '恭喜您，公司信息上传成功，请耐心等待审核！',
          // confirmText: '继续添加',
          confirmText: '返回首页',
          showCancel: false,
          // cancelText: '返回列表',
          cancelText: '',
          success: function (res) {
            // 继续添加
            // if (res.confirm) {
            //   that.goOnAdd();
            //   that.setData({
            //     phoneDisabled: true
            //   })
            // }
            if (res.confirm) {
              that.goOnAdd();
              wx.switchTab({
                url: '/pages/index/index',
              })
            }
            // 返回列表
            // if (res.cancel) {
            //   wx.navigateBack()
            // }
          }
        })
      } else {
        setTimeout(() => {
          util.toast(data.msg);
        }, 0)
      }
    }, function(){
      util.toast("数据提交失败");
    });
  },

  // 继续添加
  goOnAdd: function () {
    var that = this;
    var url = `${app.apiUrl}serviceNetwork`;

    util.req(url, 'GET', {}, function (data) {
      if (data.ret == 0 && data.body.license != "") {
        that.setData({
          licenseFlag: false
        })
      }
    }, function () {
      util.toast("数据提交失败")
    });

    var addProduct = 'netSiteInfo.addProduct';
    var authCert = 'netSiteInfo.proxyAuthUrl';

    that.setData({
      proxy: [],
      [addProduct]: '',
      addProduct: '',
      [authCert]: '',
      authCertFiles: [],
      uploadFlag: false,
      authCertUrl: ''
    })
  }
})