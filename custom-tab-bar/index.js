Component({
  data: {
    active: 0,
    cartCount : 0,
    list: [
      {
        "pagePath": "/pages/index/index",
        "text": "首页"
      },
      {
        "pagePath": "/pages/cart/index",
        "text": "购物车"
      },
      {
        "pagePath": "/pages/my/index",
        "text": "我的"
      }
    ]
  },
  attached(e) {
      
  },
  methods: {
    switchTab(event) {
      const activeIndex = event.detail
      const url = this.data.list[activeIndex].pagePath;
      wx.switchTab({url});
      this.setData({
        active: activeIndex
      });
    },
    onChange(e) {
        console.log(e);
    }
  }
})
