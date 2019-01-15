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
    tabclick:function (params) {
      if(this.data.activeIndex!=params.currentTarget.dataset.index){
        this.setData({
            activeIndex:params.currentTarget.dataset.index
        })
      }
    },
    onShareAppMessage: function () {

    }
});