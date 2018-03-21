//logs.js
const util = require('../../utils/util.js')
const generalmethod = require('../../utils/jsgeneralmethod.js')
const miniprogrammethod = require('../../utils/miniprogrammethod.js')
var app = getApp()
Page({
  data: {
    user: {},
    userInfo: {},    
  },
  onLoad: function () {        
    var that = this    
    //调用应用实例的方法获取全局数据    
    that.user = wx.getStorageSync('user') || {};
    that.userInfo = wx.getStorageSync('userInfo') || {};
    if (that.user.openid != "") {
      miniprogrammethod._get(
        app.globalData.webApiUrl + "/User/GetCounts",
        JSON.parse('{"UserOpenID": "' + that.user.openid + '"}'),
        function (data) {
          if (data.Success) {
            if (data.Data.length > 0) {
              that.setData({                
                friendCount: data.Data.split(";")[0].split(":")[1],
                publishCount: data.Data.split(";")[1].split(":")[1],
                commonCount: data.Data.split(";")[2].split(":")[1] > 0 ? data.Data.split(";")[2].split(":")[1] : "",
                thumbsupCount: data.Data.split(";")[3].split(":")[1] > 0 ? data.Data.split(";")[3].split(":")[1] : "",
              })
            }
          }
          else {
          }
        },
        function (res) {
        }
      );
    }
    miniprogrammethod._get(
      app.globalData.webApiUrl + "/User/GetUserInfo",
      JSON.parse('{"UserOpenID": "' + that.user.openid + '"}'),
      function (data) {
        if (data.Success) {
          if (data.Data != null) {
            that.setData({
              userInfo: data.Data
            })
          }
          else
          {
            that.setData({
              userInfo: that.userInfo
            })
          }
        }
        else {
        }
      },
      function (res) {
      }
    );

  },
  chageUserInfo: function(e){
    var id = e.currentTarget.dataset.id;
    wx.setStorageSync('userInfoDetail', id);
    wx.navigateTo({
      url: 'pages/userset/userset'
    });
  },
})
