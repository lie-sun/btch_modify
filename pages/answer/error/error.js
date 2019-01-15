// pages/select/subject/subject.js
var util = require('../../../utils/util.js');
var apiUrl = 'https://batu.bchltech.cn/BaTuMapping/app/';
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    chapter: null,
    subject: [],
    topicCount: 0,
    $index: 0,
    txt: '下一题',
    prev: '上一题',
    mode: 1,
    backAnswer: false,
    flag: false,
    disabled: false,
    panelShow: true,
    currentTopic: 1,
    selectTopicArray: [],
    correctTopicArray: [],// 正确
    recordCorrectTopicID: [],
    yes: 0,
    no: 0,
    topicPic: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      topicPic: app.globalData.topicPic
    })
    // 获取题目
    this.getOrderTopic();
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

  answerMode: function () {
    this.setData({
      mode: 1,
      flag: false,
      backAnswer: false
    })
  },

  bakeMode: function () {
    this.setData({
      mode: 2,
      flag: true,
      backAnswer: true
    })
  },

  selectTopic: function () {
    this.setData({
      panelShow: false,
      currentTopic: this.data.$index
    })
  },

  closeSelectPanel: function () {
    this.setData({
      panelShow: true
    })
  },

  selectToTopic: function (e) {
    if (this.data.selectTopicArray[this.data.$index]) {
      this.setData({
        flag: true
      })
    }
    var index = e.currentTarget.dataset.index;
    if (index + 1 == this.data.subject.length) {
      this.setData({
        txt: '提交错题'
      })
    }
    this.setData({
      $index: index,
      panelShow: true
    })
  },

  goPrevTopic: function () {
    var index = this.data.$index - 1;
    if (index < 0) {
      wx.navigateBack()
      return;
    }
    this.setData({
      $index: index,
      txt: '下一题'
    })
  },

  goNextTopic: function () {
    if (!this.data.selectTopicArray[this.data.$index] && !this.data.backAnswer) {
      util.toast('请选择答案')
      return;
    }
    this.setData({
      prev: '上一题'
    })
    var index = this.data.$index + 1;
    if (index > this.data.subject.length - 1) {
      // 提交对题
      var that = this;

      wx.showModal({
        title: '温馨提示',
        content: '是否在错题练习中移除您已经答对的题目？',
        success: function (res) {
          if (res.confirm) {
            var errorArr = that.data.recordCorrectTopicID;
            var url = `${apiUrl}question/error`;
            var data = {
              quids: errorArr.toString()
            };
            util.req(url, 'DELETE', data, function (data) {
              if (data.ret == 0) {
                util.toast('提交成功', 'success');
              }
            }, function () {
              util.toast("数据请求失败")
            });
            return;
          }

          if (res.cancel) {
            return;
          }
        }
      })
      return;
    }
    if (index == this.data.subject.length - 1) {
      this.setData({
        $index: index,
        txt: '提交错题'
      })
      return;
    }

    if (!this.data.backAnswer) {
      this.setData({
        $index: index,
        flag: false
      })
    } else {
      this.setData({
        $index: index,
        flag: true
      })
    }
  },

  getOrderTopic: function () {
    var that = this;
    var order = wx.getStorageSync('ORDERERRORID');
    var random = wx.getStorageSync('RANDOMERRORID');
    var section = wx.getStorageSync('SECTIONRRORID');
    var semulation = wx.getStorageSync('SIMUERRORID');

    order = order ? order : [];
    random = random ? random : [];
    section = section ? section : [];
    semulation = semulation ? semulation : [];

    var subject = [];
    subject = [...order, ...random, ...section, ...semulation];
    
    subject = util.fmtArray(subject);

    if (subject.length == 0) {
      that.getServerTopic();
      return;
    }
    that.setStorageServer(subject);
  },

  setStorageServer: function (errorArr) {
    var that = this;
    var url = `${apiUrl}question/error`;
    var data = {
      quids: errorArr.toString()
    };
    util.req(url, 'POST', data, function(data) {
      if (data.ret == 0 ){
        that.getServerTopic();
        // 清除缓存
        wx.removeStorageSync('ORDERERRORID');
        wx.removeStorageSync('RANDOMERRORID');
        wx.removeStorageSync('SECTIONRRORID');
        wx.removeStorageSync('SIMUERRORID');
      }
    }, function() {
      util.toast("数据请求失败")
    });
  },

  getServerTopic: function () {
    var that = this;
    var url = `${apiUrl}question/error`;
    util.req(url, 'GET', {}, function (data) {
      if (data.ret == 0) {
        if (data.body.length == 0) {
          util.toast('您还没有错题');
          return;
        }
        that.setData({
          subject: data.body,
          topicCount: data.body.length
        })
      } else {
        util.toast(data.msg)
      }
    })
  },

  radioChange: function (e) {
    var index = e.currentTarget.dataset.index;
    var correct = this.data.subject[index].correct;
    var selectTopicArray = this.data.selectTopicArray;
    var id = this.data.subject[index].id;
    var recordCorrectTopicID = this.data.recordCorrectTopicID;

    selectTopicArray[index] = e.detail.value;

    // 记录错题ID
    if (e.detail.value != correct) {
      // 记录错题数
      var error_count = this.data.no;
      error_count++;

      var correctTopicArray = this.data.correctTopicArray;
      correctTopicArray[index] = 0;

      this.setData({
        no: error_count,
        correctTopicArray: correctTopicArray
      })
    } else {
      // 记录正确题数
      var correct_count = this.data.yes;
      correct_count++;

      var correctTopicArray = this.data.correctTopicArray;
      correctTopicArray[index] = 1;

      recordCorrectTopicID.push(id);

      this.setData({
        yes: correct_count,
        correctTopicArray: correctTopicArray,
        recordCorrectTopicID: recordCorrectTopicID
      })

      // 自动跳转下一题
      setTimeout(() => {
        this.goNextTopic();
      }, 400)
    }

    this.setData({
      disabled: true,
      flag: true,
      selectTopicArray: selectTopicArray
    })
  }
})