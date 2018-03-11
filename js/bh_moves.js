/*!
 * 依赖文件：jquery-1.11.1
 * 创建人：yuqirong
 * 创建时间：create 2018-02-02
 * 创建版本: v1.0
 * 页面主要: 封装 拖拽
*/

 (function($){

    /*
        $.extend( [deep ], target, object1 [, objectN ] ) 
        函数用于将一个或多个对象的内容合并到目标对象。
        指示是否深度合并  
        也就是将 $.fn.bhDrags.methods,$.fn.bhDrags.defalutes,options 
        多个对象放到指定的目标对象里
    */
     $.fn.bhDrags = function(options){
        var This = this;
        var opts = $.extend({},$.fn.bhDrags.methods,$.fn.bhDrags.defalutes,options);
        opts.inits(This,opts); //初始化
     }

     /*方法设置*/
     //继承fn.bhDrags下的方法
     $.fn.bhDrags.methods = {
         //初始化
         inits:function(obj,opts){
            this.getCenter(obj);
            obj.show().removeClass('animated bounceOutUp').addClass('animated bounceInUp');
            this.resize(obj);
            this.dragMoves(obj,opts);
         },

         //拖拽
         dragMoves:function(obj,opts){
            var _this = this;
            var editTit = obj.children('div').eq(0);
            var $closeBtn = obj.find(opts.closeBtn);
            var $sureBtn = obj.find(opts.suerBtn);
            var $cancleBtn = obj.find(opts.cancleBtn);
            $closeBtn.off('mousedown').on('mousedown',_this.cancleEvent(obj,opts)); //关闭
            $cancleBtn.off("click").on("click",_this.cancleEvent(obj,opts));//取消
            $sureBtn.off('click').on('click',function(){ //确定
                opts.callback && opts.callback();
                $cancleBtn.trigger('click');
            });

            if(opts.isDrag){
                editTit.on('mousedown',function(ev){
                    var ev = ev || window.event;
                    var oldX = ev.clientX;
                    var oldY = ev.clientY;
                    var _left = obj.offset().left;
                    var _top = obj.offset().top;
                    var width = obj.width();
                    var height = obj.height();
                    var scrollLeft = $(window).scrollLeft();
                    var scrollTop = $(window).scrollTop();
                    var dottedPanel = $('<div></div>');
                    dottedPanel.css({
                        'width':width,
                        'height':height,
                        'position':'fixed',
                        'overflow':'hidden',
                        'border-radius':'3px',
                        'left':_left-scrollLeft-2,
                        'top':_top-scrollTop-2,
                        'cursor':'move',
                        'zIndex':'12',
                        'border':'2px dashed #ccc'
                    });
                    $('body').append(dottedPanel);

                    var maxLeft = $(window).width() - width;
                    var maxTop = $(window).height() - height;
                    var isFlag = true;
                    
                    $(document).on('mousemove',dragMove);
                    $(document).on('mouseup',dragUp);

                    //鼠标移动
                    function dragMove(ev){
                        if(isFlag){
                            var e = ev || window.event;
                            var newX = e.clientX;
                            var newY = e.clientY;
                            var newdisx = Math.abs(newX - oldX);
                            var newdisy = Math.abs(newY - oldY);
                            if(newdisx >=10 || newdisy >=10){
                                var newLeft = newX - oldX + _left - scrollLeft;
                                var newTop = newY - oldY + _left - scrollTop;
                                if(newLeft <= 10){
                                    newLeft = 0;
                                }
                                if(newTop <=10){
                                    newTop = 0;
                                }
                                if(newLeft > maxLeft){
                                    newLeft = maxLeft;
                                }
                                if(newTop > maxTop){
                                    newTop = maxTop;
                                }
                                dottedPanel.css({
                                    'left':newLeft,
                                    'top':newTop
                                });
                            }
                        }
                    }

                    //鼠标抬起
                    function dragUp(ev){
                        var resulteLeft = dottedPanel.offset().left;
                        var resulteTop = dottedPanel.offset().top;
                        dottedPanel.remove();
                        if(resulteLeft == _left - scrollLeft -2 && resulteTop == _top-scrollTop - 2){
                            dottedPanel.remove();
                        }else if(resulteLeft == 0 && resulteTop == 0){
                            return false;
                        }else{
                            if(resulteLeft <= 10){
                                resulteLeft = 0;
                            }
                            if(resulteTop <= 10){
                                resulteTop = 0;
                            }
                            var scrollLeft = $(window).scrollLeft();
                            var scrollTop = $(window).scrollTop();
                            obj.animate({
                                'left':resulteLeft - scrollLeft + 2,
                                'top':resulteTop - scrollTop + 2,
                            },300);
                            isFlag = false;
                            $(document).off('mousedown');
                            $(document).off('mouseup');
                        }
                        return false;
                    }
                })
            }
         },

         //窗口改变，继续居中
         resize:function(obj){
            var _this = this;
            $(window).on('resize',function(){
                _this.getCenter(obj,true);
            })
         },

         //事件取消
         cancleEvent:function(obj,opts){
            return function(){
                obj.removeClass('animated bounceInUp').addClass('animated bounceInUp');
                setTimeout(function(){
                    obj.hide();
                },400);
                opts.closeFn && opts.closeFn();
                return false;
            }
         },

         //居中
         getCenter:function(obj,state){
            var height = obj.height();
            var width = obj.width();
            var winW = $(window).width();
            var winH = $(window).height();
            var left = (winW - width) / 2;
            var top = (winH - height) / 2;

            if(!state){
                obj.css({"left":left,"top":top});
            }else{
                obj.stop(true,true).animate({"left":left,"top":top});
            }
         }
     };

     //可配置的信息
     $.fn.bhDrags.defalutes = {
         isDrag:true,//是否可以拖拽，默认为true
         closeBtn:$('.tm_close'),//配置关闭按钮
         suerBtn:$(".tm_sure"),
         cancleBtn:$('.tm_cancel'),
         closeFn:function(){}, //其他方法
         callback:function(){} //回调函数
     };
 })(jQuery);




