const util = require('../../utils/util.js')
const generalmethod = require('../../utils/jsgeneralmethod.js')
const miniprogrammethod = require('../../utils/miniprogrammethod.js')
//获取应用实例
const app = getApp()


Page({
  data: {    
    searchPageNum: 1,   // 设置加载的第几次，默认是第一次  
    callbackcount: 15,      //返回数据的个数  
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏     
    loadingHidden: false,
    isExpanded: false,
    imagewidth: 0,//缩放后的宽 
    imageheight: 0,//缩放后的高    
    list: [], otherlist: [], imageList: [], publishImages: [],
    modalHidden: true,
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {    
    var that = this;
    that.getmoreRequest();
  },
  bindscrolltoupper: function () {
    wx.showToast({
      title: '加载数据中...',
      icon: 'loading'
    }) 
    var that = this;
    that.setData({
      searchPageNum: 1,
      searchLoading: false, 
      searchLoadingComplete: false,  
    });   
    that.getmoreRequest();
  },
  bindscrolltolower: function (e) {    
    let that = this;
    if (that.data.searchLoading && !that.data.searchLoadingComplete) {
      that.setData({
        searchPageNum: that.data.searchPageNum + 1,  //每次触发上拉事件，把searchPageNum+1  
        isFromSearch: false  //触发到上拉事件，把isFromSearch设为为false  
      });
      that.getmoreRequest();
    }      
  },
  //获取数据
  getmoreRequest: function () {
    var that = this;
    var newlist = [];
    var newotherlist = [];
    var imageotherlist = [];
    var PageNumber = that.data.searchPageNum;
    var PageSize = that.data.callbackcount;
    var user = wx.getStorageSync('user') || {};
    if (user.openid != "") {
      miniprogrammethod._get(
        app.globalData.webApiUrl + "/Publish/PublishData",
        JSON.parse('{"friendID": "", "PageNumber": "' + PageNumber + '", "PageSize": "' + PageSize + '",  "UserOpenID": "' + user.openid + '"}'),
        function (data) {
          if (data.Success) {
            if(data.Data.length > 0)
            {
              for(var i=0; i< data.Data.length; i++)
              {
                var tempimagelist = [];
                var templist = data.Data[i].PublishImages.split(',');
                if (templist.length > 0) {
                  tempimagelist = [];
                  for (var j = 0; j < templist.length - 1; j++) {
                    tempimagelist.push(JSON.parse('{"src":"' + templist[j]+ '"}'));
                    imageotherlist.push(templist[j]);
                  }
                  data.Data[i].PublishImage = tempimagelist;
                }
                if(data.Data[i].Type != 0)
                {
                  newotherlist.push(data.Data[i]);
                }
                else
                {                                                     
                  newlist.push(data.Data[i]);
                }
              }
              that.setData({
                list: newlist,
                otherlist: newotherlist,
                imageList: imageotherlist,
                searchLoading: true,
                loadingHidden: true
              })              
            }
            else
            {
              that.setData({
                searchLoadingComplete: true, //把“没有数据”设为true，显示  
                searchLoading: false  //把"上拉加载"的变量设为false，隐藏  
              }); 
            }            
          }
          else {
          }
        },
        function (res) {
        }
      );
    } 
  },
  imageLoad: function (e) {
    var imageSize = util.imageUtil(e)
    this.setData({
      imagewidth: imageSize.imageWidth,
      imageheight: imageSize.imageHeight
    })
  }, 
  previewImage: function (e) {
    var that = this;
    var current = e.target.dataset.src
    wx.previewImage({
      current: current,
      urls: that.data.imageList
    })
  },
  publish: function(){
    wx.navigateTo({
      url: '../post/post'
    })
  },
  txtIsExpanded: function(){
    var that = this;
    if (that.data.isExpanded == false)
    {
      that.setData({
        isExpanded: true
      }) 
    } 
    else
    {
      that.setData({
        isExpanded: false
      }) 
    }           
  },
  //跳转到评论页面
  toCommentPage: function (e) {
    var storyId = e.currentTarget.dataset.id;

    //跳转到评论页面，并传递评论数目信息
    wx.navigateTo({
      url: '../user/pages/comment/comment?PublishID=' + storyId,
    });
  },
  showModalEvent: function () {
    this.setData({ modalHidden: false });
  },

  hideModalEvent: function () {
    this.setData({ modalHidden: true });
  }
})