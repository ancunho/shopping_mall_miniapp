Page({
  data: {
    cartItems:[],
    total:0,
    isCheckAll : false
  },
  onShow() {
      var cartItems = wx.getStorageSync('cart') || [];
      wx.removeStorageSync('buyItems');
      this.setData({
          cartItems : cartItems
      });
      this.getTabBar().setData({
          active: 1,
          cartCount : cartItems.length
      })

      this.setTotalPrice();
  },
  onQtyChange(e) {
      var cartItems = this.data.cartItems;
      var index = e.currentTarget.dataset.index;
      var quantity = e.detail;
      cartItems[index].QUANTITY = quantity;
      // if(qty == 0) {
      //     cartItems.splice(index,1);
      // }
      this.setData({
          cartItems : cartItems
      });
      wx.setStorageSync('cart', cartItems);
      this.setTotalPrice();
      this.getTabBar().setData({
          cartCount : cartItems.length
      })
  },
  setTotalPrice() {
      var cartItems = this.data.cartItems;
      var total = 0;
      for (var i = 0; i < cartItems.length; i++) {
          if (cartItems[i].checked == true) {
            total += cartItems[i].PRICE * cartItems[i].QUANTITY;
            total = total;
          }
      };
      this.setData({
          total : total
      });
  },
  onSubmit() {
      var cartItems = this.data.cartItems;
      var buyItems = [];
      for (var i = 0; i < cartItems.length; i++) {
          if (cartItems[i].checked == true) {
            buyItems.push(cartItems[i]);
          }
      };
      if(buyItems.length > 0) {
          wx.setStorageSync('buyItems', buyItems);
          wx.navigateTo({
            url: '/pages/pay/index'
          })
      } else {
          wx.removeStorageSync('buyItems');
          wx.showToast({ title: '请选择购买商品！', icon: 'none', duration: 1500 });
      }
    
  },
  onHandlerCheckAll(e) {
      var cartItems = this.data.cartItems;
      var isCheckAll = this.data.isCheckAll;
      isCheckAll = !isCheckAll;
      for (var i = 0; i < cartItems.length; i++) {
          cartItems[i].checked = isCheckAll;
      }
      this.setData({
          cartItems : cartItems,
          isCheckAll : isCheckAll
      });
      this.setTotalPrice();
  },
  onHandlerCheckOne(e) {
      var cartItems = this.data.cartItems;
      var index = e.currentTarget.dataset.index;
      var checked = cartItems[index].checked;
      cartItems[index].checked =! checked;
      this.setData({
          cartItems : cartItems
      });
      this.setTotalPrice();
  },
  onHandlerDeleteChekcked(e) {
      var cartItems = this.data.cartItems;
      for (var i = 0; i < cartItems.length; i++) {
          if(cartItems[i].checked) {
              cartItems.splice(i,1);
          }
      };
      this.setData({
          cartItems : cartItems
      });
      wx.setStorageSync('cart', cartItems);
      this.setTotalPrice();
  }
})
