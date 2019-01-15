var util = require("../../utils/util.js");
var app = getApp();
Page({
    data: {
        productID: '', //商品id
        imgUrls: [], //轮播图
        indicatorDots: true,
        autoplay: true,
        interval: 5000,
        duration: 1000,
        number: 1, //数量
        city: '', //城市
        model: '', //模型
        factory: "", //厂家
        rent_day: "", //日租金
        type: "", //仪器
        deposit: "", //押金
        attr: "", //清单
        prop: "", //参数
        activeIndex: 1



    },
    onLoad: function (options) {
        wx.getStorage({
            key: 'productInfo',
            success: (result) => {
                console.log(result.data);
                this.setData({
                    imgUrls: [result.data.img],
                    number: result.data.number,
                    productID: result.data.productID,
                    city: result.data.city,
                    model: result.data.model,
                    deposit: result.data.deposit,
                    factory: result.data.factory,
                    rent_day: result.data.rent_day,
                    type: result.data.type,
                    attr: result.data.attr,
                    prop: result.data.prop,

                })
            },
            fail: () => {},
            complete: () => {}
        });
    },
    onShow: function () {

    },
    onHide: function () {

    },
    tabclick: function (params) {
        if (this.data.activeIndex != params.currentTarget.dataset.index) {
            this.setData({
                activeIndex: params.currentTarget.dataset.index
            })
        }
    },

    // 跳转到下单页面
    clickToOrder: function (params) {
        // 验证是否实名认证

        var url = `${app.apiUrl}auth`;
        var that = this;

        util.req(url, 'GET', {}, function (data) {

            if (data.ret == 0) {
                var phoneAuth = data.body.phoneAuth,
                    realnameAuth = data.body.realnameAuth,
                    enterpriseAuth = data.body.enterpriseAuth;

                if (!(phoneAuth == 1 && realnameAuth == 1)) {
                    // 未实名认证
                    wx.navigateTo({
                        url: '/pages/cert/cert',
                    })
                }

                if (phoneAuth == 1 && realnameAuth == 1) {
                    wx.navigateTo({
                        url: "/pages/order/order"
                    })
                }
            } else {
                util.toast(data.body);
            }
        }, function () {
            util.toast('接口请求失败')
        });
    },
    onShareAppMessage: function () {

    }
});