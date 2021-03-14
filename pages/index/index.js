const wechat = require("../../utils/wechat");
const util = require("../../utils/util");
const app = getApp();

Page({
    data: {
        hasUserInfo: false,
        userInfo: null,
        specPopupShow: false,
        radio: '',
        initPrice: 0,
        productList: [],
        productList2: [],
        specList: [],
        specProductImg: '',
        localCarts: [],
        isCart: false,
        hidden: null,
        selectItem: {},
        bannerImg: [
            'https://img.stronghold-technology.com/sht-images/images/cn/main/main-slide01.jpg',
            'https://img.stronghold-technology.com/sht-images/images/cn/main/main-slide02.jpg',
            'https://img.stronghold-technology.com/sht-images/images/cn/main/main-slide03.jpg'
        ],
        tab1_option1: [],
        tab1_option2: [{
            text: '规格分类',
            value: "ALL"
        },],
        tab2_option1: [],
        tab2_option2: [],
        tab1_value1: "ALL",
        tab2_value1: "ALL",
        tab2_value2: "ALL",
        // tab2_title1: "服务选择",
        // tab2_title2: "机型选择",
        isLogin: false,
        isOurCustomer: false,
        defaultShip: {},
        tabShowCountry: "ALL",
        tabShowCategory: "ALL",
        categoryList: []
    },
    onLoad: function () {
        var _this = this;
        // _this.onLoadMainBanner();
    },
    onShow() {
        wx.showLoading({
            title: '正在加载', mask: true
        });
        var openId = wx.getStorageSync('openId') || '';
        if (openId == '' || openId == null) {
            wx.login({
                success: function (r) {
                    if (r.code != "") {
                        wx.request({
                            url: util.serverUrl + '/api/miniapp/getOpenId?code=' + r.code,
                            success: function (res) {
                                wx.setStorageSync('openId', res.data.data.openId);
                            }
                        })
                    }
                }
            })
        }

        this.getTabBar().setData({
            active: 0,
            cartCount: wx.getStorageSync('cart').length
        });
        var _this = this;
        var customerInfo = wx.getStorageSync('customerInfo');
        if (!customerInfo) {
            wx.hideLoading();
            wx.showModal({
                title: '提示',
                content: '请先登录',
                showCancel: false,
                confirmText: '前往登录',
                success(res) {
                    if (res.confirm) {
                        wx.navigateTo({
                            url: '/pages/customer/register',
                        })
                    }
                }
            })
        } else {
            wx.hideLoading();
            if (customerInfo.USE_YN == "1") {
                //isOurCustomer = true
                _this.setData({
                    isOurCustomer: true
                });
                this.loadCategoryList();
                this.loadProudctList();
                this.loadProudctList2();
                this.loadDefaultShip();
            } else {
                _this.setData({
                    isOurCustomer: false
                });

            }

        }
    },
    onReady() {
        var arr = wx.getStorageSync('cart') || [];

    },
    getOpenId: function () {
        wx.login({
            success: function (r) {
                if (r.code != "") {
                    wx.request({
                        url: util.serverUrl + '/api/miniapp/getOpenId?code=' + r.code,
                        success: function (res) {
                            wx.setStorageSync('openId', res.data.data.openId);
                        }
                    })
                }
            }
        })
    },
    checkOurCustomer: function (openId) {
        return false;
    },
    loadCategoryList: function () {
        var self = this;
        wx.request({
            url: util.serverUrl + '/api/miniapp/category/list',
            method: "POST",
            data: {
                CATEGORY_TYPE: "02"
            },
            success: function (res) {
                var arrDropdownMenu = new Array();
                var arrDuplicatedDropdownMenu = new Array({ text: "服务选择", value: "ALL" });
                var arrDuplicatedDropdownMenu2 = new Array({ text: "机型选择", value: "ALL" });
                var categoryList = res.data.data;
                for (var i = 0; i < categoryList.length; i++) {
                    if (!arrDropdownMenu.includes(categoryList[i].CATEGORY_NAME) && categoryList[i].CATEGORY_NAME != "") {
                        arrDropdownMenu.push(categoryList[i].CATEGORY_NAME);
                        if (categoryList[i].SORT_ORDER === "2") {
                            var objDropDownMenu = new Object();
                            objDropDownMenu.text = categoryList[i].CATEGORY_NAME;
                            objDropDownMenu.value = categoryList[i].CATEGORY_SEQ;
                            arrDuplicatedDropdownMenu.push(objDropDownMenu);
                        } else if (categoryList[i].SORT_ORDER === "3") {
                            var objDropDownMenu = new Object();
                            objDropDownMenu.text = categoryList[i].CATEGORY_NAME;
                            objDropDownMenu.value = categoryList[i].CATEGORY_SEQ;
                            arrDuplicatedDropdownMenu2.push(objDropDownMenu);
                        }
                    }
                }

                self.setData({
                    tab2_option1: arrDuplicatedDropdownMenu,
                    tab2_option2: arrDuplicatedDropdownMenu2
                });
            },
            fail: function (res) {
                console.log(res);
            }
        })
    },
    loadProudctList: function () {
        var self = this;
        wx.request({
            url: util.serverUrl + '/api/miniapp/product/list',
            method: "POST",
            data: { ATTRIBUTE: '01' },
            success: function (res) {
                var arrDropdownMenu = new Array();
                var arrDuplicatedDropdownMenu = new Array({ text: "全部产区", value: "ALL" });
                var productList = res.data.data;
                for (var i = 0; i < productList.length; i++) {
                    if (!arrDropdownMenu.includes(productList[i].COUNTRY) && productList[i].COUNTRY != "") {
                        arrDropdownMenu.push(productList[i].COUNTRY);
                        var objDropDownMenu = new Object();
                        objDropDownMenu.text = productList[i].COUNTRY;
                        objDropDownMenu.value = productList[i].COUNTRY;
                        arrDuplicatedDropdownMenu.push(objDropDownMenu);
                    }
                }

                self.setData({
                    productList: res.data.data,
                    tab1_option1: arrDuplicatedDropdownMenu
                });
            },
            fail: function (res) {
                console.log(res);
            }
        })
    },
    loadProudctList2: function () {
        var self = this;
        wx.request({
            url: util.serverUrl + '/api/miniapp/product/list',
            method: "POST",
            data: { ATTRIBUTE: '02' },
            success: function (res) {
                self.setData({
                    productList2: res.data.data,
                    // tab1_option1: arrDuplicatedDropdownMenu
                });
            },
            fail: function (res) {
                console.log(res);
            }
        })
    },
    loadDefaultShip() {
        var customerInfo = wx.getStorageSync('customerInfo');
        wx.removeStorageSync('defaultShip');
        var self = this;
        var defaultShip;
        wx.request({
            url: util.serverUrl + '/api/miniapp/shipping/default?USER_SEQ=' + customerInfo.USER_SEQ,
            method: "GET",
            success: function (res) {
                defaultShip = res.data.data;
                wx.setStorageSync('defaultShip', defaultShip);
            },
            fail: function (res) {
                console.log(res);

            }
        });
    },
    onLoadMainBanner: function () {
        var _this = this;
        var defaultShip;
        wx.request({
            url: util.serverUrl + '/api/file/main/list',
            method: "POST",
            success: function (res) {
                if (res.data.data != null && res.data.data.length > 0) {
                    var bannerImg = [];
                    for (var i = 0; i < res.data.data.length; i++) {
                        bannerImg.push(res.data.data[i].fileFullPath);
                    }
                    _this.setData({
                        bannerImg: bannerImg
                    })
                }
            },
            fail: function (res) {
                console.log(res);
            }
        });
    },
    onLoadDropdownMenu: function (value) {
        this.setData({
            tabShowCountry: value.detail,
            tab1_value1: value.detail
        });
    },
    onLoadDropdownMenu2: function (value) {
        this.setData({
            tabShowCategory: value.detail,
            tab2_value1: value.detail
        });
    },
    onLoadDropdownMenu3: function (value) {
        this.setData({
            tabShowCategory: value.detail,
            tab2_value2: value.detail
        });
    },
    onLoadSpec: function (element) {
        var productId = element.currentTarget.dataset.productId;
        var productImg = element.currentTarget.dataset.productImg;
        var self = this;
        wx.request({
            url: util.serverUrl + '/api/miniapp/product/getSpecListByProductSeq?PRODUCT_SEQ=' + productId,
            method: "POST",
            success: function (res) {
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
        console.log(e);
        var customerInfo = wx.getStorageSync('customerInfo');
        var newGood = {};
        var _this = this;
        newGood.USER_SEQ = customerInfo.USER_SEQ;
        newGood.ATTRIBUTE = "01";
        newGood.PRODUCT_SEQ = e.target.dataset.item.PRODUCT_SEQ;
        newGood.SPEC_SEQ = e.target.dataset.item.SPEC_SEQ;
        newGood.QUANTITY = 1;
        newGood.WEIGHT = e.target.dataset.item.WEIGHT;
        newGood.PRODUCT_NAME = e.target.dataset.item.PRODUCT_NAME;
        newGood.MAIN_IMAGE = e.target.dataset.productImg;
        newGood.PRICE = e.target.dataset.item.PRICE;
        newGood.PACKAGE_CODE = e.target.dataset.item.PACKAGE_CODE;
        newGood.checked = false;

        var cartArray = wx.getStorageSync('cart') || [];
        if (cartArray.length > 0) {
            for (var j in cartArray) {
                if (cartArray[j].SPEC_SEQ === e.target.dataset.item.SPEC_SEQ) {
                    cartArray[j].QUANTITY = cartArray[j].QUANTITY + 1;
                    try {
                        wx.setStorageSync('cart', cartArray);
                        wx.showToast({
                            title: '成功加入购物车！',
                            icon: 'success',
                            duration: 1000
                        });
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

    addCart2: function (e) {
        var customerInfo = wx.getStorageSync('customerInfo');
        var newGood = {};
        var _this = this;
        newGood.USER_SEQ = customerInfo.USER_SEQ;
        newGood.PRODUCT_SEQ = e.target.dataset.item.PRODUCT_SEQ;
        newGood.QUANTITY = 1;
        newGood.ATTRIBUTE = "02";
        newGood.PRODUCT_NAME = e.target.dataset.item.PRODUCT_NAME;
        newGood.MAIN_IMAGE = e.target.dataset.productImg;
        newGood.PRICE = e.target.dataset.item.PRICE;
        newGood.checked = false;

        var cartArray = wx.getStorageSync('cart') || [];
        if (cartArray.length > 0) {
            for (var j in cartArray) {
                if (cartArray[j].SPEC_SEQ === e.target.dataset.item.SPEC_SEQ) {
                    cartArray[j].QUANTITY = cartArray[j].QUANTITY + 1;
                    try {
                        wx.setStorageSync('cart', cartArray);
                        wx.showToast({
                            title: '成功加入购物车！',
                            icon: 'success',
                            duration: 1000
                        });
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