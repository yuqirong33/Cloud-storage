/*!
 * 依赖文件：jquery-1.11.1
 * 创建人：yuqirong
 * 创建时间：create 2018-02-02
 * 创建版本: v1.0
 * 页面主要: 封装弹窗提示框
*/

/*
    jQuery.fn.extend = jQuery.prototype.extend
*/
 (function($){

    /*
        $.extend( [deep ], target, object1 [, objectN ] ) 
        函数用于将一个或多个对象的内容合并到目标对象。
        指示是否深度合并  
        也就是将 $.popUp.methods,$popUp.defalutes,options  
        多个对象放到指定的目标对象里
    */
    $.popUp = function(options){
        var This = this;
        var opts = $.extend({},$.popUp.methods,$.popUp.defalutes,options); //对象 方法设置 可配置信息
        opts.inits(opts);  
    }

    //方法设置 
    //继承popUp下的方法
    $.popUp.methods = {
        //初始化
        inits:function(opts){
            var _this = this;
            _this.template(opts); //初始化模板 传入opts参数
        },

        //拖拽弹窗 
        dragMoves:function(obj,opts){
            var _this = this;
            var editTlt = obj.find('.tm_title');   //获取标题
            var $closeBtn = obj.find('.tm_close'); //获取关闭按钮
            var $sureBtn = obj.find('.tm_sure');   //获取确定按钮
            var $cancleBtn = obj.find('.tm_cancel'); //获取清除按钮

            $closeBtn.off('mousedown').on('mousedown',_this.cancleEvent(obj)); //当鼠标点击关闭按钮的时候关闭弹窗
            $cancleBtn.off('click').on('click',_this.cancleEvent(obj)); //当鼠标点击清除按钮的时候关闭弹窗
            $sureBtn.off('click').on('click',function(){ //点击确定按钮要做的事情
                var timer = setTimeout(function(){
                    opts.success && opts.success(); //点击确定完了之后执行回调函数
                    clearTimeout(timer); //清除定时器
                },500);
                _this.cancleEvent(obj)();  //关闭弹窗 这里后面试用了一个括号 调用了闭包  
            });

            if(opts.isDrag){  //如果为true的时候执行
                editTlt.on('mousedown',function(ev){  //鼠标拖动标题的时候可以给弹窗进行拖拽
                    var ev = ev || event;
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
                        'height': height,
                        'position':'fixed',
                        'overflow':'hidden',
                        'border-radius':'3px',
                        'left': _left - scrollLeft - 2,
                        'top': _top - scrollTop - 2,
                        'cursor':'move', //拖拽icon
                        'zIndex':'12',
                        'border':'2px dashed #ccc'
                    });
                    $('body').append(dottedPanel);

                    var maxLeft = $(window).width() - width;
                    var maxTop = $(window).height() - height;
                    var isFlag = true;

                    $(document).on('mousemove',dragMove);
                    $(document).on('mouseup',dragUp);

                    //移动
                    function dragMove(ev){
                        if(isFlag){
                            var e = ev || event;
                            var newX = e.clientX;
                            var newY = e.clientY;
                            var newdisx = Math.abs(newX - oldX);
                            var newdisy = Math.abs(newY - oldY);

                            if(newdisx >= 10 || newdisy >=10){
                                var newLeft = newX - oldX + _left - scrollLeft;
                                var newTop = newY - oldY + _top - screenTop;
                                if(newLeft <= 0){
                                    newLeft = 0;
                                }
                                if(newTop <= 0){
                                    newTop = 0;
                                }
                                if(newLeft > maxLeft){
                                    newLeft = maxLeft;
                                } 
                                if(newTop > maxTop){
                                    newTop = maxTop;
                                }
                                dottedPanel.css({'left':newLeft,'top':newTop});
                            }
                        }
                    }

                    //鼠标抬起的时候
                    function dragUp(ev){
                        var resulteLeft = dottedPanel.offset().left;
                        var resulteTop = dottedPanel.offset().top;
                        dottedPanel.remove();

                        if(resulteLeft == _left - scrollLeft - 2 && resulteTop == _top - scrollTo - 2){
                            dottedPanel.remove();
                        }else if(resulteLeft == 0 && resulteTop == 0){
                            return false;
                        }else{
                            if(resulteLeft <=0 ){
                                resulteLeft = 0;
                            }
                            if(resulteTop <=0 ){
                                resulteTop = 0;
                            }
                            var scrollLeft = $(window).scrollLeft();
                            var scrollTop = $(window).scrollTop();
                            obj.animate({
                                'left':resulteLeft - scrollLeft + 2,
                                'top':resulteTop - scrollTop + 2,
                            },300);
                        }
                        isFlag = false;
                        $(document).off('mousedown');
                        $(document).off('mouseup');
                    }
                    return false;
                });
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
        cancleEvent:function(obj){
            //点击取消按钮，添加取消事件 以缓慢滑动的形式关闭遮罩层和弹窗信息
            return function(){
                obj.removeClass('animated bounceInUp').addClass('animated bounceOutUp');
                $('#tm-overlay').fadeOut();
                setTimeout(function(){
                    obj.remove();
                    $('#tm-overlay').remove();
                },400);
                return false;
            }
        },

        //居中
        getCenter:function(obj,state){
            var height = obj.height();
            var width = obj.width();
            var winW = $(window).width();
            var winH = $(window).height();
            var left = (winW - width)/2;
            var top = (winH - height)/2;

            if(!state){
                obj.css({
                    'left':left,
                    'top':top
                });
            }else{
                obj.stop(true,true).animate({
                    'left':left,
                    'top':top
                });
            }
        },

        template:function(opts){
            var tm_dialog = $('#tm_dialog');
            var coverlayer = $('#tm-overlay');
            if(tm_dialog.html() == undefined){ //如果没有模板的情况下就添加模板，如果模板存在那么就关闭模板 显示新的模板
                tm_dialog = $(
                    `<div class='tm_dialog' id='tm_dialog'>
								<div class='tm_title'>
									<h2 id='tm_title'>${opts.title}</h2>
									<a href='javascript:void(0)' class='tm_close'></a>
								</div>
								<div class='tm_contents'>
								<p class='tips-title'>${opts.contents}</p>
								</div>
								<div class='tm-btns'>
									<a href='javascript:void(0)' class='tm_sure'>确认</a>
									<a href='javascript:void(0)' class='tm_cancel'>取消</a>
								</div>
					</div>`
                );
                coverlayer = $('<div class="tm-overlay" id="tm-overlay"></div>'); //遮罩层
                $('body').append(tm_dialog);
                $('body').append(coverlayer);
                
                this.getCenter(tm_dialog);
                coverlayer.stop().fadeIn();
                tm_dialog.show().removeClass('animated bounceOutUp').addClass('animated bounceInUp');
                this.resize(tm_dialog);
                this.dragMoves(tm_dialog,opts);
            }else{
                coverlayer.stop().fadeIn();
                tm_dialog.find('#tm_title').html(opts,title);
                tm_dialog.find('.tips-title').html(opts,contents);
                tm_dialog.show().removeClass('animated bounceOutUp').addClass('animated bounceOutUp');
            }
            return tm_dialog;
        }
    };

    //可配置的信息
    $.popUp.defalutes = {
        isDrag:true,
        title:'标题',
        contents:'内容',
        success:function(){}
    };

 })(jQuery);






