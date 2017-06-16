var MyCountdown = Vue.extend({
    template: '<div class="countdowntime">'
			+		'<div class="countdowncont">{{day}}天</div>'
			+		'<div class="countdowncont">{{hour}}时</div>'
			+		'<div class="countdowncont">{{minute}}分</div>'
			+		'<div class="countdowncont">{{second}}秒</div>'
			+		'<div class="clear"></div>'
			+	'</div>',
	data:function(){
	  return {
	    day: '0',
	    hour: '00',
	    minute: '00',
	    second: '00'
	  }
	},
	props: ['endtime'],	
	methods:{
		getCountdown:function(){
			//获取当前时间  
            var date = new Date();  
            var now = date.getTime();  
            //设置截止时间
            var end = this.endtime;
            //时间差
            var leftTime = end-now;
            if (leftTime>=0) {  
                this.day = Math.floor(leftTime/1000/60/60/24);  
                this.hour = Math.floor(leftTime/1000/60/60%24);  
                this.minute = Math.floor(leftTime/1000/60%60);  
                this.second = Math.floor(leftTime/1000%60);
                if (this.hour < 10) {
					this.hour = '0' + this.hour;
				};
				if (this.minute < 10) {
					this.minute = '0' + this.minute;
				};
				if (this.second < 10) {
					this.second = '0' + this.second;
				};                
            }else{
            	this.hour = this.hour;
            	this.minute = this.minute;
            	this.second = this.second;
            	clearInterval(this.getCountdown);
            }
		    setTimeout(this.getCountdown,1000);
		}
	},
	created: function() {
		this.getCountdown();
	}
});
// 注册
Vue.component('countdown', MyCountdown)