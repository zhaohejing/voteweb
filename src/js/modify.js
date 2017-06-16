var queryString = window.util.getQueryParam();
new Vue({
	el:'#modifyapp',
	data:{
		modifyname:'',
		modifytext:'',
		modifyimg:'images/a11.png',
		bombbox:false,
		bombboxok:false,
		activityurlid:'',
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
		postmodify:function(){
			if(this.modifyimg == 'images/a11.png'){
				this.bombbox = true;
			}else if(this.modifyname == ''){
				this.bombbox = true;
			}else{
				this.$http({
					method: 'POST',
					url: window.api + '/api/actor/modify',
					body: {
						activityId: queryString.activityid,
						actorImage: this.modifyimg,
						actorKey: window.sessionStorage.getItem("openid"),
						actorName: this.modifyname,
						declaration: this.modifytext,
						id: 0
					}
				}).then(function(data){
					if(data.body.success == true){
						this.activityurlid = data.body.result.activityId;
						this.bombboxok = true;
					}
				}, function(data){
				});
			}
		},
		bombboxoklink:function(){
			location.href = 'index.html?activityid='+this.activityurlid;
			this.bombboxok = false;
		},
		inputfocus:function(){
			setTimeout(function(){
			    document.body.scrollTop = document.body.scrollHeight - 550
			},200)
		},
		uploadimages:function(serverid){
			this.$http({
				method: 'POST',
				url: window.api + '/api/token/upload?serverId='+serverid,
				body: {}
			}).then(function(data){
				this.modifyimg = 'http://image.leftins.com/'+data.body.result.key;
			}, function(data){
			});
		},
		chooseimage:function(){
			var _this = this;
			wx.ready(function(){
				wx.chooseImage({
				    count: 1, // 默认9
				    sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
				    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
				    success: function (res) {
				        wx.uploadImage({
						    localId: res.localIds[0], // 需要上传的图片的本地ID，由chooseImage接口获得
						    isShowProgressTips: 1, // 默认为1，显示进度提示
						    success: function (res) {
						        _this.uploadimages(res.serverId);
						    }
						});
				    }
				});
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
		//this.getactivity();
		this.getwxcode();
		this.getdetail();
		this.wxshare();
	}
});