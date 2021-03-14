Page({
  data: {
      wechat1 : 'jiagou',

  },
  copy : function(e) {
      var _this = this;
      wx.setClipboardData({
        data: _this.data.wechat1,
        success (res) {
          wx.getClipboardData({
            success (res) {
              console.log(res.data) // dat
            }
          })
        }
      })
  }
})
