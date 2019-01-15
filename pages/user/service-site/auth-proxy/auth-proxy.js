// pages/user/service-site/auth-proxy/auth-proxy.js
var OSSUrl = 'https://image.bchltech.cn';
var util = require("../../../../utils/util.js");
var app = getApp();

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
    authCertFiles: [],
    authCertUrl: '',
    uploadFlag: false,
    company: '',
    proxy: [],
    phone: '',
    sid: '',
    addr: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取OSS密钥
    this.getOSSAccessKey();
    this.setData({
      company: options.company,
      proxy: JSON.parse(options.proxy),
      phone: options.phone,
      sid: options.sid
    })
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

  // 地图选择
  selectLocation: function () {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        that.setData({
          addr: res.address
        })
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
          console.log(that.data.uploadFlag + ";" + that.data.authCertUrl);
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

  confirmSubmit: function () {
    var that = this;

    if (!that.data.addr) {
      util.toast("请添加公司地址");
      return;
    }

    if (!that.data.uploadFlag && !that.data.authCertUrl) {
      util.toast("请上传资质证书");
      return;
    }
    
    var url = `${app.apiUrl}serviceNetwork/qual`;
    var data = {
      qual: that.data.authCertUrl,
      sid: that.data.sid,
      addr: that.data.addr
    };

    util.req(url, 'PUT', data, function (data) {
      if (data.ret == 0) {
        setTimeout(() => {
          util.toast(data.body, 'success');
          that.setData({
            authCertFiles: [],
            authCertUrl: '',
            uploadFlag: false,
          })
        }, 0);
      } else {
        setTimeout(() => {
          util.toast(data.msg)
        }, 0)
      }
    }, function () {
      util.toast("数据请求失败");
    });
  }
})