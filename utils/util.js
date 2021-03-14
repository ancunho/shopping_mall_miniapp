const serverUrl = 'https://localhost'; 
// const serverUrl = 'https://strongholdcoffeemall.cn'
// const appId = 'wx04b14303298c1e54';
// const　appSecret = 'fcdb8749da0f37e9de5243e3420d4651';
const formatTime = date => {
	const year = date.getFullYear()
	const month = date.getMonth() + 1
	const day = date.getDate()
	const hour = date.getHours()
	const minute = date.getMinutes()
	const second = date.getSeconds()
	return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
	n = n.toString()
	return n[1] ? n : '0' + n
}

const cartItems = wx.getStorageSync('cart');

const requestUrl = ({
	url,
	params,
	success,
	method = "post"
}) => {
	wx.showLoading({
		title: '加载中',
	});
	// let server = 'http://www.huhailong.vip:8080'; //正式域名
	let server = serverUrl; //测试域名
	let openid = wx.getStorageSync("openId"),
		that = this;

	var header = {
		'content-type': 'application/json',
		'Cookie': 'sid=' + openid
	}
	return new Promise(function (resolve, reject) {
			wx.request({
				url: server + url,
				method: method,
				data: params,
				header: header,
				success: success,
				complete: (res) => {
					//console.log(res);
					wx.hideLoading();
					resolve(res.data)
				},
				fail: function (res) {
					wx.hideLoading();
					wx.showToast({
						title: res.errMsg || '',
						icon: 'none',
						duration: 2000,
						mask: true
					})
					reject(res.data)
				},
				complete: function () {
					wx.hideLoading()
				}
			})
		})
		.catch((res) => {})
}

module.exports = {
	formatTime: formatTime,
	requestUrl: requestUrl,
	serverUrl : serverUrl,
	cartItems : cartItems
}