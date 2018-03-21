var sourceType = [['camera'], ['album'], ['camera', 'album']]
var sizeType = [['compressed'], ['original'], ['compressed', 'original']]
var dataImg = ""
var areaText = ""
var formData = {}

var app = getApp()
// 创建实例
Page({
  data: {
    imageList: [],
    location: "所在位置",
    loading: false,
    submitText: "发布",
    mapAddress: "",
    mapX: "",
    mapY: "",
    j: 1,//帧动画初始图片 
    isSpeaking: false,//是否正在说话 
    voices: [],//音频数组
    current: {
      poster: 'http://y.gtimg.cn/music/photo_new/T002R300x300M000003rsKF44GyaSk.jpg?max_age=2592000',
      name: '此时此刻',
      author: '许巍',
      src: 'http://ws.stream.qqmusic.qq.com/M500001VfvsJ21xFqb.mp3?guid=ffffffff82def4af4b12b3cd9337d5e7&uin=346897220&vkey=6292F51E1E384E06DCBDC9AB7C49FD713D632D313AC4858BACB8DDD29067D3C601481D36E62053BF8DFEAF74C0A5CCFADD6471160CAF3E6A&fromtag=46',
    },
    audioAction: {
      method: 'pause'
    }
  },
  onLoad: function () {
    areaText = ""
    this.setData({
      userId: wx.getStorageSync("localUserId")
    })
  },
  chooseImage: function () {
    var that = this
    wx.chooseImage({
      sourceType: sourceType[2],
      sizeType: sizeType[2],
      count: 9,
      success: function (res) {
        that.setData({
          imageList: res.tempFilePaths
        })
        var formData = {
          media_id: res.tempFilePaths[0],
          s_Type: "photos"
        }
        wx.uploadFile({
          url: app.globalData.webApiUrl + "Publish/GetImage",
          filePath: res.tempFilePaths[0],   
          name: "photos",       
          header: {
            'content-type': 'multipart/form-data'
          }, // 设置请求的 header
          formData: formData, // HTTP 请求中其他额外的 form data
          success: function (res) {
            console.log(res);
            if (res.statusCode == 200 && !res.data.result_code) {
              typeof success == "function" && success(res.data);
            } else {
              typeof fail == "function" && fail(res);
            }
          },
          fail: function (res) {
            console.log(res);
            typeof fail == "function" && fail(res);
          }
        })
      }
    })
  },
  previewImage: function (e) {
    var current = e.target.dataset.src
    wx.previewImage({
      current: current,
      urls: this.data.imageList
    })
  },
  tapLocation: function (e) {
    var that = this
    wx.chooseLocation({
      success: function (e) {
        that.setData({ location: e.name, mapAddress: e.name, mapX: e.latitude, mapY: e.longitude })
      }
    })
  },
  textChange: function (e) {
    areaText = e.detail.value
  },
  dataSubmit: function () {
    var that = this
    console.log(formData)
    console.log(areaText)

    if (formData.content == "")
      formData.content = areaText
    wx.request({
      url: app.config.postTrendUrl,
      data: formData,
      method: 'POST',
      header: { "Content-Type": "application/x-www-form-urlencoded" },
      success: function (res) {
        if (res.data.code == 0) {
          app.globalData.refreshTrend = true
          wx.showToast({
            title: '发布成功',
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
        that.setData({ loading: false, submitText: "发布" })
      }
    })
  },
  imageSubmit: function (count, img) {
    var that = this
    if (img != null)
      dataImg += "," + img
    if (count < that.data.imageList.length) {
      wx.uploadFile({
        url: app.config.uploadUrl,
        filePath: that.data.imageList[count],
        name: 'file',
        success: function (res) {
          var re = JSON.parse(res.data)
          count += 1
          that.imageSubmit(count, re.data)
        },
        fail: function (res) {
          wx.showToast({ icon: "loading", title: '服务器君开小差了哦~' })
        }
      })
    } else {
      if (dataImg.length > 0)
        formData.images = dataImg.substr(1)
      that.dataSubmit()
    }
  },
  formSubmit: function (e) {
    var that = this
    if (!that.data.loading) {
      formData = e.detail.value
      dataImg = ""
      if (formData.content == "" && that.data.imageList.length == 0) {
        wx.showToast({
          title: '还未发布任何内容',
          icon: 'loading',
          duration: 2000
        })
      } else {
        that.setData({ loading: true, submitText: "提交中" })
        if (that.data.imageList.length > 0) {
          that.imageSubmit(0, null)
        } else {
          that.dataSubmit()
        }
      }
    }
  },
  //手指按下 
  touchdown: function () {
    console.log("手指按下了...")
    console.log("new date : " + new Date)
    var _this = this;
    speaking.call(this);
    this.setData({
      isSpeaking: true
    })
    //开始录音 
    wx.startRecord({
      success: function (res) {
        //临时路径,下次进入小程序时无法正常使用 
        var tempFilePath = res.tempFilePath
        console.log("tempFilePath: " + tempFilePath)
        //持久保存 
        wx.saveFile({
          tempFilePath: tempFilePath,
          success: function (res) {
            //持久路径 
            //本地文件存储的大小限制为 100M 
            var savedFilePath = res.savedFilePath
            console.log("savedFilePath: " + savedFilePath)
          }
        })
        wx.showToast({
          title: '恭喜!录音成功',
          icon: 'success',
          duration: 1000
        })
        //获取录音音频列表 
        wx.getSavedFileList({
          success: function (res) {
            var voices = [];
            for (var i = 0; i < res.fileList.length; i++) {
              //格式化时间 
              var createTime = new Date(res.fileList[i].createTime)
              //将音频大小B转为KB 
              var size = (res.fileList[i].size / 1024).toFixed(2);
              var voice = { filePath: res.fileList[i].filePath, createTime: createTime, size: size };
              console.log("文件路径: " + res.fileList[i].filePath)
              console.log("文件时间: " + createTime)
              console.log("文件大小: " + size)
              voices = voices.concat(voice);
            }
            _this.setData({
              voices: voices
            })
          }
        })
      },
      fail: function (res) {
        //录音失败 
        wx.showModal({
          title: '提示',
          content: '录音的姿势不对!',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
              return
            }
          }
        })
      }
    })
  },
  //手指抬起 
  touchup: function () {
    console.log("手指抬起了...")
    this.setData({
      isSpeaking: false,
    })
    clearInterval(this.timer)
    wx.stopRecord()
  },
  //点击播放录音 
  gotoPlay: function (e) {
    var filePath = e.currentTarget.dataset.key;
    //点击开始播放 
    wx.showToast({
      title: '开始播放',
      icon: 'success',
      duration: 1000
    })
    wx.playVoice({
      filePath: filePath,
      success: function () {
        wx.showToast({
          title: '播放结束',
          icon: 'success',
          duration: 1000
        })
      }
    })
  }
})
//麦克风帧动画 
function speaking() {
  var _this = this;
  //话筒帧动画 
  var i = 1;
  this.timer = setInterval(function () {
    i++;
    i = i % 5;
    _this.setData({
      j: i
    })
  }, 200);
}
