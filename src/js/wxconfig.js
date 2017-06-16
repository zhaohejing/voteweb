	function randomString(len) {
    　　len = len || 32;
    　　var $chars = 'abcdefghijklmnopqrstvuwxyz0123456789ABCDEFGHIJKLMNOPQRSTVUWXYZ';  
    　　var maxPos = $chars.length;
    　　var pwd = '';
    　　for (i = 0; i < len; i++) {
    　　　　pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    　　}
    　　return pwd;
    }
	var appId = window.appId;
    var code = window.sessionStorage.getItem("accesscode");
	var timestamp =  new Date().getTime();
	var nonceStr = randomString(32);
	var pageUrl = encodeURIComponent(window.location.href.split('#')[0]);
    var sign ='';
    /*$.ajax({
    	type:'POST',
    	url: window.api + '/api/token/getWxSignature?noncestr='+nonceStr+'&timestamp='+timestamp+'&url='+pageUrl,
        data:{},
        dataType: 'json',
        success:function(data){
    		sign = data.result;
    		wx.config({
                debug: false, // 开启调试模式
                appId:appid , // 必填，公众号的唯一标识
                timestamp: timestamp, // 必填，生成签名的时间戳
                nonceStr: nonceStr, // 必填，生成签名的随机串
                signature: sign,// 必填，签名
                jsApiList: [
                    'checkJsApi',
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'onMenuShareQQ',
                    'onMenuShareWeibo',
                    'onMenuShareQZone',
                    'chooseImage',
                    'previewImage',
                    'uploadImage',
                    'chooseWXPay'
                ]  // 必填，需要使用的JS接口列表
            });
        }
	});*/
new Vue({
    el:'body',
    data:{},
    methods:{
        getWxSignature:function(){
            this.$http({
                method: 'POST',
                url: window.api + '/api/token/getWxSignature?noncestr='+nonceStr+'&timestamp='+timestamp+'&url='+pageUrl,
                body: {}
            }).then(function(data){
                console.log(data.body);
                sign = data.body.result;
                wx.config({
                    debug: false, // 开启调试模式
                    appId: appId, // 必填，公众号的唯一标识
                    timestamp: timestamp, // 必填，生成签名的时间戳
                    nonceStr: nonceStr, // 必填，生成签名的随机串
                    signature: sign,// 必填，签名
                    jsApiList: [
                        'checkJsApi',
                        'onMenuShareTimeline',
                        'onMenuShareAppMessage',
                        'onMenuShareQQ',
                        'onMenuShareWeibo',
                        'onMenuShareQZone',
                        'chooseImage',
                        'previewImage',
                        'uploadImage',
                        'chooseWXPay'
                    ]  // 必填，需要使用的JS接口列表
                });
            }, function(data){
            });
        }
    },
    created: function() {
        this.getWxSignature();
    }
});