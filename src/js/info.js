var queryString = window.util.getQueryParam();
new Vue({
	el:'#infoapp',
	data:{
		actordetailData:'',
		actorgiftslistData:[],
		votesnum:1,
		pageindex:1,
		LodindStatus:0,
		linkid:queryString.activityid,
		bombbox:false,
		bombboxtext:'投票成功',
		loadingshow:true,
		totallength:'',
		sharetitle:'',
		sharedesc:'',
		shareimgUrl:''
	},
	methods:{
		getwxcode:function(){
			var _this = this;
	        var access_code = queryString.code;
	        window.sessionStorage.setItem("accesscode",queryString.code);
	        console.log(window.sessionStorage.getItem("openid"));
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
		getactordetail:function(){
			this.$http({
				method: 'POST',
				url: window.api + '/api/actor/detail',
				body: {
					id: queryString.actorid
				}
			}).then(function(data){
				console.log(data.body);
				this.actordetailData = data.body.result;
			}, function(data){
			});
		},
		actorgiftslist:function(){
			this.loadingshow = true;
			this.$http({
				method: 'POST',
				url: window.api + '/api/actor/actorgifts',
				body: {
					activityId: queryString.activityid,
					actorId: queryString.actorid,
					filter: "",
					index: this.pageindex,
					size: 10
				}
			}).then(function(data){
				console.log(data.body);
				if(this.pageindex == 1){
					this.actorgiftslistData = data.body.result.data;
				}else{
					for(var i=0; i<data.body.result.data.length; i++){
						this.actorgiftslistData.push(data.body.result.data[i]);
					}
				}
				this.totallength = data.body.result.total;
				this.LodindStatus = 0;
				this.loadingshow = false;
			}, function(data){
			});
		},
		postvote:function(activityId,actorId){
			if(window.sessionStorage.getItem("openid") == undefined || window.sessionStorage.getItem("openid") == 'undefined'){
				console.log('不是微信');
				var appId = "wxffd841f6f0dd01f8";
                var returnurl = encodeURIComponent(location.href);//"http%3a%2f%2fktv.leftins.com%2findex.html";
                var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' +appId
                    + '&redirect_uri=' + returnurl
                    +'&response_type=code&scope=snsapi_userinfo&state=STATE%23wechat_redirect&connect_redirect=1#wechat_redirect';
                location.href = url;
			}else{
				if(actorId != '' || actorId != null || actorId != 'null'){
					this.$http({
						method: 'POST',
						url: window.api + '/api/actor/vote',
						body: {
							activityId: activityId,
							actorId: actorId,
							sendKey: sessionStorage.getItem("openid"),
							votes: this.votesnum
						}
					}).then(function(data){
						console.log(data.body);
						if(data.body.success == true){
							this.bombbox = true;
							this.getactordetail();
						}else{
							this.bombbox = true;
							this.bombboxtext = data.body.result;
						}
					}, function(data){
						console.log(data.body);
					});
				};
			};
		},
		loadmore:function(){
			if(this.actorgiftslistData.length != this.totallength){
				if (this.LodindStatus == 1) {//正在加载时不继续获取数据
	                return;
	            }
	            this.LodindStatus = 1;
	    		this.pageindex += 1;
				this.actorgiftslist();
			}else{
				this.bombbox = true;
				this.bombboxtext = '没有更多数据';
			}
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
				    link: location.href.split('&')[0]+'&'+location.href.split('&')[1], // 分享链接
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
		this.getactordetail();
		this.actorgiftslist();
		this.getdetail();
		this.wxshare();
	}
});