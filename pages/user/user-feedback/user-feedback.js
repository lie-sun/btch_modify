// pages/user/user-feedback/user-feedback.js
var util = require('../../../utils/util.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rules: [
      {
        id: "1",
        desc: "首先感谢您提交的宝贵意见和建议。"
      },
      {
        id: "2",
        desc: "每月进行一次评选，对好的建议者给予一定奖励。"
      },
      {
        id: "3",
        desc: "每月开展一次抽奖，对参与的幸运者给予一定奖励。"
      },
      {
        id: "4",
        desc: "并及时公布中奖结果及名单。"
      },
      {
        id: "5",
        desc: "欢迎大家积极参与，使平台更加完善，更好的为更多的同仁服务。"
      },
      {
        id: "6",
        desc: "本活动的最终解释权归“巴图测绘”所有。"
      },
    ],
    winners:[],
    disabled: false,
    loading: false,
    OSSKey: {
      accessid: '',
      policy: '',
      signature: '',
      dir: ''
    },
    uploadImageUrls: [],
    uploadFlag: false,
    userView: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    this.getUserWinners();
  },

  getUserWinners: function() {
    var that = this;
    var url = `${app.apiUrl}lucky/list`;
    util.req(url, 'GET', {}, function(data) {
      for (var i = 0; i < data.length; i++) {
        data[i].id = util.fmtTerm(data[i].id);
        data[i].date = data[i].date.split(".")[0];
      }
      that.setData({
        winners: data
      })
    }, function() {
      util.toast("获取中奖名单失败")
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

  inputUserView: function (e) {
    this.setData({
      userView: e.detail.value
    })
  },

  // 用户意见
  formSubmit: function (e) {
    var that = this;
    if (that.data.userView == "") {
      util.toast('请填写您的意见');
      return;
    }
    if (that.data.userView.length < 5) {
      util.toast('长度不能少于5个字符');
      return;
    }

    var url = `${app.apiUrl}annex/feedback`;
    
    var data = {
      content: that.data.userView,
      imgs: JSON.stringify(that.data.uploadImageUrls)
    };

    that.setData({
      loading: true,
      disabled: true
    })
    util.req(url, 'POST', data, function(data) {
      if (data.ret == 0) {
        util.toast('提交成功', 'success');
        that.setData({
          userView: ''
        })
      } else {
        util.toast(data.body);
      }
    }, function() {
      util.toast('接口请求失败');
    }, true, function() {
      that.setData({
        loading: false,
        disabled: false
      })
    });
  },

  onUploadUrl: function (data) {
    this.setData({
      uploadImageUrls: data.detail.url,
      uploadFlag: data.detail.flag
    })
  }
})