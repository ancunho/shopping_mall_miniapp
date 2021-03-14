const util = require("./utils/util");

App({
	onLaunch: function () {
		
	},
	globalData: {
		userInfo: null,
		cartItems : util.cartItems
	}
})