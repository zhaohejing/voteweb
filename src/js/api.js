//window.api = decodeURIComponent("http://40.125.200.84:22222");
window.api = decodeURIComponent("http://103.45.10.241:22222");
window.appId = "wxffd841f6f0dd01f8";
document.getElementById('votetitle').innerHTML = window.sessionStorage.getItem("votetitle");
function IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
                "SymbianOS", "Windows Phone",
                "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
};
function isWeiXin(){ 
	var ua = window.navigator.userAgent.toLowerCase(); 
	if(ua.match(/MicroMessenger/i) == 'micromessenger'){ 
		return true; 
	}else{ 
		return false; 
	} 
};
var wxflag = isWeiXin(); //true为微信，false为其他
var flag = IsPC(); //true为PC端，false为手机端
if(flag == true || wxflag == false){
	location.href = 'weixin.html';
}