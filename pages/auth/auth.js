// pages/auth/auth.js
var util = require('../../utils/util.js');
var app = getApp();
var OSSUrl = 'https://image.bchltech.cn';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    frontFilePaths: [],
    backFilePaths: [],
    uploadGropress: 0,
    uploadBackGropress: 0,
    uploadGropressShow: true,
    uploadGropressBackShow: true,
    accessid: '',
    policy: '',
    signature: '',
    dir: '',
    cardFrontUrl: '',
    cardBackUrl: '',
    submitDisabled: false,
    submitLoading: false,
    uploadFrontFlag: false,// 图片上传OSS成功标志
    uploadBackFlag: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取OSS密钥
    this.getOSSAccessKey();
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

  // 获取OSS密钥
  getOSSAccessKey: function () {
    var that = this;
    var url = `${app.apiUrl}oss/auth`;
    util.req(url, 'GET', {}, function (data) {
      data = data.body;
      that.setData({
        accessid: data.accessid,
        policy: data.policy,
        signature: data.signature,
        dir: data.dir
      })
    }, function () {
      util.toast('数据请求失败');
    }, true);
  },

  formSubmit: function (e) {
    var that = this;
    var ev = e.detail.value;

    if (ev.userName == "") {
      util.toast('请填写真实姓名');
      return;
    }
    if (that.data.frontFilePaths.length == 0) {
      util.toast('请上传身份证正面');
      return;
    }
    if (that.data.backFilePaths.length == 0) {
      util.toast('请上传身份证反面');
      return;
    }
    if (!(that.data.uploadFrontFlag && that.data.uploadBackFlag)) {
      util.toast('身份证上传失败');
      return;
    }
    // 提交服务器
    var url = `${app.apiUrl}auth/realname`;
    var data = {
      name: ev.userName,
      front: that.data.cardFrontUrl,
      back: that.data.cardBackUrl
    };

    that.setData({
      submitDisabled: true,
      submitLoading: true
    })
    util.req(url,'POST', data, function(data) {
      if (data.ret == 0) {
        util.toast(data.body, 'success');
        setTimeout(() => {
          wx.navigateBack()
        }, 2000);
      } else {
        util.toast(data.msg);
      }
    }, function() {
      util.toast('提交认证失败');
    }, true, function() {
      that.setData({
        submitDisabled: false,
        submitLoading: false
      })
    });
  },

  // 上传身份证正面
  uploadCardFront: function () {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          frontFilePaths: res.tempFilePaths
        });

        var imgSrc = res.tempFilePaths[0];
        // 上传OSS
        that.setData({
          uploadGropressShow: false
        })
        // 由于微信小程序生成的临时路径在上传阿里云的时候不需要上传.所以需要对路径进行处理,但是在手机端上传和PC端上传,图片临时路径的前缀不同,所以需要进行分别的处理
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
          formData: {
            name: imgSrc,
            key: `${that.data.dir}${filename}`,
            policy: that.data.policy,
            OSSAccessKeyId: that.data.accessid,
            success_action_status: "200",
            signature: that.data.signature
          },
          success: function (res) {
            if (res.statusCode == 200) {
              that.setData({
                uploadFrontFlag: true,
                cardFrontUrl: `${OSSUrl}/${that.data.dir}${filename}`
              })
              util.toast('上传成功', 'success');
            }
          },
          fail: function (res) {
            console.log(res);
            util.toast("上传失败");
          },
          complete: function () {
            that.setData({
              uploadGropressShow: true
            })
          }
        })

        uploadTask.onProgressUpdate((res) => {
          if (res.progress == 100) {
            that.setData({
              uploadGropressShow: true
            })
          }
          that.setData({
            uploadGropress: res.progress
          })
        })
      }
    })
  },
  // 上传身份证反面
  uploadCardBack: function () {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          backFilePaths: res.tempFilePaths
        });

        var imgSrc = res.tempFilePaths[0];
        
        that.setData({
          uploadGropressBackShow: false
        })

        if (imgSrc.indexOf('http://tmp/') != -1) {
          var filename = imgSrc.replace('http://tmp/', "");
        }
        if (imgSrc.indexOf('wxfile://') != -1) {
          var filename = imgSrc.replace('wxfile://', "");
        }
        //console.log(filename);
        // 图片上传至OSS
        var uploadTask = wx.uploadFile({
          url: OSSUrl,
          filePath: imgSrc,
          name: 'file',
          formData: {
            name: imgSrc,
            key: `${that.data.dir}${filename}`,
            policy: that.data.policy,
            OSSAccessKeyId: that.data.accessid,
            success_action_status: "200",
            signature: that.data.signature
          },
          success: function (res) {
            if (res.statusCode == 200) {
              that.setData({
                uploadBackFlag: true,
                cardBackUrl: `${OSSUrl}/${that.data.dir}${filename}`
              })
              util.toast('上传成功', 'success');
            }
          },
          fail: function (res) {
            util.toast('上传失败');
          },
          complete: function () {
            that.setData({
              uploadGropressBackShow: true
            })
          }
        })

        uploadTask.onProgressUpdate((res) => {
          if (res.progress == 100) {
            that.setData({
              uploadGropressBackShow: true
            })
          }
          that.setData({
            uploadBackGropress: res.progress
          })
        })
      }
    })
  }
})