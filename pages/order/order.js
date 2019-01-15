//Page Object
var app = getApp();
var util = require("../../utils/util.js");
Page({
    data: {
        img: "", //图片
        type: "", //产品
        city: "", //城市
        factory: "", //厂家
        model: "", //型号
        number: 1, //数量
        usenumber: 1, //数量
        rent_day: "", //日租金
        deposit: "", //押金
        method: '收货',
        totalmoney: 0, //总金额
        selectedItem: 0, //送货自取
        shaddress: "",
        harvestAddress: "", //收获地址
        pickAddress: "", //取货地址
        timelong: 1, //时长
        startTime: '', //时长
        endTime: '', //时长
        openid: "", //openid
        userid: "", //用户id
    },
    //options(Object)
    onLoad: function (options) {
        // 获取产品详情
        var that = this;
        new Promise(function (resolve, reject) {
            console.log('1');
            wx.getStorage({
                key: 'productInfo',
                success: (result) => {
                    that.setData({
                        img: result.data.img,
                        type: result.data.type,
                        city: result.data.city,
                        factory: result.data.factory,
                        model: result.data.model,
                        rent_day: result.data.rent_day,
                        number: result.data.number,
                        deposit: result.data.deposit,
                        productID: result.data.productID,
                    })
                    resolve();
                },
                fail: () => {},
                complete: () => {}
            });
        }).then(function () {
            console.log('2');
            return new Promise(function (resolve, reject) {
                // 获取租凭时间地址
                wx.getStorage({
                    key: "time_address",
                    success: (res) => {
                        // console.log(res.data);
                        that.setData({
                            harvestAddress: res.data.harvestAddress,
                            pickAddress: res.data.pickAddress,
                            timeLong: res.data.timelong,
                            endTime: res.data.endTime,
                            startTime: res.data.startTime,
                        })
                        resolve();
                    },
                    error: (err) => {
                        console.log(err);
                    }
                });
            })
        }).then(function () {
            console.log('end');
            that.setData({
                totalmoney: that.data.deposit * that.data.usenumber + that.data.rent_day * that.data.usenumber * that.data.timelong
            })
        })




    },
    onReady: function () {

    },
    onShow: function () {

    },
    onHide: function () {

    },

    onShareAppMessage: function () {

    },
    onPageScroll: function () {

    },
    onTabItemTap: function (item) {

    },
    radioChange: function (params) {
        this.setData({
            selectedItem: params.detail.value
        })
    },
    jia: function () {
        if (this.data.usenumber < this.data.number) {
            this.setData({
                usenumber: usenumber++
            })
        }
    },
    jian: function () {
        if (this.data.usenumber > this.data.number) {
            this.setData({
                usenumber: usenumber--
            })
        }
    },
    order: function () {
        var url = `${app.apiUrl2}order/createOrder`;
        var data = {
            productID: this.data.productID,
            productName: this.data.factory + '-' + this.data.type + '-' + this.data.model,
            receiver_type: this.data.selectedItem == 0 ? 4 : 1,
            self_receiver_address: this.data.pickAddress,
            receiver_address: this.data.harvestAddress,
            rent_num: this.data.usenumber,
            rent_days: this.data.timelong,
            rent_start_day: this.data.startTime,
            rent_end_day: this.data.endTime,
            total_deposit: this.data.deposit * this.data.usenumber,
            total_rent_pay: this.data.rent_day * this.data.usenumber * this.data.timelong,
            // total_pay:this.data.totalmoney,
            total_pay: 1 / 100,
        };
        console.log(data);
        util.req(url, 'POST', data, function (data) {

            wx.requestPayment({
                'timeStamp': data.body.timeStamp,
                'nonceStr': data.body.nonceStr,
                'package': data.body.package,
                'signType': 'MD5',
                'paySign': data.body.paySign,
                'success': function (res) {
                    wx.redirectTo({
                        url: "../lnbound/lnbound"
                    })
                    //支付成功后，系统将会调用payResult() 方法，此处不做支付成功验证，只负责提示用户
                },
                'fail': function (res) {
                    //支付失败后，
                }
            })

            var machineArray = [];
            for (var i = 0; i < data.length; i++) {
                machineArray.push(data[i].name);
            }

        }, function () {
            util.toast('请求接口失败')
        });
    },
    /**
     * 时间选择器
     */
    bindDateChange: function (params) {
        var date = new Date(params.detail.value);
        date.setDate(date.getDate() + this.data.timeLong);
        var year1 = date.getFullYear();
        var mon1 = date.getMonth() + 1;
        var day1 = date.getDate();

        var sdate = new Date(params.detail.value);
        sdate.setDate(sdate.getDate() + 1);
        var syear = sdate.getFullYear();
        var smon = sdate.getMonth() + 1;
        var sday = sdate.getDate();
        this.setData({
            startTime: params.detail.value,
            startTime1: syear + '-' + this.formdate(smon) + '-' + this.formdate(sday),
            endTime: year1 + '-' + this.formdate(mon1) + '-' + this.formdate(day1)
        })
    },
    /**
     * 
     * @param {结束时间选择} params 
     */
    bindDateChange1: function (params) {
        console.log(params.detail.value);
        this.setData({
            endTime: params.detail.value
        })
        this.doubleFish(this.data.startTime, this.data.endTime);

    },
    doubleFish: function (start, end) {
        // 获取指定时间时间戳
        // 注1：这里写的是2012年9月1日0时0分0秒
        // 注2：Javascript中月份是实际数字减1
        var targetTime = (new Date(start)).getTime();

        var currentTime = (new Date(end)).getTime();
        // 获取差值，如果指定日期早于现在，则为负数
        var offsetTime = targetTime - currentTime;

        // 求绝对值，获取相差的时间
        offsetTime = Math.abs(offsetTime);

        // 将时间转位天数
        // 注：Javascript中时间戳的单位是毫秒
        var offsetDays = Math.floor(offsetTime / (3600 * 24 * 1e3));
        this.setData({
            timeLong: offsetDays
        })
    },
    formdate: function (e) {
        if (e < 10) {
            return 0 + '' + e;
        } else {
            return e;
        }
    },
});