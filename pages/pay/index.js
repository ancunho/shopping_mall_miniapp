const wechat = require("../../utils/wechat");
const util = require("../../utils/util");
import area from '../../static/js/area.js';
const app = getApp();
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';

Page({
	data: {
		payErrorPopup: false,
		showPayDialog: false,
		ORDER_NO: '',
		TOTAL_PAYMENT: 0,
		buyItems: [],
		ship: '',
		newShipButton: false,
		cartTotalPrice: 0,
		cartVO: {},
		comment: '',
		editActive: false,
		areaActive: false,
		areaList: area,
		receiverName: '',
		receiverMobile: '',
		receiverProvince: '',
		receiverCity: '',
		receiverDistrict: '',
		receiverAddress: '',
		isDefault: 1
	},
	loadDefaultShip() {
		var customerInfo = wx.getStorageSync('customerInfo');
		var self = this;
		var defaultShip;
		wx.removeStorageSync('defaultShip');

		wx.request({
			url: util.serverUrl + '/api/miniapp/shipping/default?userId=' + customerInfo.id,
			method: "GET",
			success: function (res) {
				console.log(res.data.data);
				defaultShip = res.data.data;
				self.setData({
					ship: defaultShip
				})
			},
			fail: function (res) {
				console.log(res);

			}
		});
		wx.setStorageSync('defaultShip', defaultShip);
		return defaultShip;
	},
	onShow() {
		var self = this;
		var customerInfo = wx.getStorageSync('customerInfo');
		var buyItems = wx.getStorageSync('buyItems');
		var defaultShip;//wx.getStorageSync('defaultShip');
		var currentShip = wx.getStorageSync('currentShip') == "" ? "" : wx.getStorageSync('currentShip');

		wx.removeStorageSync('defaultShip');
		wx.request({
			url: util.serverUrl + '/api/miniapp/shipping/default?USER_SEQ=' + customerInfo.USER_SEQ,
			method: "GET",
			success: function (res) {
				defaultShip = res.data.data;
				wx.setStorageSync('defaultShip', defaultShip);
				if (currentShip != "") {
					self.setData({
						ship: currentShip
					});
				} else {
					if (defaultShip == null) {
						self.setData({
							newShipButton: true,
						});
					} else {
						self.setData({
							ship: defaultShip
						});
					}
				}

				var cartTotalPrice = 0;
				var deliveryUnitPrice = 0;
				var deliveryTotalPrice = 0;
				var discountPrice = 0;
				for (var i = 0; i < buyItems.length; i++) {
					if(buyItems[i].ATTRIBUTE == '01') {
						if (self.data.ship.RECEIVER_PROVINCE == "上海市"
							|| self.data.ship.RECEIVER_PROVINCE == "江苏省"
							|| self.data.ship.RECEIVER_PROVINCE == "浙江省") {
							//浙江沪地区每公斤1元物流费用
							deliveryUnitPrice = 1;
							deliveryTotalPrice += deliveryUnitPrice * Number(buyItems[i].WEIGHT) * buyItems[i].QUANTITY;
						} else {
							//非浙江沪每公斤2元物流费用
							deliveryUnitPrice = 2;
							deliveryTotalPrice += deliveryUnitPrice * Number(buyItems[i].WEIGHT) * buyItems[i].QUANTITY;
						}
						if(buyItems[i].PACKAGE_CODE == "02") {
							if(buyItems[i].QUANTITY >= 3 && buyItems[i].QUANTITY < 5) {
								//整袋超过3袋 - 包邮
								deliveryTotalPrice = 0;
							} else if (buyItems[i].QUANTITY >= 5) {
								//整袋超过5袋 - 每公斤减2元，同时包邮
								deliveryTotalPrice = 0;
								discountPrice += -2 * Number(buyItems[i].WEIGHT) * buyItems[i].QUANTITY;
							}
						}
						cartTotalPrice += (buyItems[i].PRICE * buyItems[i].QUANTITY + deliveryTotalPrice + discountPrice) * 100;
						deliveryTotalPrice = 0;
						discountPrice = 0;
					} else if (buyItems[i].ATTRIBUTE == '02') {
						cartTotalPrice += (buyItems[i].PRICE * buyItems[i].QUANTITY) * 100;
					}
				}

				console.log(cartTotalPrice);
				self.setData({
					cartTotalPrice: cartTotalPrice,
					buyItems: buyItems
				});

			},
			fail: function (res) {
				console.log(res);
			}
		});
	},
	onSubmit() {
		var _this = this;
		var cartProductVoList = wx.getStorageSync('buyItems');
		var customerInfo = wx.getStorageSync('customerInfo');
		var ship = this.data.ship;

		if (ship == null || ship == "") {
			wx.showToast({
				title: '请输入地址', icon: 'none'
			});
		} else {
			var userId = customerInfo.USER_SEQ;
			var shippingId = ship.SHIPPING_SEQ;
			var cartTotalPrice = _this.data.cartTotalPrice;
			var comment = _this.data.comment;

			var cartVO = {
				cartProductVOList: cartProductVoList,
				USER_SEQ: userId,
				COMMENT: comment,
				SHIPPING_SEQ: shippingId,
				CART_TOTAL_PRICE: parseFloat(cartTotalPrice / 100)
			};
			_this.requestCreateOrder(cartVO);
		}


	},
	requestCreateOrder(cartVO) {
		wx.showLoading({ title: '正在生成订单', mask: true })
		var _this = this;
		console.log(cartVO);
		wx.request({
			url: util.serverUrl + '/api/miniapp/order/create',
			method: "POST",
			data: cartVO,
			success: function (res) {
				console.log(res);
				//res.data.orderNo 
				wx.hideLoading();
				if (res.data.status == 0) {
					_this.setData({
						showPayDialog: true,
						ORDER_NO: res.data.data.ORDER_NO,
						TOTAL_PAYMENT: res.data.data.PAYMENT.toString()
					});
					Dialog.confirm({
						title: '提示',
						message: '如有改价意向， 请联系客户。确认无误继续支付',
					})
						.then(() => {
							wx.showLoading({ title: '正在支付', mask: true });
							var openId = wx.getStorageSync('openId');
							var orderNo = _this.data.ORDER_NO;
							var totalPayment = _this.data.TOTAL_PAYMENT;
							var params = {
								openId: openId,
								orderNo: orderNo,
								totalPayment: totalPayment,
								productName: 'Stronghold咖啡豆产品'
							}
							
							wx.request({
								url: util.serverUrl + '/api/miniapp/order/pay',
								method: 'POST',
								data: JSON.stringify(params),
								success: function (response) {
									wx.hideLoading();
									if (response.statusCode !== 200) {
										_this.setData({
											payErrorPopup: true
										})
									} else {
										wx.requestPayment({
											timeStamp: response.data.data.timeStamp,
											nonceStr: response.data.data.nonceStr,
											package: response.data.data.package,
											signType: 'MD5',
											paySign: response.data.data.paySign,
											success(result) {
												console.log(result);
												//微信支付结束，把订单状态改一下
												wx.showLoading({ title: '正在更改订单状态', mask: true });
												wx.request({
													url: util.serverUrl + '/api/miniapp/order/pay_success?ORDER_NO=' + orderNo,
													method: "POST",
													success: function (payResult) {
														console.log(payResult);
														wx.hideLoading();
														wx.switchTab({
															url: '/pages/my/index',
														})
													},
													fail: function (err) {
														console.log(err);
													}
												})
	
											},
											fail(result) {
												wx.hideLoading();
												console.log("统一下单接口失败");
											}
										});
									}
								


								},
								fail(result) {
									wx.hideLoading({
										success: (res) => {
											wx.showToast({
												title: '错误！',
											})
										},
									})
								}
							});
						})
						.catch(() => {
							// on cancel
						});
				}
			},
			fail: function (res) {
				wx.hideLoading();
				console.log(res);
			}
		})
	},
	onAddNewShipHandler: function (e) {

	},

	onClickToAdd(e) {
		this.setData({
			editActive: true
		});
	},
	showArea() {
		this.setData({
			areaActive: true
		});
	},
	cancelEdit() {
		this.setData({
			editActive: false
		});
	},
	closeArea() {
		this.setData({
			areaActive: false
		});
	},
	confirmArea(event) {
		this.setData({
			areaValue: event.detail.values[0].name + event.detail.values[1].name + event.detail.values[2].name,
			areaActive: false,
			receiverProvince: event.detail.values[0].code,
			receiverCity: event.detail.values[1].code,
			receiverDistrict: event.detail.values[2].code,
		});
	},
	onIsDefaultHandler: function ({ detail }) {
		console.log({ detail });
		this.setData({
			isDefault: detail
		});
	},
	onEditShipHandler: function (e) {
		var _this = this;
		var customerInfo = wx.getStorageSync('customerInfo');
		var shipVO = {};
		shipVO.USER_SEQ = customerInfo.USER_SEQ;
		shipVO.RECEIVER_NAME = this.data.receiverName;
		shipVO.RECEIVER_PHONE = this.data.receiverPhone;
		shipVO.RECEIVER_MOBILE = this.data.receiverPhone;
		shipVO.RECEIVER_PROVINCE = this.data.receiverProvince;
		shipVO.RECEIVER_CITY = this.data.receiverCity;
		shipVO.RECEIVER_DISTRICT = this.data.receiverDistrict;
		shipVO.RECEIVER_ADDRESS = this.data.receiverAddress;
		shipVO.RECEIVER_ZIP = "";
		shipVO.isDefault = this.data.isDefault;
		shipVO.OPTION01 = "";
		shipVO.OPTION02 = "";
		shipVO.OPTION03 = "";
		shipVO.OPTION04 = "";
		shipVO.OPTION05 = "";
		if (this.data.isDefault) {
			shipVO.IS_DEFAULT = "1";
		} else {
			shipVO.IS_DEFAULT = "0";
		}
		if (shipVO.USER_SEQ == null) {
			wx.showToast({
				title: '请先登录', icon: "none"
			})
			return;
		} else {
			if (shipVO.RECEIVER_NAME == "") { wx.showToast({ title: '收货人不能为空', icon: "none" }); return; }
			if (shipVO.RECEIVER_PHONE == "") { wx.showToast({ title: '手机号不能为空', icon: "none" }); return; }
			if (shipVO.RECEIVER_PROVINCE == "") { wx.showToast({ title: '城市不能为空', icon: "none" }); return; }
			if (shipVO.RECEIVER_ADDRESS == "") { wx.showToast({ title: '详细地址不能为空', icon: "none" }); return; }

			wx.request({
				url: util.serverUrl + '/api/miniapp/shipping/add',
				method: "POST",
				data: shipVO,
				success: function (res) {
					if (res.data.status == 0) {
						var customerInfo = wx.getStorageSync('customerInfo');
						var self = this;
						var defaultShip;
						wx.removeStorageSync('defaultShip');
						wx.request({
							url: util.serverUrl + '/api/miniapp/shipping/default?userId=' + customerInfo.id,
							method: "GET",
							success: function (res) {
								console.log(res.data.data);
								defaultShip = res.data.data;
								_this.setData({
									newShipButton: false,
									ship: defaultShip
								})
							},
							fail: function (res) {
								console.log(res);

							}
						});
						wx.setStorageSync('defaultShip', defaultShip);
					}
				},
				fail: function (res) {
					console.log(res);
					wx.showToast({ title: '出错！', icon: 'none' })
				}

			})
		}

	},

	onPayClose: function (event) {
		console.log(event);
	},
	onPayConfirm: function () {
		var _this = this;
		wx.showLoading({ title: '正在支付', mask: true });
		var openId = wx.getStorageSync('openId');
		var orderNo = _this.data.ORDER_NO;
		var totalPayment = _this.data.TOTAL_PAYMENT;
		wx.request({
			url: util.serverUrl + '/api/miniapp/order/pay?openId=' + openId + '&orderNo=' + orderNo + '&totalPayment=' + totalPayment + '&productName=11111',
			method: "GET",
			data: {
				openId: openId,
				orderNo: orderNo,
				totalPayment: totalPayment,
				productName: '111'
			},
			header: {
				'content-type': 'application/texts'
			},
			success: function (response) {
				console.log(response);
				// wx.requestPayment({
				// 	timeStamp: response.data.data.timeStamp,
				// 	nonceStr: response.data.data.nonceStr,
				// 	package: response.data.data.package,
				// 	signType: 'MD5',
				// 	paySign: response.data.data.paySign,
				// 	success(result) {
				// 		console.log(result);
				// 		//微信支付结束，把订单状态改一下
				// 		wx.request({
				// 			url: util.serverUrl + '/api/miniapp/order/pay_success?ORDER_NO=' + orderNo,
				// 			method: "POST",
				// 			success: function (payResult) {
				// 				console.log(payResult);
				// 				wx.hideLoading();
				// 				wx.switchTab({
				// 					url: '/pages/my/index',
				// 				})
				// 			},
				// 			fail: function (err) {
				// 				console.log(err);
				// 			}
				// 		})

				// 	},
				// 	fail(result) {
				// 		wx.hideLoading();
				// 		console.log("统一下单接口失败");
				// 	}
				// });
			},
			fail(result) {
				wx.hideLoading({
					success: (res) => {
						wx.showToast({
							title: '错误！',
						})
					},
				})
			}
		});
	},


	onClosePopup: function (event) {
        var self = this;
        self.setData({
            payErrorPopup: false
        })
    },

})
