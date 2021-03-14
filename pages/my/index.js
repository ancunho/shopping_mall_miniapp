const wechat = require("../../utils/wechat");
const util = require("../../utils/util")

Page({
	data: {

	},
	onShow() {
		this.getTabBar().setData({
			active: 2,
			cartCount : wx.getStorageSync('cart').length
		})
	},
	onClickRegister: function (event) {
		wx.navigateTo({
			url: '/pages/customer/register'
		})
	}
})