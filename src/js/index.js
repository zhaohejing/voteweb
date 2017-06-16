var queryString = window.util.getQueryParam();
new Vue({
	el:'#indexapp',
	data:{
		endTime:'',
		searchtext:'',
		actorslistData:{},
		detailData:'',
		votesnum:1,
		linkid:queryString.activityid,
		bennerurl:'',
		pageindex:1,
		LodindStatus:0,
		bombbox:false,
		loadingshow:true,
		bombboxtext:'投票成功',
		totallength:'',
		sharetitle:'',
		sharedesc:'',
		shareimgUrl:'',
		addtrafficnum:0
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
							/*if(document.getElementById('votetitle').innerHTML == ''){
								location.replace(location.href);
							}*/
						}, function(data){
						});
					}, function(data){
					});
	            }
	        }
		},
		getdetail:function(){
			this.$http({
				method: 'GET',
				url: window.api + '/api/activity/getdetail?activityId='+queryString.activityid,
				body: {}
			}).then(function(data){
				console.log(data.body);
				this.detailData = data.body.result;
				this.endTime = data.body.result.endTime;
				this.bennerurl = data.body.result.images[0].url;
				this.sharetitle = data.body.result.title;
				this.sharedesc = data.body.result.title;
				this.shareimgUrl = data.body.result.images[0].url;
				window.sessionStorage.setItem("votetitle",data.body.result.title);
				this.getactorslist();
			}, function(data){
				console.log(data.body);
			});
		},
		addtraffic:function(){
	    	this.$http({
				method: 'POST',
				url: window.api + '/api/activity/access',
				body: {
					id: queryString.activityid
				}
			}).then(function(data){
				console.log(data.body);
				this.addtrafficnum = data.body.result.traffic;
			}, function(data){
			});
		},
		getactorslist:function(){
			var _this = this;
			this.loadingshow = true;
			this.$http({
				method: 'POST',
				url: window.api + '/api/actor/actors',
				body: {
					activityId: queryString.activityid,
					filter: this.searchtext,
					index: this.pageindex,
					size: 10,
					sort: "actorCount"
				}
			}).then(function(data){
				console.log(data.body);
				if(this.pageindex == 1){
					this.actorslistData = data.body.result.data;
				}else{
					for(var i=0; i<data.body.result.data.length; i++){
						this.actorslistData.push(data.body.result.data[i]);
					}
					this.$nextTick(function(){
						$('#container').masonry('reload');
					});
				}
				this.totallength = data.body.result.total;
				this.LodindStatus = 0;
				this.loadingshow = false;
				$('#container>.votelistcont').animate({ opacity: 1});
				this.$nextTick(function(){
					$('#container>.votelistcont').css({ opacity: 0});
					$('#container').imagesLoaded(function(){
						$('#container>.votelistcont').animate({ opacity: 1},800);
						$('#container').masonry({
							itemSelector: '.votelistcont',
							columnWidth: 0 //每两列之间的间隙为5像素
						});
					});
	            });
			}, function(data){
				console.log(data.body);
			});
		},
		searchactorslist:function(){
			this.getactorslist();
		},
		/*postvote:function(activityId,actorId){
			if(window.sessionStorage.getItem("openid") == undefined || window.sessionStorage.getItem("openid") == 'undefined'){
				console.log('不是微信');
				var appId = "wxebc4b6b12e15acf6";
                var returnurl = encodeURIComponent(location.href);//"http%3a%2f%2fktv.leftins.com%2findex.html";
                var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' +appId
                    + '&redirect_uri=' + returnurl
                    +'&response_type=code&scope=snsapi_userinfo&state=STATE%23wechat_redirect&connect_redirect=1#wechat_redirect';
                location.href = url;
			}else{
				this.$http({
					method: 'POST',
					url: window.api + '/api/actor/vote',
					body: {
						activityId: activityId,
						actorId: actorId,
						sendKey: window.sessionStorage.getItem("openid"),
						votes: this.votesnum
					}
				}).then(function(data){
					console.log(data.body);
					if(data.body.success == true){
						this.bombbox = true;
					}else{
						this.bombbox = true;
						this.bombboxtext = data.body.result;
					}
				}, function(data){
					console.log(data.body);
				});
			};
		},*/
		infolink:function(actorId,activityId){
			location.href = 'info.html?actorid='+actorId+'&activityid='+activityId
		},
		loadmore:function(){
			if(this.actorslistData.length != this.totallength){
				if (this.LodindStatus == 1) {//正在加载时不继续获取数据
	                return;
	            }
	            this.LodindStatus = 1;
	    		this.pageindex += 1;
				this.getactorslist();
			}else{
				this.bombbox = true;
				this.bombboxtext = '没有更多数据';
			}
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
	created: function(){
		this.getwxcode();
		this.getdetail();
		this.wxshare();
		this.addtraffic();
	}
});