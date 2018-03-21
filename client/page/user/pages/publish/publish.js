//logs.js
//const util = require('../utils/util.js')

Page({
  data: {
    logs: []
  },
  onLoad: function () {
    this.loadData();
  },
  loadData: function(e){
    var user = wx.getStorageSync('user') || {};
    var id = e.curre
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
