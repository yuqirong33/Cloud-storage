/*!
 * 依赖文件：jquery-1.11.1
 * 创建人：yuqirong
 * 创建时间：create 2018-02-02
 * 创建版本: v1.0
 * 页面主要: 封装 提示信息
*/

(function($){
    
    //接口
    /*
        $.extend( [deep ], target, object1 [, objectN ] ) 
        函数用于将一个或多个对象的内容合并到目标对象。
        指示是否深度合并  
        也就是将 $.bhTips.methods,$.bhTips.default,options  
        多个对象放到指定的目标对象里
    */
    $.bhTips = function(options){
        var opts = $.extend({},$.bhTips.methods,$.bhTips.default,options);
        opts.init(opts);
    }

    //方法
    //继承bhTips下的方法
    $.bhTips.methods = {  
        //初始化方法
        init:function(opts){
            this.template(opts); //初始化模板
        },
        
        //模板
        template:function(opts){
            var $tips = $('tm_tips'); //获取提示框元素
            if($tips.html() == undefined){ //一个页面只有一个提示框
                $tips = $("<div id='tm_tips' class='tm_tips "+opts.controls+"' style='top:-50px'><i class='icon'></i><span>"+opts.content+"</span></div>");
                $('body').append($tips);  //将$tips模板插入到body中
                this.event($tips,opts);   //出来的时候给元素事件居中和滑动效果
            }else{
                //如果页面上有提示框，那么删除并重新初始化事件
                var newName = $tips.attr('class').split(' ');
                for(i=0;i < newName.length;i++){
                    if(newName[i] == 'tm_success' || newName[i] == 'tm_warning'){
                        $tips.removeClass(newName[i]);
                    }
                }
                $tips.addClass(opt.controls);
                $tips.find('span').html(opts.content);
                this.event($tips,opts);//重新初始化事件
            }
            $tips.animate({top:0},500);
        },

        //设置模板居中
        setCenter:function($tips){
            var winW = $(window).width();
            var lw = $tips.width();
            var left = (winW - lw) / 2;
            $tips.css({
                'left':left
            });
        },

        //为tips绑定事件 滑动和居中事件
        event:function($tips,opts){
            var _this = this;
            this.setCenter($tips);
            //窗口居中事件
            $(window).resize(function(){
                _this.setCenter($tips);
            });

            //窗口居中时 滑动事件
            $tips.timer = setTimeout(function() {
               clearTimeout($tips.timer);
               $tips.animate({top:-50},300);
            }, opts.timer * 800);
        }
    };

    //默认配置模板
    /*
        提示方式：
            tm_success ： 成功
            tm_warning ：警告
    */
    $.bhTips.default = {
        content:'请稍候，数据正在加载中...', //提示内容
        controls:'tm_success',
        timer:1 //时间
    }
})(jQuery);