Component({
  data: {
    goodsDetail: null // 当前选择商品信息
  },
  properties: {
    product: {
      type: Array,
      value: []
    }
  },
  methods: {
    // 商品详情页
    selectProductTap: function (e) {
      var _this = this;
      var goodsId = e.currentTarget.dataset.goodsid;
      wx.navigateTo({
        url: '/pages/second-mall/second-detail/second-detail?id=' + goodsId,
      })
    }
  }
})