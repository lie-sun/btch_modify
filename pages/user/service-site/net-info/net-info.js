// pages/user/service-site/net-info/net-info.js
var OSSUrl = 'https://image.bchltech.cn';
var util = require("../../../../utils/util.js");
var app = getApp();
var second = 60;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    OSSKey: {
      accessid: '',
      policy: '',
      signature: '',
      dir: ''
    },
    update: false,
    phoneDisabled: true,
    phoneFocus: false,
    sendCodeBtn: true,
    sendCode: '发送验证码',
    netSiteInfo: {
      company: '',
      addr: '',
      phone: '',
      name: '',
      license: '',
      code: '',
      sid: ''
    },
    proxy: [],
    proxyProduct: [],
    qual: [],
    brand: [],
    authPersonFiles: [],
    uploadPersonFlag: false, // 上传成功标志
    authPersonUrl: '',
    authQualFiles: [],
    uploadQualFlag: false, // 上传成功标志
    authQualUrl: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取OSS密钥
    this.getOSSAccessKey();
    this.getServiceNetwork();
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //console.log(app.globalData.addProxyFlag);
    if (app.globalData.addProxyFlag) {
      var that = this;
      var url = `${app.apiUrl}serviceNetwork`;

      util.req(url, 'GET', {}, function (data) {
        if (data.ret == 0) {
          if (data.body) {
            var proxy = that.data.proxy;
            var brand = that.data.brand;

            that.setData({
              proxyProduct: []
            })

            var proxyProduct = that.data.proxyProduct;

            for (var i = 0; i < data.body.proxy.length; i++) {
              brand.push(data.body.proxy[i].brand);
              proxy.push(data.body.proxy[i].product);    
              proxyProduct.push(data.body.proxy[i].product + data.body.proxy[i].brand);
            }

            that.setData({
              brand: brand,
              proxy: proxy,
              proxyProduct: proxyProduct
            })
          }
        } else {
          setTimeout(() => {
            util.toast(data.msg);
          }, 0)
        }
      }, function () {
        util.req("数据请求失败");
      });
      app.globalData.addProxyFlag = false;
    }
  },

  getServiceNetwork: function () {
    var that = this;
    var url = `${app.apiUrl}serviceNetwork`;

    util.req(url, 'GET', {}, function (data){
      if (data.ret == 0) {
        if (data.body) {
          var company = 'netSiteInfo.company',
            addr = 'netSiteInfo.addr',
            phone = 'netSiteInfo.phone',
            name = 'netSiteInfo.name',
            sid = 'netSiteInfo.sid',
            license = 'netSiteInfo.license';

          var proxy = that.data.proxy;
          var brand = that.data.brand;
          var qualification = that.data.qual;
          var proxyProduct = that.data.proxyProduct;

          for (var i = 0; i < data.body.proxy.length; i++) {
            brand.push(data.body.proxy[i].brand);
            proxy.push(data.body.proxy[i].product);
            proxyProduct.push(data.body.proxy[i].product + data.body.proxy[i].brand);
            qualification.push(data.body.proxy[i].qualification);
          }

          that.setData({
            [company]: data.body.company,
            [addr]: data.body.addr,
            [phone]: data.body.phone,
            [name]: data.body.name,
            [sid]: data.body.sid,
            [license]: data.body.license,
            brand: brand,
            proxy: proxy,
            proxyProduct: proxyProduct,
            qual: qualification
          })
        }
      } else {
        setTimeout(() => {
          util.toast(data.msg);
        }, 0)
      }
    }, function() {
      util.req("数据请求失败");
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

  updatePhone: function () {
    var that = this;
    wx.showModal({
      title: '温馨提示',
      content: '您确认更换手机号码吗？',
      success: function (res) {
        if (res.confirm) {
          that.setData({
            update: true,
            phoneFocus: true,
            phoneDisabled: false
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
    var phone = 'netSiteInfo.phone';

    this.setData({
      [phone]: e.detail.value
    })
  },

  // 发送验证码
  sendCheckCode: function () {
    if (!util.fmtPhoneNumber(this.data.netSiteInfo.phone)) {
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
    var url = `${app.apiUrl}sms?${this.data.netSiteInfo.phone}`;

    util.req(url, 'GET', {}, function (data) {
      if (data.ret == 0) {
        util.toast('发送成功', 'success');
      } else {
        util.toast(data.msg);
      }
    }, function (data) {
      util.toast("发送失败");
    }, true);
  },

  inputPhoneCode: function (e) {
    var code = 'netSiteInfo.code';

    this.setData({
      [code]: e.detail.value
    })
  },

  updateAddress: function () {
    // 地图选择
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        var addr = 'netSiteInfo.addr';
        that.setData({
          [addr]: res.address
        })
      }
    })
  },

  // 上传资质授权证书
  uploadQualAuthImage: function () {
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
        that.uploadQualImageOSS(imgSrc);
      }
    })
  },

  uploadQualImageOSS: function (imgSrc) {
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
            uploadQualFlag: true, // 上传成功标志
            authQualUrl: `${OSSUrl}/${that.data.OSSKey.dir}${filename}`
          })
          console.log(that.data.uploadQualFlag + ";" + that.data.authQualUrl);
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

  delUploadQualPic: function () {
    this.setData({
      authQualFiles: [],
      uploadQualFlag: false,
      authQualUrl: ''
    })

    //console.log(this.data.authPersonFiles + ";" + this.data.uploadPersonFlag + ";" + this.data.authPersonUrl);
  },

  previewQualImage: function () {
    wx.previewImage({
      urls: this.data.authQualFiles // 需要预览的图片http链接列表
    })
  },

  // 上传授权证书
  uploadPersonAuthImage: function () {
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

  previewLicenseImage: function () {
    wx.previewImage({
      urls: this.data.netSiteInfo.license.split(',') // 需要预览的图片http链接列表
    })
  },

  previewQualListImage: function () {
    wx.previewImage({
      urls: this.data.qual // 需要预览的图片http链接列表
    })
  },

  goNewAddNet: function () {
    wx.navigateTo({
      url: '../add/add',
    })
  },

  submitNetInfo: function () {
    // if (!this.data.netSiteInfo.code) {
    //   util.toast("请输入验证码");
    //   return;
    // }


    if (!this.data.netSiteInfo.license) {
      if (!this.data.uploadPersonFlag && !this.data.authPersonUrl) {
        util.toast("请上传营业执照");
        return;
      } else {
        var license = 'netSiteInfo.license';
        this.setData({
          [license]: this.data.authPersonUrl
        })
      }
    }

    if (!this.data.qual) {
      if (!this.data.uploadQualFlag && !this.data.authQualUrl) {
        util.toast("请上传资质证书");
        return;
      } else {
        this.setData({
          qual: this.data.authQualUrl
        })
      }
    }

    var url = `${app.apiUrl}serviceNetwork`;

    var data = {
      company: this.data.netSiteInfo.company,
      addr: this.data.netSiteInfo.addr,
      phone: this.data.netSiteInfo.phone,
      code: this.data.netSiteInfo.code,
      name: this.data.netSiteInfo.name,
      sid: this.data.netSiteInfo.sid,
      product: this.data.proxy,
      brand: this.data.brand,
      qualification: this.data.qual,
      license: this.data.netSiteInfo.license
    };

    util.req(url, 'PUT', data, function (data) {
      if (data.ret == 0) {
        setTimeout(() => {
          util.toast(data.body, 'success');
        }, 0);
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        setTimeout(() => {
          util.toast(data.msg);
        }, 0)
      }
    }, function () {
      util.toast("数据提交失败");
    });
  }
})