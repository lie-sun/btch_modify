  // pages/select/subject/subject.js
var util = require('../../../utils/util.js');
var currentPage = 1;
var pageShow = 50;
var pageCount = 0;
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
    recordErrorTopicID: [],
    correctTopicArray: [],// 正确
    yes: 0,
    no: 0,
    totalRecords: 0,
    isHasTopic: true,
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
    if (options.area) {
      this.getServerTopic(options.area);
    } else {
      this.getServerTopic();
    }
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
        txt: '返回'
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
      wx.navigateBack()
      return;
    }
    if (index == this.data.subject.length - 1) {
      this.setData({
        $index: index,
        txt: '返回'
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

  getServerTopic: function (area) {
    var that = this;
    
    if (area) {
      var topic = wx.getStorageSync('TOPIC');
      that.setData({
        subject: topic,
        $index: parseInt(area),
        topicCount: topic.length
      })
      currentPage = parseInt((topic.length + pageShow - 1) / pageShow);
      return;
    }
    that.getAllTopicRecords();
  },

  getAllTopicRecords: function () {
    var that = this;
    var url = `${apiUrl}question?page=${currentPage}&pageShow=${pageShow}`;

    util.req(url, 'GET', {}, function (data) {
      if (data.length == 0) {
        currentPage = 0;
        that.setData({
          isHasTopic: false
        });
        return;
      }

      var subject = that.data.subject;
      subject = subject.concat(data);

      that.setData({
        subject: subject,
        topicCount: subject.length
      })

      wx.setStorage({
        key: 'TOPIC',
        data: subject,
      })
    }, function () {
      util.toast('数据请求错误')
    }, true);
  },

  radioChange: function (e) {
    var value = e.detail.value;
    var index = e.currentTarget.dataset.index;
    var correct = this.data.subject[index].correct;
    var id = this.data.subject[index].id;
    var selectTopicArray = this.data.selectTopicArray;
    var recordErrorTopicID = this.data.recordErrorTopicID;

    // 每次选择后加载后面的题目
    if (this.data.isHasTopic) {
      currentPage = currentPage + 1;
      this.getAllTopicRecords();
    }

    // 记录答题位置
    wx.setStorage({
      key: 'TOPIC_AREA',
      data: this.data.$index + 1,
    });

    // 记录选择的每一题选择的答案
    selectTopicArray[index] = value;

    // 记录错题ID
    if (value != correct) {
      // 记录错题数
      var error_count = this.data.no;
      error_count++;

      var correctTopicArray = this.data.correctTopicArray;
      correctTopicArray[index] = 0;

      recordErrorTopicID.push(id);
      this.setData({
        no: error_count,
        correctTopicArray: correctTopicArray,
        recordErrorTopicID: recordErrorTopicID
      })

      var error = wx.getStorageSync('ORDERERRORID');
      if (error) {
        var data = error.concat(this.data.recordErrorTopicID);
        data = util.fmtArray(data);
        wx.setStorage({
          key: 'ORDERERRORID',
          data: data
        })
      } else {
        wx.setStorage({
          key: 'ORDERERRORID',
          data: this.data.recordErrorTopicID
        })
      }
    } else {
      // 记录正确题数
      var correct_count = this.data.yes;
      correct_count++;

      var correctTopicArray = this.data.correctTopicArray;
      correctTopicArray[index] = 1;

      this.setData({
        yes: correct_count,
        correctTopicArray: correctTopicArray
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