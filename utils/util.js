var app = getApp();

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 手机号格式化
const fmtPhoneNumber = n => {
  var reg = /^1[3456789]\d{9}$/;
  if (!reg.test(n)) {
    wx.showToast({
      title: '请输入正确手机号',
      icon: 'none',
      duration: 1200
    })
    return false;
  }
  return true;
}

// 请求封装
const req = (url, method, data, success, fail, loading, complete) => {

  if (!loading) {
    wx.showLoading({
      title: '数据加载中...',
    })
  }

  var header = method == 'GET' ? 'application/json' : 'application/x-www-form-urlencoded;charset=utf-8';
  var Cookie = wx.getStorageSync('TOKEN');

  wx.request({
    url: url,
    method: method,
    data: data,
    header: {
      'Content-Type': header,
      'Cookie': Cookie
    },
    success: function (res) {
      if (res.statusCode == 200) {
        success && success(res.data);
      }
    },
    fail: function () {
      fail && fail();
    },
    complete: function () {
      if (!loading) {
        wx.hideLoading();
      }
      complete && complete();
    }
  })
}

// 格式化期数
const fmtTerm = n => {
  var chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  var chnUnitSection = ["", "万", "亿", "万亿", "亿亿"];
  var chnUnitChar = ["", "十", "百", "千"];
  var strIns = '', chnStr = '';
  var unitPos = 0;
  var zero = true;
  while (n > 0) {
    var v = n % 10;
    if (v === 0) {
      if (!zero) {
        zero = true;
        chnStr = chnNumChar[v] + chnStr;
      }
    } else {
      zero = false;
      strIns = chnNumChar[v];
      strIns += chnUnitChar[unitPos];
      chnStr = strIns + chnStr;
    }
    unitPos++;
    n = Math.floor(n / 10);
  }
  return chnStr;
}

// 提示
const toast = (str, flag='none') => {
  wx.showToast({
    title: str,
    icon: flag,
    duration: 1200
  })
}

// 数组去重
const fmtArray = arr => {
  var str = [];
  for(var i = 0; i < arr.length; i++) {
    if (str.indexOf(arr[i]) == -1) {
      str.push(arr[i]);
    }
  }
  return str;
}

// 格式化产品参数和配置详情
const fmtConfig = str => {
  var configArr = str.split('，');
  for (var i = 0; i < configArr.length; i++) {
    configArr[i] = configArr[i].replace(/\=/, '：');
  }
  return configArr;
}

// 格式化日期yyyy-mm-dd
const fmtDate = (date) => {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  month < 10 ? "0" + month : month;
  day < 10 ? "0" + day : day;

  return year + "-" + month + "-" + day;
}

module.exports = {
  formatTime,
  fmtPhoneNumber,
  req,
  toast,
  fmtTerm,
  fmtArray,
  fmtConfig,
  fmtDate
}
