var OSSUrl = 'https://image.bchltech.cn';
var util = require('../../utils/util.js');

Component({
  properties: {
    OSSKey: {
      type: Object,
      value: {}
    }
  },
  data: {
    files: [],
    imgCount: 3, // 默认限制图片选择数量
    uploadFlag: false,
    uploadProductUrl: []
  },
  methods: {
    // 本地图片选择
    chooseImage: function (e) {
      var that = this;
      if (this.data.files.length == 3) {
        wx.showToast({
          title: '最多只能添加3张图片喔！',
          icon: 'none',
          duration: 1000
        })
        return;
      }
      var count = this.data.imgCount - this.data.files.length;
      wx.chooseImage({
        count: count,
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          that.setData({
            files: that.data.files.concat(res.tempFilePaths)
          });

          console.log("图片上传路径：" + res.tempFilePaths);

          var imgSrcs = res.tempFilePaths;
          for (var i = 0; i < imgSrcs.length; i++) {
            that.uploadImageOSS(imgSrcs[i]);
          }
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
            var url = `${OSSUrl}/${that.data.OSSKey.dir}${filename}`;
            var uploadProductUrl = that.data.uploadProductUrl;
            uploadProductUrl.push(url);

            that.setData({
              uploadFlag: true, // 上传成功标志
              uploadProductUrl: uploadProductUrl
            });

            // 去除重复的图片地址
            var url = that.data.uploadProductUrl;
            var flag = that.data.uploadFlag;
            that.triggerEvent('uploadUrlArr', {url:url, flag:flag})
            
            util.toast('图片上传成功', 'success');
          } else {
            util.toast('上传失败');
          }
        },
        fail: function (res) {
          util.toast('图片上传失败');
        }
      })

      uploadTask.onProgressUpdate((res) => {
        that.setData({
          uploadGropress: res.progress
        })
      })
    },
    // 选择图片预览
    previewImage: function (e) {
      wx.previewImage({
        current: e.currentTarget.id, // 当前显示图片的http链接
        urls: this.data.files // 需要预览的图片http链接列表
      })
    },
    // 删除选择的图片
    uploaderImageDel: function (e) {
      var imgs = this.data.files;
      var uploadProductUrl = this.data.uploadProductUrl;

      imgs.splice(e.currentTarget.dataset.index, 1);
      uploadProductUrl.splice(e.currentTarget.dataset.index, 1);

      this.setData({
        files: imgs,
        uploadProductUrl: uploadProductUrl
      })
    }
  }
});