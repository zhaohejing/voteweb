var queryString = window.util.getQueryParam();
new Vue({
	el:'#giftpayapp',
	data:{
		actordetailData:'',
		giftslistData:'',
		giftslistindex:'-1',
		activityid:0,
		giftid:0,
		bombbox:false,
		order:'',
		price:0,
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
				this.getgiftslist();
			}, function(data){
				console.log(data.body);
			});
		},
		getgiftslist:function(){
			this.$http({
				method: 'POST',
				url: window.api + '/api/gift/giftsbyactivity',
				body: {
					id: queryString.activityid
				}
			}).then(function(data){
				console.log(data.body);
				this.giftslistData = data.body.result.data;
			}, function(data){
				console.log(data.body);
			});
		},
		giftslistactive:function(activityid,giftid,_index){
			this.giftslistindex = _index;
			this.activityid = activityid;
			this.giftid = giftid;
		},
		sendgifts:function(){
			var _this = this;
			if(_this.activityid != 0 && _this.giftid != 0){
				_this.$http({
					method: 'POST',
					url: window.api + '/api/pay/jspay',
					body: {
						activityId: queryString.activityid,
						actorId: queryString.actorid,
						giftId: _this.giftid,
						redirectUrl: window.api + "/api/pay/notify",
						sendImage: sessionStorage.getItem("headimgurl"),
						sendKey: sessionStorage.getItem("openid"),
						sendName: sessionStorage.getItem("nickname"),
						userIp: returnCitySN.cip
					}
				}).then(function(data){
					//alert(JSON.stringify(data.body));
					_this.order = data.body.result.order;
					_this.price = data.body.result.total_fee;
					if(data.body.success == true){
						wx.ready(function(){
							wx.chooseWXPay({
							    timestamp: data.body.result.timeStamp, // 时间戳
							    nonceStr: data.body.result.nonceStr, // 支付签名随机串，不长于 32 位
							    package: 'prepay_id='+data.body.result.prepay_id, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
							    signType: data.body.result.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
							    paySign: data.body.result.paySign, // 支付签名
							    success: function (res) {
							        // 支付成功后的回调函数
							        //if(res.errMsg == "chooseWXPay:ok"){
								        _this.$http({
											method: 'POST',
											url: window.api + '/api/order/updateState',
											body: {
												activityId: _this.activityid,
												actorId: queryString.actorid,
												giftId: _this.giftid,
												orderNumber: _this.order,
												sendImage: sessionStorage.getItem("headimgurl"),
												sendKey: sessionStorage.getItem("openid"),
												sendName: sessionStorage.getItem("nickname"),
												price: _this.price
											}
										}).then(function(data){
											/*_this.$http({
												method: 'POST',
												url: window.api + '/api/gift/send',
												body: {
													activityId: _this.activityid,
													actorId: queryString.actorid,
													giftId: _this.giftid,
													orderNumber: _this.order,
													sendImage: sessionStorage.getItem("headimgurl"),
													sendKey: sessionStorage.getItem("openid"),
													sendName: sessionStorage.getItem("nickname")
												}
											}).then(function(data){

											},function(data){

											});*/
										},function(data){
											
										});
									//};
							    }
							});
						});
					};
				}, function(data){
					console.log(data.body);
				});
			}else{
				this.bombbox = true;
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
		this.getdetail();
		this.wxshare();
	}
});