// pages/select/subject/subject.js
var util = require('../../../../utils/util.js');
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
    recordCorrectTopicID: [],
    errorTopicIndex: [],
    isLastTopic: false,
    score: 0,// 分数
    perTopic: 2,// 每道题分数
    correctCount: 0,// 正确题数
    errorCount: 0,// 错误题数
    topicPic: '',
    recordErrorTopicID: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      topicPic: app.globalData.topicPic
    })
    // 获取题目
    var id = parseInt(options.id);
    var pageShow = parseInt(options.pageShow);

    this.getSimulationTopic(id, pageShow);
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

  getSimulationTopic: function (id, pageShow) {
    var that = this;
    var url = `${apiUrl}question?page=${id}&pageShow=${pageShow}`;

    util.req(url, 'GET', {}, function (data) {
     
      that.setData({
        subject: data,
        topicCount: data.length
      })
    }, function () {
      util.toast('数据请求错误')
    });
  },

  goPrevTopic: function () {
    var index = this.data.$index - 1;
    if (index < 0) {
      wx.navigateBack()
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
      // 提交试卷
      var correct = this.data.recordCorrectTopicID.length;
      this.setData({
        isLastTopic: true,
        score: this.data.perTopic * correct,
        correctCount: correct,
        errorCount: this.data.topicCount - correct
      })

      this.sendScoreToServer(this.data.score);
      return;
    }

    if (index == this.data.subject.length - 1) {
      this.setData({
        $index: index,
        txt: '提交'
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

  sendScoreToServer: function (score) {
    var that = this;
    var url = `${apiUrl}question/result?${score}`;

    util.req(url, 'POST', {}, function(data) {
      if (data.ret == 0) {
        wx.showModal({
          title: '考试结果',
          content: '总分：' + that.data.score + '；' + '正确题目数：' + that.data.correctCount + '；' + '错题数目：' + that.data.errorCount,
        });

        that.setStorageErrorTopic();
      } else {
        util.toast(data.msg)
      }
    },function() {
      util.toast('数据请求错误')
    });
  },

  setStorageErrorTopic: function () {
    var errorTopic = [];
    var errorTopicIndex = this.data.errorTopicIndex;// 存放错题
    for (var i = 0; i < errorTopicIndex.length; i++) {
      errorTopic.push(this.data.subject[errorTopicIndex[i]]);
    }
    wx.setStorage({
      key: 'error_topic',
      data: errorTopic
    })
  },

  radioChange: function (e) {
    var index = e.currentTarget.dataset.index;
    var correct = this.data.subject[index].correct;
    var selectTopicArray = this.data.selectTopicArray;
    var id = this.data.subject[index].id;
    var recordCorrectTopicID = this.data.recordCorrectTopicID;
    var errorTopicIndex = this.data.errorTopicIndex;
    var recordErrorTopicID = this.data.recordErrorTopicID;

    // 记录正确题目ID
    if (e.detail.value == correct) {
      recordCorrectTopicID.push(id);
      this.setData({
        recordCorrectTopicID: recordCorrectTopicID
      })
    } else {
      recordErrorTopicID.push(id);
      errorTopicIndex.push(index);

      this.setData({
        errorTopicIndex: errorTopicIndex,
        recordErrorTopicID: recordErrorTopicID
      });

      var error = wx.getStorageSync('SIMUERRORID');
      if (error) {
        var data = error.concat(this.data.recordErrorTopicID);
        data = util.fmtArray(data);
        wx.setStorage({
          key: 'SIMUERRORID',
          data: data
        })
      } else {
        wx.setStorage({
          key: 'SIMUERRORID',
          data: this.data.recordErrorTopicID
        })
      }
    }

    selectTopicArray[index] = e.detail.value;

    this.setData({
      disabled: true,
      flag: true,
      selectTopicArray: selectTopicArray
    });

    // 自动进入下一题
    setTimeout(() => {
      this.goNextTopic();
    }, 400)
  },

  checkErrorTopic: function (){
    wx.navigateTo({
      url: '../error-topic/error-topic',
    })
  }
})