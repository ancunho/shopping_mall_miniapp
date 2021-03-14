import area from '../../static/js/area.js';
const util = require("../../utils/util");

Page({

    /**
     * 页面的初始数据
     */
    data: {
        area : '',
        areaList: area,
        receiverName : '',
        receiverMobile : '',
        receiverProvince : '',
        receiverCity : '',
        receiverDistrict : '',
        receiverAddress : '',
        isDefault : 1,
        areaActive : false,
    },
    showArea : function() {
        this.setData({
			areaActive: true
		});
    },
    confirmArea(event){
		this.setData({
            area : event.detail.values[0].name + event.detail.values[1].name + event.detail.values[2].name,
            areaActive : false,
            receiverProvince : event.detail.values[0].code,
            receiverCity : event.detail.values[1].code,
            receiverDistrict : event.detail.values[2].code,
		});
	},
    onLoad: function (options) { },
    onReady: function () { },
    onShow: function () { },
    addShip : function(e) {
        if (this.data.receiverName == "") {
            wx.showToast({ title: '收货人不能为空', icon: "none" });
            return;
        }
        if (this.data.receiverMobile == "") {
            wx.showToast({ title: '手机号不能为空', icon: "none" });
            return;
        }
        if (this.data.receiverProvince == "") {
            wx.showToast({ title: '城市信息不能为空', icon: "none" });
            return;
        }
        if (this.data.receiverProvince == "") {
            wx.showToast({ title: '详细地址不能为空', icon: "none" });
            return;
        }
        var customerInfo = wx.getStorageSync('customerInfo');
        var shipVO = {};
        shipVO.USER_SEQ = customerInfo.USER_SEQ;
        shipVO.RECEIVER_NAME = this.data.receiverName;
        shipVO.RECEIVER_PHONE = this.data.receiverMobile;
        shipVO.RECEIVER_MOBILE = this.data.receiverMobile;
        shipVO.RECEIVER_PROVINCE = this.data.receiverProvince;
        shipVO.RECEIVER_CITY = this.data.receiverCity;
        shipVO.RECEIVER_DISTRICT = this.data.receiverDistrict;
        shipVO.RECEIVER_ADDRESS = this.data.receiverAddress;
        shipVO.RECEIVER_ZIP = "";
        shipVO.IS_DEFAULT = this.data.isDefault;
        shipVO.OPTION01 = "";
        shipVO.OPTION02 = "";
        shipVO.OPTION03 = "";
        shipVO.OPTION04 = "";
        shipVO.OPTION05 = "";
        if(this.data.isDefault) {
            shipVO.IS_DEFAULT = "1";
        } else {
            shipVO.IS_DEFAULT = "0";
        }
        if (shipVO.USER_SEQ == null) {
            wx.showToast({
              title: '请先登录', icon : "none"
            })
        } else {
            wx.request({
                url: util.serverUrl + '/api/miniapp/shipping/add',
                method : "POST",
                data : shipVO,
                success : function(res) {
                    console.log(res);

                    // if (res.data.status == 0) {
                    //     wx.redirectTo({
                    //       url: '/pages/address/index',
                    //     })
                    // }
                },
                fail : function (res) {
                    console.log(res);
                    wx.showToast({ title: '出错！', icon : 'none' })
                }
                
            })
        }
       
    },

    onIsDefaultHandler : function({detail}) {
        console.log({detail});
        this.setData({
            isDefault : detail
        });
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})