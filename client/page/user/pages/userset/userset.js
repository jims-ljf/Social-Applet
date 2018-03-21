const generalmethod = require('../../../../utils/jsgeneralmethod.js')
const miniprogrammethod = require('../../../../utils/miniprogrammethod.js')

var app = getApp()
var upHeadPortrait = null, upBackgroupImage = null
Page({
  data: {
    provinceArr: [],
    cityArr: [],
    sexArr: [
      { name: "男", id: 0 },
      { name: "女", id: 1 },
      { name: "--请选择--", id: 2 }
    ],    
    sexID: 2,
    provinceID: 0,
    cityID: 0,
    loading: false,
    submitText: "确定",
  },
  onLoad: function (options) {    
    this.loadData();
  },
  loadData: function () {//获取名片信息} {//获取名片信息
    var that = this
    var userInfoDetail = wx.getStorageSync('userInfoDetail');
    wx.showNavigationBarLoading()
    if(userInfoDetail.WeixinOpenID != null)
    {
      that.setData(userInfoDetail)
      wx.hideNavigationBarLoading();
    }
    else
    {
      var user = wx.getStorageSync('user');
      if(user.openid != "")
      {
        miniprogrammethod._get(
          app.globalData.webApiUrl + "/User/GetUserInfo",
          JSON.parse('{"UserOpenID": "' + user.openid + '"}'),
          function (data) {
            if (data.Success) {
              if (data.Data != null) {
                that.setData(data.Data)
              }
              else {
                wx.showToast({ icon: "loading", title: "报错" + " " + "加载用户数据错误！" })
              }
            }
            else {
              wx.showToast({ icon: "loading", title: "报错" + " " + "加载用户数据错误！" })
            }
          },
          function (res) {
          }
        );
      }
    }
  },
  uploadHeadPortrait: function (e) {
    var that = this;
    var id = e.currentTarget.id;

    wx.chooseImage({
      count: 1, // 最多可以选择的图片张数，默认9
      sizeType: ['compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function (res) {
        if (id.toLowerCase() == "headportrait") {
          upHeadPortrait = res.tempFilePaths[0]
          that.setData({ headPortrait: res.tempFilePaths[0] })
        }
        else {
          upBackgroupImage = res.tempFilePaths[0]
          that.setData({ backgroupImage: res.tempFilePaths[0] })
        }

      }
    })
  },
  bindProvinceChange: function (e) {
    this.setData({
      provinceID: e.detail.value
    })
  },
  bindCityChange: function(e){
    this.setData({
      cityID: e.detail.value
    })
  },

  bindSexChange: function (e) {
    this.setData({
      sexID: e.detail.value
    })
  },
  bindDateChange: function (e) {
    this.setData({
      birthdate: e.detail.value
    })
  },
  dataSubmit: function (e) {
    var that = this
    var fdata = e.detail.value
    fdata.face = that.data.face
    wx.request({
      url: app.config.saveUserInfoUrl,
      data: fdata,
      method: 'POST',
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      success: function (res) {
        if (res.data.code == 0) {
          app.globalData.refreshIndex = true
          app.globalData.refreshMine = true
          wx.showToast({
            title: '保存成功',
            icon: "success",
            success: function () {
              wx.navigateBack({ delta: 1 })
            }
          })
        } else {
          wx.showToast({ icon: "loading", title: res.data.code + " " + res.data.message })
        }
      },
      fail: function (res) {
        wx.showToast({ icon: "loading", title: '服务器君开小差了哦~' })
      },
      complete: function (res) {
        that.setData({ loading: false, submitText: "确定" })
      }
    })
  },
  formSubmit: function (e) {
    var that = this
    if (!that.data.loading) {
      var form = e.detail.value
      var err = ""
      if (form.truename == "")
        err == "请输入姓名";
      else if (form.tel == "")
        err += "请输入手机号码";
      else if (form.position == "")
        err += "请输入职位";
      if (err != "") {
        wx.showToast({ icon: "loading", title: err })
      } else {
        that.setData({ loading: true, submitText: "提交中" })
        if (upface) {
          wx.uploadFile({
            url: app.config.uploadUrl,
            filePath: upface,
            name: 'file',
            success: function (res) {
              var re = JSON.parse(res.data)
              that.setData({ face: re.data })
              that.dataSubmit(e)
            },
            fail: function (res) {
              console.log(res)
              wx.showToast({ icon: "loading", title: '服务器君开小差了哦~' })
            },
            complete: function (res) {
              that.setData({ loading: false, submitText: "确定" })
            }
          })
        } else {
          that.dataSubmit(e)
        }
      }
    }
  }
})
