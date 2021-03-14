import area from '../../static/js/area.js';
const util = require("../../utils/util");

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		areaActive: false,
		areaList: area,
		showLogin: true,
		showRegister: false,
		username: '',
		password: '',
		checkPassword: '',
		company: '',
		companyType: '',
		deviceSerial: '',
		deviceModel: '',
		deviceColor: '',
		phone: '',
		email: '',
		province: '',
		city: '',
		area: '',
		areaValue: '',
		address: '',
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		// console.log("onLoad");
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
		// console.log("onReady");
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		// console.log("onShow");
	},
	showArea() {
		this.setData({
			areaActive: true
		});
	},
	closeArea() {
		this.setData({
			areaActive: false
		});
	},
	confirmArea(event){
		this.setData({
			province: event.detail.values[0].code,
			city: event.detail.values[1].code,
			area: event.detail.values[2].code,
			areaValue : event.detail.values[0].name + event.detail.values[1].name + event.detail.values[2].name,
			areaActive : false
		});
	},
	showRegisterPage(event) {
		this.setData({
			showLogin: false,
			showRegister: true
		});
	},
	onLogin(event) {
		var _this = this;
		var param = 'USERNAME=' + this.data.username + '&PASSWORD=' + this.data.password;
		wx.request({
			url: util.serverUrl + '/api/miniapp/user/login?' + param,
			method: "POST",
			success: function (res) {
				if(res.data.status === 0 && (res.data.data.USE_YN === "1")) {
					wx.setStorageSync('customerInfo', res.data.data);
					wx.showModal({
						title: '提示',
						content: '登录成功！',
						showCancel : false,
						success(res) {
							if (res.confirm) {
								wx.switchTab({
								  url: '../index/index'
								})
							}
						}
					})
				} else if(res.data.status == 0 && (res.data.data.USE_YN === "0")) {
					wx.showModal({
						title: '提示', content: '管理员正在核实您的信息,请稍后再试', showCancel : false,
						success(res) { 
						}
					})
				} else {
					wx.showModal({
						title: '提示', content: '请确认用户密码', showCancel : false,
						success(res) {
						}
					})
				}
			},
			fail: function (res) {
				// console.log(res);
			}
		})
	},
	onRegister(event) {
		var _this = this;
		if (this.data.username == "") {
			wx.showModal({ title: '提示', content: '用户名不能为空', showCancel : false })
			return;
		}
		if (this.data.password == "") {
			wx.showModal({ title: '提示', content: '密码不能为空', showCancel : false })
			return;
		}
		if (this.data.password != this.data.checkPassword) {
			wx.showModal({
				title: '提示',
				content: '2次输入的密码不正确',
				showCancel : false,
				success(res) {
					if (res.confirm) {
						_this.setData({
							password : '',
							checkPassword : '',
						});
					}
				}
			})
			return;
		}
		if (this.data.company == "") {
			wx.showModal({ title: '提示', content: '公司名不能为空', showCancel : false })
			return;
		}
		if (this.data.phone == "") {
			wx.showModal({ title: '提示', content: '手机号不能为空', showCancel : false })
			return;
		}
		if (this.data.areaValue == "") {
			wx.showModal({ title: '提示', content: '城市不能为空', showCancel : false })
			return;
		}
		if (this.data.address == "") {
			wx.showModal({ title: '提示', content: '详细地址不能为空', showCancel : false })
			return;
		}
		var _this = this;
		wx.request({
			url: util.serverUrl + '/api/miniapp/user/register',
			method: "POST",
			data: {
				OPENID: wx.getStorageSync('openId'),
				USERNAME: _this.data.username,
				PASSWORD: _this.data.password,
				COMPANY: _this.data.company,
				COMPANY_TYPE: _this.data.companyType,
				DEVICE_SERIAL: _this.data.deviceSerial,
				DEVICE_MODEL: _this.data.deviceModel,
				DEVICE_COLOR: _this.data.deviceColor,
				PHONE	: _this.data.phone,
				PROVINCE_CODE: _this.data.province,
				CITY_CODE: _this.data.city,
				DISTRICT_CODE: _this.data.area,
				ADDRESS: _this.data.address,
			},
			success: function (res) {
				if(res.data.success) {
					wx.showModal({
						title: '提示', content: '注册成功', showCancel : false,
						success(res) {
							_this.setData({
								showLogin: true,
								showRegister: false,
								password : ''
							});
						}
					});
				} else {
					wx.showModal({
						title: '提示', content: res.data.msg, showCancel : false,
						success(res) { console.log(res)}
					})
				}
			},
			fail: function (res) {
				console.log(res);

			}
		})

	}

})