//const util = require('../utils/util.js')
const generalmethod = require('../../../../utils/jsgeneralmethod.js')
const miniprogrammethod = require('../../../../utils/miniprogrammethod.js')

Page({
  data: {
    logs: []
  },
  onLoad: function () {
    this.loadData();
  },
  loadData: function () {
    var user = wx.getStorageSync('user') || {};
    if (user.openid != "") {
      miniprogrammethod._get(
        app.globalData.webApiUrl + "/User/GetFriendList",
        JSON.parse('{"UserOpenID": "' + user.openid + '"}'),
        function (data) {
          if (data.Success) {
            if (data.Data.length > 0) {
              this.setData({
                firendlist: data.Data
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
  }
})
