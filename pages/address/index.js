import area from '../../static/js/area.js';
const wechat = require("../../utils/wechat");
const util = require("../../utils/util");
const app = getApp();
Page({
	data: {
		editActive: false,
		areaActive: false,
		areaList: area,
		shippingList: [],
		isClick: false,
		e_receiverName: '',
		e_receiverPhone: '',
		e_receiverProvince: '',
		e_receiverCity: '',
		e_receiverDistrict: '',
		e_area: '',
		e_receiverAddress: '',
		e_userId: '',
		e_isDefault: 0,
		e_id: '',
	},
	showEdit() {
		// this.setData({
		//   editActive: true
		// })
		wx.navigateTo({
			url: '/pages/address/new',
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
	onLoad(options) {

	},
	onClickToPayPage(options) {
		var _this = this;
		let pages = getCurrentPages();
		if (pages.length >= 2) {
			let prevpage = pages[pages.length - 2]
			// console.log(prevpage.route);
			if (prevpage.route == 'pages/pay/index') {
				_this.setData({
					isClick: true
				});
				prevpage.setData({
					ship: options.currentTarget.dataset.ship
				});
				wx.setStorageSync('defaultShip', options.currentTarget.dataset.ship);
			}
		}

		console.log(options.currentTarget.dataset.ship);
		wx.setStorageSync('currentShip', options.currentTarget.dataset.ship);
		if (this.data.isClick) {
			wx.navigateBack({
				//url: '/pages/pay/index?ship=' + encodeURIComponent(param)
				delta: 1
			});
		} else {
			console.log("current page");
		}
	},
	onClickToEdit(e) {
		var _this = this;
		var shippingId = e.currentTarget.dataset.shipId;
		
		wx.request({
			url: util.serverUrl + '/api/miniapp/shipping/detailByPk?SHIPPING_SEQ=' + shippingId,
			method: "POST",
			success: function (res) {
				console.log(res);
				if(res.data.status == 0) {
					_this.setData({
						editActive: true,
						e_id: res.data.data.SHIPPING_SEQ,
						e_receiverName: res.data.data.RECEIVER_NAME,
						e_receiverPhone: res.data.data.RECEIVER_PHONE,
						e_receiverProvince: res.data.data.RECEIVER_PROVINCE,
						e_receiverCity: res.data.data.RECEIVER_CITY,
						e_receiverDistrict: res.data.data.RECEIVER_DISTRICT,
						e_area: res.data.data.RECEIVER_PROVINCE + res.data.data.RECEIVER_CITY + res.data.data.RECEIVER_DISTRICT,
						e_receiverAddress: res.data.data.RECEIVER_ADDRESS,
						e_isDefault: res.data.data.IS_DEFAULT == "1" ? true : false,
					});
				} else {
					wx.showToast({
					  title: '数据获取失败',
					  icon: 'none'
					})
				}
				
			},
			fail: function (res) {
				console.log(res);
			}
		})

	},
	onShow() {
		var customerInfo = wx.getStorageSync('customerInfo');
		this.loadShippingtList(customerInfo.USER_SEQ);
	},
	loadShippingtList: function (customerId) {
		var self = this;
		wx.request({
			url: util.serverUrl + '/api/miniapp/shipping/list?USER_SEQ=' + customerId,
			method: "GET",
			success: function (res) {
				console.log(res);
				self.setData({
					shippingList: res.data.data
				});
			},
			fail: function (res) {
				console.log(res);
			}
		})
	},
	confirmArea(event) {
		this.setData({
			e_area: event.detail.values[0].name + event.detail.values[1].name + event.detail.values[2].name,
			areaActive: false,
			e_receiverProvince: event.detail.values[0].name,
			e_receiverCity: event.detail.values[1].name,
			e_receiverDistrict: event.detail.values[2].name,
		});
	},
	onIsDefaultHandler: function ({ detail }) {
		console.log({ detail });
		this.setData({
			e_isDefault: detail
		});
	},
	onEditShipHandler: function (e) {
		var _this = this;
		var customerInfo = wx.getStorageSync('customerInfo');
		var shipVO = {};
		shipVO.SHIPPING_SEQ = this.data.e_id;
		shipVO.USER_SEQ = customerInfo.USER_SEQ;
		shipVO.RECEIVER_NAME = this.data.e_receiverName;
		shipVO.RECEIVER_PHONE = this.data.e_receiverPhone;
		shipVO.RECEIVER_MOBILE = this.data.e_receiverPhone;
		shipVO.RECEIVER_PROVINCE = this.data.e_receiverProvince;
		shipVO.RECEIVER_CITY = this.data.e_receiverCity;
		shipVO.RECEIVER_DISTRICT = this.data.e_receiverDistrict;
		shipVO.RECEIVER_ADDRESS = this.data.e_receiverAddress;
		shipVO.RECEIVER_ZIP = "";
		shipVO.IS_DEFAULT = this.data.isDefault;
		shipVO.OPTION01 = "";
		shipVO.OPTION02 = "";
		shipVO.OPTION03 = "";
		shipVO.OPTION04 = "";
		shipVO.OPTION05 = "";
		if (this.data.e_isDefault) {
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
				url: util.serverUrl + '/api/miniapp/shipping/update',
				method: "POST",
				data: shipVO,
				success: function (res) {
					if (res.data.status == 0) {
						_this.loadShippingtList(customerInfo.USER_SEQ);
					}
				},
				fail: function (res) {
					console.log(res);
					wx.showToast({ title: '出错！', icon: 'none' })
				}

			})
		}

	}





})
