const util = require('../../utils/util');

Page({
    data: {
        cartCount: 0,
        bannerImg: [
            'https://img.stronghold-technology.com/sht-images/images/cn/main/main-slide01.jpg',
            'https://img.stronghold-technology.com/sht-images/images/cn/main/main-slide02.jpg',
            'https://img.stronghold-technology.com/sht-images/images/cn/main/main-slide03.jpg'
        ],
        id: '',
        categoryId: '',
        name: '',
        subtitle: '',
        mainImage: '',
        subImage: '',
        subImage2: '',
        subImage3: '',
        attribute: '',
        detail: '',
        stock: '',
        status: '',
        country: '',
        city: '',
        variety: '',
        treatment: '',
        flavor: '',
        param1: '',
        param2: '',
        param3: '',
        param4: '',
        param5: '',
        specPopupShow: false,
        radio: '',
        initPrice: 0,
        productList: [],
        specList: [],
        specProductImg: '',
        attributeFlag: '',
        itemSelected: {}
    },
    onLoad(option) {
        var _this = this;
        wx.request({
            url: util.serverUrl + '/api/miniapp/product/detail?PRODUCT_SEQ=' + option.productId,
            method: "POST",
            success: function (res) {
                if (res.data.status == 0) {
                    console.log(res.data.data);
                    var arrBannerImg = new Array();
                    if (res.data.data.SUB_IMAGE != "") {
                        arrBannerImg.push(res.data.data.SUB_IMAGE);
                    }
                    if (res.data.data.SUB_IMAGE2 != "") {
                        arrBannerImg.push(res.data.data.SUB_IMAGE2);
                    }
                    if (res.data.data.SUB_IMAGE3 != "") {
                        arrBannerImg.push(res.data.data.SUB_IMAGE3);
                    }
                    var attributeFlag = "";
                    if (res.data.data.ATTRIBUTE == "01") {
                        attributeFlag = res.data.data.ATTRIBUTE;
                    } else if (res.data.data.ATTRIBUTE == "02") {
                        attributeFlag = res.data.data.ATTRIBUTE;
                    }

                    _this.setData({
                        itemSelected: res.data.data,
                        attributeFlag: attributeFlag,
                        id: res.data.data.PRODUCT_SEQ,
                        categoryId: res.data.data.CATEGORY_ID,
                        name: res.data.data.PRODUCT_NAME,
                        subtitle: res.data.data.PRODUCT_SUBTITLE,
                        mainImage: res.data.data.MAIN_IMAGE,
                        bannerImg: arrBannerImg,
                        subImage: res.data.data.SUB_IMAGE,
                        subImage2: res.data.data.SUB_IMAGE2,
                        subImage3: res.data.data.SUB_IMAGE3,
                        attribute: res.data.data.ATTRIBUTE,
                        detail: _this.htmlEscape(res.data.data.DETAIL),
                        stock: res.data.data.STOCK,
                        status: res.data.data.STATUS,
                        country: res.data.data.COUNTRY,
                        city: res.data.data.CITY,
                        variety: res.data.data.VARIETY,
                        treatment: res.data.data.TREATMENT,
                        flavor: res.data.data.FLAVOR,
                        param1: res.data.data.OPTION01,
                        param2: res.data.data.OPTION02,
                        param3: res.data.data.OPTION03,
                        param4: res.data.data.OPTION04,
                        param5: res.data.data.OPTION05,
                    });
                }
            },
            fail: function (res) {
                console.log(res);
            }
        });


    },
    onShow() {
        this.setData({
            cartCount: wx.getStorageSync('cart').length
        });
    },
    onSubmit() {
        wx.navigateTo({
            url: '/pages/pay/index'
        })
    },
    onClickToCart(e) {
        wx.switchTab({
            url: '/pages/cart/index'
        })
    },
    htmlEscape: function (html) {
        var reg = /(&lt;)|(&gt;)|(&amp;)|(&quot;)/g;
        return html.replace(reg, function (match) {
            switch (match) {
                case "&lt;":
                    return "<";
                case "&gt;":
                    return ">"
                case "&amp;":
                    return "&";
                case "&quot;":
                    return "\""
            }
        });
    },
    onClickSpec(e) {
        console.log(e);
    },
    onLoadSpec: function (element) {
        var productId = element.currentTarget.dataset.productId;
        var productImg = element.currentTarget.dataset.productImg;
        var self = this;
        wx.request({
            url: util.serverUrl + '/api/miniapp/product/getSpecListByProductSeq?PRODUCT_SEQ=' + productId,
            method: "POST",
            success: function (res) {
                console.log(res);
                var specList = res.data.data;
                self.setData({
                    specPopupShow: true,
                    initPrice: 0,
                    radio: '',
                    specList: specList,
                    specProductImg: productImg
                });
            },
            fail: function (res) {
                console.log(res);
            }
        })
    },
    onClosePopup: function (event) {
        var self = this;
        self.setData({
            specPopupShow: false
        })
    },
    onRadioChange: function (event) {
        var price = event.target.dataset.price;
        this.setData({
            initPrice: price,
            radio: event.detail,
            selectItem: event.target.dataset.item
        });
    },
    addCart: function (e) {
        var customerInfo = wx.getStorageSync('customerInfo');
        var newGood = {};
        var _this = this;
        newGood.USER_SEQ = customerInfo.USER_SEQ;
        newGood.PRODUCT_SEQ = e.target.dataset.item.PRODUCT_SEQ;
        newGood.SPEC_SEQ = e.target.dataset.item.SPEC_SEQ;
        newGood.QUANTITY = 1;
        newGood.PRODUCT_NAME = e.target.dataset.item.PRODUCT_NAME;
        newGood.MAIN_IMAGE = e.target.dataset.MAIN_IMAGE;
        newGood.PRICE = e.target.dataset.item.PRICE;
        newGood.checked = false;

        var cartArray = wx.getStorageSync('cart') || [];
        if (cartArray.length > 0) {
            for (var j in cartArray) {
                if (cartArray[j].SPEC_SEQ === e.target.dataset.item.SPEC_SEQ) {
                    cartArray[j].QUANTITY = cartArray[j].QUANTITY + 1;
                    try {
                        wx.setStorageSync('cart', cartArray);

                        return;
                    } catch (e) {
                        console.log(e);
                    }
                }
            }
            cartArray.push(newGood);
        } else {
            cartArray.push(newGood);
        }

        try {
            wx.setStorageSync('cart', cartArray);
            // wx.showToast({
            //     title: '成功加入购物车！',
            //     icon: 'success',
            //     duration: 2000
            // });

            _this.getTabBar().setData({
                cartCount: cartArray.length
            });
            return;
        } catch (e) {
            console.log(e);
        }
    },
    addCart2: function (e) {
        var customerInfo = wx.getStorageSync('customerInfo');
        var newGood = {};
        var _this = this;
        newGood.USER_SEQ = customerInfo.USER_SEQ;
        newGood.PRODUCT_SEQ = e.target.dataset.item.PRODUCT_SEQ;
        newGood.QUANTITY = 1;
        newGood.PRODUCT_NAME = e.target.dataset.item.PRODUCT_NAME;
        newGood.MAIN_IMAGE = e.target.dataset.MAIN_IMAGE;
        newGood.PRICE = e.target.dataset.item.PRICE;
        newGood.checked = false;

        var cartArray = wx.getStorageSync('cart') || [];
        if (cartArray.length > 0) {
            cartArray.push(newGood);
        } else {
            cartArray.push(newGood);
        }

        try {
            wx.setStorageSync('cart', cartArray);
            wx.showToast({
                title: '成功加入购物车！',
                icon: 'success',
                duration: 1000
            });

            _this.getTabBar().setData({
                cartCount: cartArray.length
            });
            return;
        } catch (e) {
            console.log(e);
        }
    },
})
