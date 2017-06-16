var queryString = window.util.getQueryParam();
new Vue({
	el:'#prizeapp',
	data:{
		prizeslistData:{},
		linkid:queryString.activityid,
		loadingshow:true,
		sharetitle:'',
		sharedesc:'',
		shareimgUrl:''
	},
	methods:{
		getwxcode:function(){
			var _this = this;
	        var access_code = queryString.code;
	        window.sessionStorage.setItem("accesscode",queryString.code);
        	if(window.sessionStorage.getItem("openid") == undefined || window.sessionStorage.getItem("openid") == 'undefined'){
	            if (access_code == null || access_code == 'null') {
	                var appId = window.appId;
	                var returnurl = encodeURIComponent(location.href);//"http%3a%2f%2fktv.leftins.com%2findex.html";
	                var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' +appId
	                    + '&redirect_uri=' + returnurl
	                    +'&response_type=code&scope=snsapi_userinfo&state=STATE%23wechat_redirect&connect_redirect=1#wechat_redirect';
	                location.href = url;
	            }else {
	                _this.$http({
						method: 'POST',
						url: window.api + '/api/token/getWxAccessToken?code='+access_code,
						body: {}
					}).then(function(data){
						_this.$http({
							method: 'POST',
							url:  window.api + '/api/token/getuserinfo?token='+data.body.result.access_token+'&openId='+data.body.result.openid,
							body: {}
						}).then(function(data){
							window.sessionStorage.setItem("openid",data.body.openid);
							window.sessionStorage.setItem("nickname",data.body.nickname);
							window.sessionStorage.setItem("headimgurl",data.body.headimgurl);
						}, function(data){
						});
					}, function(data){
					});
	            }
	        }
		},
		getprizeslist:function(){
			this.loadingshow = true;
	    	this.$http({
				method: 'GET',
				url: window.api + '/api/prize/prizelist?activityId='+queryString.activityid,
				body: {
					filter: "",
					index: 1,
					size: 10
				}
			}).then(function(data){
				this.prizeslistData = data.body.result;
				this.loadingshow = false;
			}, function(data){
			});
		},
		getdetail:function(){
			this.$http({
				method: 'GET',
				url: window.api + '/api/activity/getdetail?activityId='+queryString.activityid,
				body: {}
			}).then(function(data){
				console.log(data.body);
				this.sharetitle = data.body.result.title;
				this.sharedesc = data.body.result.title;
				this.shareimgUrl = data.body.result.images[0].url;
				window.sessionStorage.setItem("votetitle",data.body.result.title);
			}, function(data){
				console.log(data.body);
			});
		},
		wxshare:function(){
			var _this = this;
			wx.ready(function(){
				var shareinfo = {
				    title: _this.sharetitle, // 分享标题
				    desc: _this.sharedesc+'你怎么能错过，邀请好友一起来帮你吧。', // 分享描述
				    link: location.href.split('&')[0], // 分享链接
				    imgUrl: _this.shareimgUrl, // 分享图标
				    success: function () { 
				        // 用户确认分享后执行的回调函数
				    },
				    cancel: function () { 
				        // 用户取消分享后执行的回调函数
				    }
				};
				//分享到朋友圈
				wx.onMenuShareTimeline(shareinfo);
				//分享给朋友
				wx.onMenuShareAppMessage(shareinfo);
				//分享到QQ
				wx.onMenuShareQQ(shareinfo);
				//分享到腾讯微博
				wx.onMenuShareWeibo(shareinfo);
				//分享到空间
				wx.onMenuShareQZone(shareinfo);
			});
		}
	},
	created: function() {
		this.getwxcode();
		this.getprizeslist();
		this.getdetail();
		this.wxshare();
	}
});