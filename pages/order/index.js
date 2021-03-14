const util = require("../../utils/util");

Page({
	data: {
		tabActive: 'tab1',
		tab1Item: {},
		tab2Item: {},
		tab3Item: {},
		tab4Item: {},
		activeName: '1',
		tabResult: '',
		payErrorPopup: false
	},
	onChange(event) {
		this.setData({
			activeName: event.detail,
		});
	},
	onLoad(option) {
		this.setData({
			tabActive: option.t
		});
		if (option.t == 'tab1') {
			this.onLoadTab1(10);
		} else if (option.t == 'tab2') {
			this.onLoadTab2(40);
		} else if (option.t == 'tab3') {
			this.onLoadTab3(70);
		} else if (option.t == 'tab4') {
			this.onLoadTab4(99);
		}
	},
	onClick(e) {
		if (e.detail.name == 'tab1') {
			this.onLoadTab1(10);
		} else if (e.detail.name == 'tab2') {
			this.onLoadTab2(40);
		} else if (e.detail.name == 'tab3') {
			this.onLoadTab3(0);
		} else if (e.detail.name == 'tab4') {
			this.onLoadTab4(99);
		}
	},
	onLoadTab1: function (status) {
		this.onLoadData(status);
	},
	onLoadTab2: function (status) {
		this.onLoadData(status);
	},
	onLoadTab3: function (status) {
		this.onLoadData(status);
	},
	onLoadTab4: function (status) {
		var items = this.onLoadData(status);
		this.setData({
			tab4Item: items
		});
	},
	onLoadData: function (status) {
		wx.showLoading({
			title: '加载中', icon: 'loading'
		});
		var _this = this;
		var result = "0";
		var status = status;
		var customerInfo = wx.getStorageSync('customerInfo');
		var params = {
			USER_SEQ: customerInfo.USER_SEQ,
			STATUS: status
		}
		wx.request({
			url: util.serverUrl + '/api/miniapp/order/list',
			method: 'POST',
			data: JSON.stringify(params),
			success: function (res) {
				wx.hideLoading();
				console.log(res);
				if (status == 10) {
					_this.setData({
						tab1Item: res.data.data.length == 0 ? [] : res.data.data
					});
				} else if (status == 40) {
					_this.setData({
						tab2Item: res.data.data.length == 0 ? [] : res.data.data
					});
				} else if (status == 0) {
					_this.setData({
						tab3Item: res.data.data.length == 0 ? [] : res.data.data
					});
				} else if (status == 99) {
					_this.setData({
						tab4Item: res.data.data.length == 0 ? [] : res.data.data
					});
				}
			},
			fail: function (res) {
				wx.hideLoading();
			}
		});
	},
	onSubmit(e) {
		console.log(e);
		var item = e.target.dataset.item;
		var _this = this;
		wx.showLoading({ title: '重新生成订单', mask: true });

		wx.request({
			url: util.serverUrl + '/api/miniapp/order/createNewOrderNo',
			method: 'POST',
			data: { ORDER_NO: item.ORDER_NO },
			success: function (res) {
				wx.hideLoading();
				wx.showLoading({ title: '提交支付', mask: true });
				if (res.data.status == 0) {
					var openId = wx.getStorageSync('openId');
					var orderNoNew = res.data.data.OPTION01;
					var orderNoOrigin = item.ORDER_NO;
					var totalPayment = item.VIP_PAYMENT === 0 || item.VIP_PAYMENT === "" || item.VIP_PAYMENT == null ? item.PAYMENT : item.VIP_PAYMENT;
					var params = {
						openId: openId,
						orderNo: orderNoNew,
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
										//微信支付结束，把订单状态改一下
										wx.showLoading({ title: '正在更改订单状态', mask: true });
										wx.request({
											url: util.serverUrl + '/api/miniapp/order/pay_success?ORDER_NO=' + orderNoOrigin,
											method: "POST",
											success: function (payResult) {
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
				} else {
					wx.hideLoading({
						success: (res) => {
							wx.showToast({
								title: '错误！',
							})
						},
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
		})






	},
	onClosePopup: function (event) {
		var self = this;
		self.setData({
			payErrorPopup: false
		})
	},





})
