import $wuxCountDown from '../../utils/countdown.js'
export {
  $wuxCountDown,
}

const util = require('../../utils/util.js')
const generalmethod = require('../../utils/jsgeneralmethod.js')
const miniprogrammethod = require('../../utils/miniprogrammethod.js')

var phoneNum = null, identifyCode = null, identifyingCode = ""
var app = getApp()
Page({
  data: {
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    c2: ''
  },
  onLoad: function () {
    var user = wx.getStorageSync('user') || {};
    if (user.openid != "") {
      //根据openid验证是否已注册
      miniprogrammethod._get(
        app.globalData.webApiUrl + "/Account/LoginVerify",
        JSON.parse('{"UserOpenID": "' + user.openid + '"}'),
        function (data) {
          if (data.Success) {
            wx.switchTab({
              url: '../../page/home/index',
            })
          }
          else {
          }
        },
        function (res) {

        }
      );
    }
  },

  input_phoneNum: function (e) {
    phoneNum = e.detail.value
  },
  input_identifyCode: function (e) {
    identifyCode = e.detail.value
  },

  vcode: function () {
    if (this.c2 && this.c2.interval) return !1
    if (phoneNum == null || phoneNum == "" || phoneNum.length < 11) {
      return miniprogrammethod._showMessage("报错", "请输入11位数手机号码！", true);
    }
    else {
      this.sendsm();
    }
  },

  sendsm: function () {
    identifyingCode = generalmethod.generateMixed(4);
    var sMessage = "欢迎使用厦门外图早点读书注册系统，手机绑定验证码：" + identifyingCode + "。";
    miniprogrammethod._get(
      app.globalData.webApiUrl + "/Account/SendSM",
      JSON.parse('{"PhoneNumber": "' + phoneNum + '", "Message": "' + sMessage + '"}'),
      function (data) {
        if (data) {
          var objCode = {};
          objCode.code = identifyingCode;
          objCode.expires_in = Date.now() + 60;
          wx.setStorageSync('identifyingCode', objCode);
          this.c2 = new $wuxCountDown({
            date: +(new Date) + 60000,
            onEnd() {
              this.setData({
                c2: '重新获取验证码',
              })
              var objcode = {};
              objcode.code = "";
              objcode.expires_in = 0;
              wx.setStorageSync('identifyingCode', objcode);
            },
            render(date) {
              const sec = this.leadingZeros(date.sec, 2) + ' 秒后重发 '
              date.sec !== 0 && this.setData({
                c2: sec,
              })
            },
          })
        }
        else {
          miniprogrammethod._showMessage("报错", "发送验证码失败！", true);
        }
        return data;
      },
      function (res) {
        miniprogrammethod._showMessage("报错", "发送验证码失败！", true);
        return false;
      }
    );
  },

  loginsys: function () {
    if (this.validateForm()) {

      var identifyingCode = wx.getStorageSync('identifyingCode') || {};
      var code = identifyingCode.code;
      if (code == null || code.length == 0) {
        miniprogrammethod._showMessage("报错", "验证码已过期，请重新获取！", true);
        return false;
      }
      if (code == identifyCode) {  //code = $.trim($("#identifyingCode").val())
        var userInfo = wx.getStorageSync('userInfo') || {};
        var user = wx.getStorageSync('user') || {};
        if (userInfo.nickName != "") {
          var jsondata = JSON.parse(
            '{"acatarUrl": "' + userInfo.avatarUrl +
            '", "nickName": "' + userInfo.nickName +
            '", "province": "' + userInfo.province +
            '", "city": "' + userInfo.city +
            '", "gender": "' + userInfo.gender +
            '", "UserOpenID": "' + user.openid +
            '", "PhoneNumber": "' + phoneNum +
            '"}'
          );
          miniprogrammethod._get(
            app.globalData.webApiUrl + "/Account/MobileLogin",
            jsondata,
            function (data) {
              if (data.Success) {
                //miniprogrammethod._showMessage("提示", "登录成功！欢迎使用厦门外图早点读书系统！", true);
                wx.showToast({
                  title: '成功',
                  icon: 'success',
                  duration: 2000
                })
                var objCode = {};
                objCode.code = "";
                objCode.expires_in = 0;
                wx.setStorageSync('identifyingCode', objCode);
                wx.switchTab({
                  url: '../../page/home/index',
                })
              }
              else {
                miniprogrammethod._showMessage("报错", "登录失败！", true);
              }
              return data;
            },
            function (res) {
              miniprogrammethod._showMessage("报错", "登录失败！", true);
              return false;
            }
          );
        }
      }
      else {
        miniprogrammethod._showMessage("报错", "验证码不匹配，请重新输入验证码！", true);
        return false;
      }
    }
  },
  validateForm: function () {
    var bBool = true;
    if (phoneNum == null || phoneNum == "" || phoneNum.length < 11) {
      bBool = miniprogrammethod._showMessage("报错", "请输入11位数手机号码！", true);
    }
    if (identifyCode == null || identifyCode == "") {
      bBool = miniprogrammethod._showMessage("报错", "验证码输入有误，请重新输入验证码！", true);
    }
    return bBool;
  },
})

