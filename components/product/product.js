const app = getApp();
const util = require("../../utils/util.js");

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
      // 先检查是否个人认证
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
            // 已实名认证
            var goodsId = e.currentTarget.dataset.goodsid;
            wx.navigateTo({
              url: '/pages/rent/rent-detail/rent-detail?id=' + goodsId,
            })
          }
        } else {
          util.toast(data.body);
        }
      }, function () {
        util.toast('接口请求失败')
      });
    }
  }
})