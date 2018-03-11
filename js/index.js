/*!
 * 依赖文件：jquery-1.11.1
 * 创建人：yuqirong
 * 创建时间：create 2018-02-02
 * 创建版本: v1.0
 * 页面主要: 主要js,所有操作的方法
*/

(function(){
	var datas = data;
	var main  = function(){
		var tools = {
			
			//初始化
			init : function(){
				tools.setViewH(); //初始化view的高度
				
				//下拉菜单
				tools.showDropDownMenu("mainUser-info","userheder","infosTool","active");
				tools.showDropDownMenu("viewMode","sortMode","sortMd_lists","active");

				//渲染树形菜单
				tools.drawTreeMenu(datas,-1); 
				
				//绑定 菜单切换
				tools.changeMenu(datas); 
				
				//初始化文件选中
				tools.selectFolder(); 
				
				//初始化工具方法
				tools.handleFn(); 
				
				$(window).resize(function(){
					tools.setViewH();
				});
			},
			
			//工具方法：下载，分享，移动，重命名，删除，新建文件夹，切换视图
			handleFn : function(){
				var _this = this;

				//下载 暂时没有这个功能先用跳窗的方式提示
				$('#download').on('click',function(){
					//引用封装好的提示框
					$.bhTips({
						content:"暂无下载链接！",
						controls : "tm_warning",
						timer:2
					});
				});

				//点击分享按钮执行事件
				$('#share').on('click',function(){
					$('#overlayout').fadeIn(); //淡淡渐入显示
					//弹窗弹出 使用封装好的拖拽
					//$('#shareS')分享弹窗元素
					$('#shareS').bhDrags({
						isDrag:true,  //是否可以拖拽
						closeBtn:$('.close'),  //关闭按钮
						cancleBtn:$('.cancle'), //取消按钮
						closeFn:function(){  
							$('#overlayout').fadeOut(); //关闭时候触发，关闭遮罩层
						}
					});
					
					//分享弹窗元素 找到下面的a标签 点击a标签执行关闭弹窗
					$('#shareS').find('.bdsharebuttonbox > a').on('click',function(){
						$('#overlayout').fadeOut();   //遮罩层关闭
						$('#shareS').fadeOut();  //分享弹窗关闭
					});
				});

				//点击移动
				$('#move').on('click',function(){
					var moveFile = $('#filesView').find('.active'); //获取当前选中的文件
					if(!moveFile.length){
						//如果没有选中的文件夹那么提示：请选择文件夹
						$.bhTips({
							content:'请选择文件夹',
							controls:'tm_warning',
							timer:3
						});
					}else if(moveFile.length >= 2){ 
						//选择文件夹的数量只能为一个提示只能选择一个文件夹
						$.bhTips({
							content:'只能对单个文件夹进行移动！',
							controls:'tm_warning',
							timer:2
						});
					}else{ //选中一个文件夹进行移动
						$('#overlayout').fadeIn(); //遮罩层显示

						//重新进行数据的渲染 目录结构
						var treeMenu = $('#treeMenuPanel');
						var TreeMenuHtml = template.treeMenuTemplate(datas,-1);
						treeMenu.html(TreeMenuHtml);
						_this.selctCurrTreeMenu(treeMenu,0); //默认选中第一个

						//为当前的属性目录绑定选中事件
						$('#treeMenuPanel').off('click').on('click','.title',function(){
							$('#treeMenuPanel').find('.title').removeClass('active');
							$(this).addClass('active');
						});

						//弹窗选中文件移动位置的选择
						$('#moveToOther').bhDrags({
							isDrag:true,  //是否拖拽
							closeBtn:$('.close'),
							suerBtn:$(".sure"),
							cancleBtn:$('.cancle'),
							closeFn:function(){
								$('#overlayout').fadeOut(); //点击关闭按钮时触发关闭遮罩层
							},
							callback:function(){ //成功回调
								var currentId = moveFile.data('file-id'); //给要移动的文件添加数据 id
								var moveArea = $('#treeMenuPanel').find('.active'); //要移动到的位置
								var targetId = moveArea.data('file-id'); //获取目标位置的file-id

								//如果要移动的文件与目标位置相同 提示移动失败
								if(currentId === targetId){

									$.bhTips({
										content:'文件移动失败，重新选择目标位置！',
										controls:'tm_warning',
										timer:2
									});

								}else{ //找到需要移动到的位置
									//获取当前要移动的目标位置的所有父级 为了移动时候 父级不能移动到子级
									var parents = dataControl.getParents(datas,targetId);

									//去除本身元素
									for(var i = 0;i<parents.length;i++){
										if(parents[i].id == targetId){
											parents.splice(i,1);
										}
									}

									//判断要移动到的目标位置 是不是要移动的文件的子文件
									var isExist = dataControl.isChildsOfCurrent(parents,currentId);

									if(!isExist){
										//获取当前要移动的文件的层级
										var currentLevel = dataControl.getLevelById(datas,targetId);
										//获取目标位置文件的子级存放的层数（+1是需要在下一级显示）
										var targetLevel = dataControl.getLevelById(datas,targetId) + 1;

										//如果目标位置与当前所在位置相同
										if(targetId == $("#getPidInput").val()){
											$.bhTips({
												content:'文件移动失败，重新选择目标位置',
												controls:'tm_warning',
												timer:3
											});
											return false;
										}else if((currentLevel === targetLevel && !isExist) || currentLevel != targetLevel){
											//不在同一级或者在同一级 当父级不同 就可以移动
											var currentIdAllChilds = []; //存放选中文件的所有子元素 包括自身

											//获取选中文本 自身的数据
											for(var i=0;i<datas.length;i++){
												if(datas[i].id == currentId){
													datas[i].pid = targetId; //修改parent的ID
													currentIdAllChilds.push(datas[i]);
												}
											}

											//获取选中文件的所有子文件数据
											function getAllChilds(data,pid){
												for(var i=0;i<data.length;i++){
													if(data[i].pid == pid){
														currentIdAllChilds.push(data[i]);
														getAllChilds(data,data[i].id); //递归查找
													}
												}
											}
											getAllChilds(datas,currentId);

											//删除要移动的文件
											moveFile = $('#filesView').find('active');
											moveFile.remove();

											//删除详细列表中的对应file
											$('#filesLists').find("files[data-file-id='"+currentId+"']").remove();

											if($('#filesView').html() == ''){
												$('#view-of-icon').hide();
												$('#noFileTips').addClass('noFileTipsShow');
												$('#selectAllFiles').removeClass('sel');
											}

											//循环更新移动的文件id,并创建新的树形目录结构
											currentIdAllChilds.forEach(function(e){
												var newF = {
													id:new Date().getTime() + Math.floor(Math.random() * 100),//避免id重复
													title:e.title, //文件名
													level:targetLevel++ //层级 要在第几层显示
												};
												for(var i=0;i<datas.length;i++){
													if(datas[i].id == e.id){
														datas[i] == newF.id; //更新原始数据的id
														e.id = newF.id; //更新当前要移动的多有文件id
													}
												}
											});

											//修改每个元素pid 根据这个pid来更新原始数据的pid
											for(var i=1;i<currentIdAllChilds.length;i++){
												currentIdAllChilds[i].pid == currentIdAllChilds[i-1].id;
											}
											
											//更新原始数据
											for(var i=0;i<datas.length;i++){
												for(var j=0;j<currentIdAllChilds.length;j++){
													if(datas[i].id == currentIdAllChilds[j].id){
														datas[i].pid == currentIdAllChilds[j].pid;
													}
												}
											}

											//更改树形目录的各级状态
											var treeMenu = $('#treeMenu');
											var TreeMenuHtml = template.treeMenuTemplate(datas,-1);
											treeMenu.html(TreeMenuHtml);
											_this.selctCurrTreeMenu(treeMenu,$('#getPidInput').val()); //默认选中上一次选中过的
										}else{
											$.bhTips({
												content:'文件移动失败，请重新选择目录位置！',
												controls:'tm_warning',
												timer:3
											});
										}
									}
								}
							}
						});
					}
				});

				//重命名
				$('#rename').on('click',function(){

					//获取要重命名的文件
					var renameFile = '';
					var viewMode = $('#changeView').data('view');

					//切换试图执行的事件
					if(viewMode == 'lists'){  //缩略图
						renameFile = $('#filesLists').find('.active');
						reNameOfFile(renameFile);
					}else{  //列表
						renameFile = $('#filesView').find('.active');
						reNameOfFile(renameFile);
					}

					function reNameOfFile(renameFile){
						//如果没有要重命名的文件
						if(!renameFile.length){

							$.bhTips({
								content:'请选择文件',
								controls:'tm_warning',
								timer:1
							});
							
						}else if(renameFile.length >= 2){  //只能选择一个文件重命名

							$.bhTips({
								content:'只能对单个文件重命名！',
								controls:'tm_warning',
								timer:1
							});

						}else{
							//选择一个文件夹重命名执行事件
							//获取文件名box
							var filename = renameFile.find('.filename');
							//获取当前重命名编辑框
							var editorInput = renameFile.find('.txt');
							//获取当前重名的文件ID
							var fileId = renameFile.data('file-id');
							//获取对应的树形目录的title
							var treeTitle = $('#treeMenu').find(".title[data-file-id='"+fileId+"']");
							//所有的文件
							var allFiles = $('#view-of-icon .details').find(".files[data-file-id='"+fileId+"']");
							//添加样式 开始重命名 显示命名框
							renameFile.addClass('reNameFile');
							editorInput.val(filename.html());
							editorInput.select();

							//当编辑框失去焦点 执行内容
							editorInput.on('blur',function(){

								var val = $(this).val();

								//判断重命名 文本框中命名是否为空
								if(val.trim() == ''){

									//文件夹名称为空的时候提示请输入文件名
									$.bhTips({
										content:"请输入文件名字",
										controls : "tm_warning",
									});
									//重新获取焦点
									editorInput.focus();

								}else{

									var parentId = $('#getPidInput').val();
									var isExist = dataControl.isNameExsit(datas,parentId,val,fileId);

									//如果此文件存在 提示：文件名不能重命名
									if(isExist){ 

										$.bhTips({
											content:'文件名不能重命名！',
											conlists:'tm_warning'
										});
										editorInput.select();

									}else{

										//更新文件名
										allFiles.find('.filename').html(val);
										treeTitle.find('span').html(val); //更新树形菜单对应的名字

										//更新修改后的数据
										var isChangeSucc = dataControl.changeNameById(datas,fileId,val);
										
										//更新提示成功
										if(isChangeSucc){
											$.bhTips({
												content:'重命名成功',
												  controls:'tm_success'
											});
											renameFile.removeClass('reNameFile');
											editorInput.off('blur');  //清除绑定事件
										}else{
											//命名失败，请查看网络
											$.bhTips({
												content:'重命名失败，请坚持网络。。',
												controls:'tm_warning'
											});
										}

									}
								}
							});
						}
					}
				});


				//删除
				$("#cancle").on("click",function(){

					//获取到要删除的文件夹
					var selFile = $("#filesView").find(".active");

					//判断是否有选中的要删除的文件
					if(!selFile.length){ //如果没有选中的文件 那么提示请选中要删除的文件

						$.bhTips({
							content:"请选中要删除的文件！",
							controls : "tm_warning",
							timer:1
						});

					}else{

						//选中要删除的文件 友情提示：确定要删除文件吗
						$.popUp({ //删除提示
							title : "友情提示",
							contents : "你确定要删除么？",
							success : function(){ //确定删除执行回调函数

								selFile.remove(); //删除选中文件夹

								//循环选中的文件有多少个
								for(var i=0;i<selFile.length;i++){
									
									var id = $(selFile[i]).data("file-id"); //找到每一个选中删除文件夹的id

									//获取对应的树形菜单 menu
									var trueMenus = $("#treeMenu").find(".title[data-file-id="+id+"]");
									$("#filesLists").find(".files[data-file-id="+id+"]").remove();
									//删除对应的树形菜单
									trueMenus.parent().remove();

									//删除对应的数据
									var newArr = [];
									function del(data,pid){
										for(var i=0;i<data.length;i++){
											if(data[i].pid == pid){
												newArr.push(data[i])
												del(data,data[i].id); //递归查找子元素，
											}
										}
									}
									del(datas,id);
									dataControl.delDataByArr(datas,newArr,id); //删除数据

								}

								//缩略图 为空，显示提示文字 隐藏view
								if($("#filesView").html() == ""){
									$("#noFileTips").addClass("noFileTipsShow"); //显示无文件提示
									$("#view-of-icon").hide();

									//树形菜单去下下拉状态
									$("#treeMenu").find(".title[data-file-id="+$("#getPidInput").val()+"]").removeClass("control").addClass("control-none");
									//取消全选按钮选中状态
									$("#selectAllFiles").removeClass("sel");
								}

								//提示文件删除成功
								$.bhTips({
									content:"文件删除成功！",
									controls : "tm_success",
									timer:1
								});
							}
						});
					}
				});

				//新建文件夹
				$('#newfolder').on('click',function(){
					$('#noFileTips').removeClass('noFileTipsShow'); //隐藏提示
					$('#view-of-icon').show(); //显示视图
					var viewMode = $('#changeView').data('view');
					if(viewMode == 'lists'){
						createnNewFile('filesLists');
					}else{
						createnNewFile('filesView');
					}

					function createnNewFile(filesView){
						var newFile = $('#'+filesView).find('.newFile'); //获取新建的文件夹
						var time = dataControl.getDates();
						//如果不存在刚刚新建的文件夹，那么开始新建 不妙多次创建文件夹
						if(!newFile.length){
							var newFile = {
								title:'新建文件夹', //新建文件夹的名称
								id:new Date().getTime(), //避免新建ID重复
								timer:time
							};
							//在是视图中添加新建的文件夹
							$('#filesView').prepend(template.createFile(newFile));
							$('#filesLists').prepend(template.createListsFile(newFile));

							//获取新创建的文件
							var createNewFile = $('#'+filesView).find('.newFile');
							//获取编辑文件 输入框
							var editor = createNewFile.find('.txt');
							editor.select();

							//当编辑完了以后 进行事件绑定
							editor.on('blur',function(){
								var val = $(this).val();
								if(val.trim() == ''){
									//移除新建的文件 表示新建失败
									createNewFile.remove();

									//缩略图为空 显示提示文字 隐藏缩略图
									if($('#filesView').html() == ''){
										$('#noFileTips').addClass('noFileTipsShow');
										$('#view-of-icon').hide();
									}
									//提示文件新建失败
									$.bhTips({
										content:'新建文件夹失败！',
										controls:'tm_warning'
									});
								}else{
									//在那里新建的内容？获取新建内容的父id 放在隐藏域里面
									var parentId = $('#getPidInput').val();
									var fileid = createNewFile.data('file-id');

									var isExist = dataControl.isNameExsit(datas,parentId,val,newFile.id);

									//如果该文件夹的名字存在
									if(isExist){
										//提示文件不能重名
										$.bhTips({
											content:'文件不能重名！',
											controls:'tm_warning',
											timer:2
										});
										editor.select();
									}else{
										//开始创建 更新数据
										var newFileDate = {
											id:newFile.id,
											pid:parentId,
											title:val,
											timer:newFile.timer
										};

										//更新title
										createNewFile.find('.filename').html(val);

										$('#filesView').find(".files[data-file-id='"+newFile.id+"'] .filename").html(val);
										$('#filesLists').find(".files[data-file-id='"+newFile.id+"'] .filename").html(val);

										//移除相关的样式 创建成功 在当前显示
										createNewFile.removeClass("reNameFile newFile");

										$('#filesView').find('.files').removeClass('reNameFile newFile');
										$('#filesLists').find('.files').removeClass('reNameFile newFile');

										//实时更新数据 为数据新增加的
										datas.push(newFileDate);

										//创建对应树形菜单
										var iNowPrentMenu = $('#treeMenu').find(".title[data-file-id='"+parentId+"']");
										//获取相邻的元素  为了存放新创建的树形菜单
										var sibEle = iNowPrentMenu.siblings('ul');

										//获取新创建的文件应该存放到第几级
										var leave = dataControl.getLevelById(datas,fileid);

										//增加树形目录
										sibEle.append(template.createTreeMenu({ //更新树形菜单
											id:fileid,
											title:val,
											level:leave
										}));

										if(sibEle.html() != ''){
											//如果子元素为空，那么添加下拉小图标 就是移除 control-none 样式
											iNowPrentMenu.addClass('control').removeClass('control-none');
										}

										$('#selectAllFiles').removeClass('sel');

										//提示文件创建成功
										$.bhTips({
											content:'新建文件夹成功！',
											controls:'tm_success'
										});

										//创建成功后取消当次blur事件 避免重命名 出错
										editor.off('blur');
									}
								}
							});
						}else{
							var inputTxt = newFile.find('.txt');
							inputTxt.focus();
						}
					}
				});

				//刷新
				$('#refresh').on('click',function(){
					location.reload();
				});


				//切换试图 缩略图变成列表  列表变为缩略图
				$('#changeView').on('click',function(){
					
					//如果正在新建文件夹时切换视图 移除所有正在新建的文件 以免出错
					$('#view-of-icon').find('.newFile').remove();

					var modes = $(this).data('view'); //获取当前的试图方式
					var isNullFile = $('#view-of-icon').find('.details').html();

					if(isNullFile.trim() !== ""){ //切换 视图方式 

						if(modes === 'lists'){  

							$(this).data('view','view');
							$('#filesView').show();
							$("#filesLists").hide();

						}else{    //切换为列表方式
							
							$(this).data('view','lists');
							$('#filesView').hide();
							$('#filesLists').show();
						}

					}else{

						$.bhTips({
							content:'试图切换失败，暂无文件',
							controls:'tm_warning',
							timer:2
						});

					}
				});



				/*
					详细列表操作事件绑定：
						下载
						分享
						移动
						删除
						重命名
				*/
				//下载
				$('#view-of-icon').on('mousedown','.tools .download',function(){
					$.bhTips({
						content:'抱歉，无法生成下载链接',
						controls:'tm_warning',
						timer:2
					});
					return false;
				});

				//分享
				$('#view-of-icon').on('mousedown','.tools .share',function(){
					$.bhTips({
						content:'抱歉，暂时没有分享，正在进行开发...',
						controls:'tm_warning',
						timer:2
					});
					return false;
				});

				//移动
				$('#view-of-icon').on('mousedown','.tools .move',function(){
					triggerFn($(this,'只能移动当前一条数据',function(){
						$('#move').trigger('click');
					}));
				});

				//删除
				$('#view-of-icon').on('mousedown','.tools .cancle',function(){
					triggerFn($(this,'只能删除当前数据',function(){
						$('#cancle').trigger('click');
					}));
				});

				//重命名
				$('#view-of-icon').on('mousedown','.tools .rename',function(){
					triggerFn($(this,'只能重命名当前数据',function(){
						$('#rename').trigger('click');
					}));
				});

				function triggerFn(obj,val,cb){
					
					var parent = obj.parents('.files');

					if(parent.hasClass('active')){
						var ac = $('#filesLists').find('.active');
						var len = ac.length;
						if(len >= 2){
							$.bhTips({
								content:val,
								controls:'tm_warning',
								timer:2
							});
							return false;
						}else{
							cb && cb();
						}
					}else{
						$.bhTips({
							content:val,
							controls:'tm_warning',
							timer:2
						});
						return false;
					}
				}

				/*
					按时间排序
					显示缩略图
					发表留言板
				*/
				//时间排序
				$("#sort_timer").on("click",function(){
					var sortmode = $(this).data('sortmode');
					var sortDatas = datas;

					for(var i=0;i<sortDatas.length;i++){
						sortDatas[i].numbers = sortDatas[i].timer.replace(/-/g,'');
					}

					if(sortmode == 'up'){  //升序
						$(this).data('sortmode','bottom');
						$(this).attr('title','降序');
						dataControl.sorts(sortDatas,'numbers',true);
					}else{		//降序
						$(this).data('sortmode','up');
						$(this).attr('title','升序');
						dataControl.sorts(sortDatas,'numbers',false);
					}
					selSortedOrg(sortDatas);

				});

				//排序后选中原来选中的
				function selSortedOrg(sortDatas){
					var orgSel = [];
					var active = $('#filesLists').find('active');
					active.each(function(e,i){
						orgSel.push($(e).data('file-id'));
					});
					_this.drawFiles(sortDatas,$('#getPidInput').val());
					if(orgSel.length >= 1){
						for(var i=0;i<orgSel.length;i++){
							$("#filesLists").find(".files[data-file-id='"+orgSel[i]+"']").addClass("active");
							$("#filesView").find(".files[data-file-id='"+orgSel[i]+"']").addClass("active");
						}
					}
				}

				//发表留言板
				$("#sendComments").on("click",function(){
					$("#messageslay").fadeIn();  //显示弹层
					var CtNum = $('#CtNum').html();

					$(document).on('keyup',function(){ //当鼠标抬起的时候 计算文本框输入了多少文字
						var text = $('#comment-text').val();
						var counter = text.length;
						if(counter > CtNum){
							var newText = text.substring(0,CtNum);
							$('#comment-text').val(newText);
						}else{
							$('#CtNum').html(CtNum - counter);  //计算输入了多少文字
						}
					});
					$('#comment-text').focus();
					$('#messages').bhDrags({
						isDrag:false,
						closeBtn:$('.close'),
						closeFn:function(){
							$('#messageslay').fadeOut();
						},
						suerBtn:$('.btn_comment'),
						callback:function(){
							var  val = $("#comment-text").val();
							if(val.trim() != ''){ //留言板内容不为空的情况下
								var newData = {
									cons:val,
									timer:dataControl.getDates()+" "+dataControl.getTimers()
								}
								var html = template.commentTemp(newData); //留言板中加入时间和内容
								$("#comment-text").val("");
								$('#CtNum').html('160');
								$("#messages").find(".comment-lists").prepend(html);
								$('#messages').bhDrags({
									isDrag:false
								});
							}
						}
					});
				});


				//显示缩略图
				$('#show_thumbnail').on('click',function(){
					$('#filesView').show();
					$("#filesLists").hide();
					$("#changeView").data('view','view');
				});

			},
			
			//菜单切换包括：树形菜单切换、面包屑导航切换
			changeMenu : function(data){
				var _this = this;
				//树形菜单切换
				$("#treeMenu").on("click",".title",function(){
					changeMenus($(this));
				});
				
				//面包屑当行切换
				$("#breadNav").on("click","li>a",function(){
					changeMenus($(this));
				});
				
				//切换导航
				function changeMenus(currentMenu){
					var obj = $("#treeMenu");
					var currId = currentMenu.data("file-id"); //获取当前id
					_this.selctCurrTreeMenu(obj,currId); //选中当前点击的menu
					_this.drawBreadNav(data,currId); //重新渲染面包屑导航
					$("#getPidInput").val(currId); //缓存当前 id ,为后续删除做准备
					$("#selectAllFiles").removeClass("sel"); //切换菜单时取消全选按钮的状态
				}
			},
			
			//文件夹选中
			selectFolder : function(){
				
				var _this = this;
				//点击选中按钮，选中文件夹ctrl多选，取消多选
				$("#view-of-icon").find(".details").on("mousedown",".files .selectBox",function(ev){
					var parents = $(this).parents(".files");
					var id = parents.data("file-id");

					$("#filesLists").find(".files[data-file-id='"+id+"']").toggleClass("active");
					$("#filesView").find(".files[data-file-id='"+id+"']").toggleClass("active");
					
					_this.selectCheckAllBtn();
					return false;
				});
				
				//点击全选按钮选中所有的文件
				$("#selectAllFiles").on("click",function(){
					$(this).toggleClass("sel");
					var isSel = $(this).hasClass("sel"); //当前全选按钮是否选中
					if(isSel){
						$("#filesLists").find(".files").addClass("active");
						$("#filesView").find(".files").addClass("active");
					}else{
						$("#filesLists").find(".files").removeClass("active");
						$("#filesView").find(".files").removeClass("active");
					}
				});
				
				// 拖拽选中
				$("#view-of-icon").off().on("mousedown",function(ev){
					
					var disX = ev.clientX;
					var disY = ev.clientY;
					var newCase = $("<div></div>"); //创建拖选框
					var minleft = $("#view-of-icon").offset().left;
					var mintop = $("#view-of-icon").offset().top;

					newCase.css({
						width : 0,
						height : 0,
						background:"blue",
						opacity:0.2,
						position : "absolute",
						left : disX,
						top : disY,
						border : "1px dashed #dedede"
					});
					$("body").append(newCase); //body添加新建元素
					
					$(document).on("mousemove",moveFn);
					$(document).on("mouseup",upFn);
					
					//鼠标移动
					function moveFn(ev){
						var dx = ev.clientX;
						var dy = ev.clientY;
						
						if(Math.abs(dx-disX) <= 10) return false;//如果移动的距离小于10,代表不托选
						dx = dx <= minleft ? minleft : dx;
						dy = dy <= mintop ? mintop : dy;

						//计算鼠标移动的距离，就是新建元素的高或宽
						var newDisX = Math.abs(dx - disX); 
						var newDisY = Math.abs(dy -disY);

						//默认：鼠标按下的坐标为新建元素的坐标
						var left = disX; 
						var top = disY;
						if(ev.clientX > disX && ev.clientY > disY){ //向右下角拉动，left,top为默认的鼠标按下时坐标
							left = disX;
							top = disY;
						}else if(ev.clientX < disX && ev.clientY < disY){//向左上角拉动，left,top修改为新的鼠标移动时坐标
							left = ev.clientX;
							top = ev.clientY;
						}else if(ev.clientY < disY){ //向右上角拉动 ,left为鼠标按下的坐标，top为鼠标移动的坐标
								left = disX;
								top = ev.clientY;
						}else if(ev.clientX < disX){ //向左下角拉动，left为鼠标移动的x轴坐标，top为鼠标按下的坐标
							left = ev.clientX;
							top = disY;
						}
						
						left = left <= minleft ? minleft : left;
						top = top <= mintop ? mintop : top;
						
						//更新拖拽框的位置的位置
						newCase.css({
							width : parseInt(newDisX),
							height : parseInt(newDisY),
							left : left,
							top : top
						});
						
						var niewMode = $("#changeView").data("view");
						if(niewMode == "lists"){
							var filesBox = $("#filesLists").find(".files");
							//碰撞拖拽是碰撞回调
							dataControl.pzCallbackFn(newCase,{
								boxDom : filesBox,
								pzCallbacll :function(){
									var id = $(this).data("file-id");
									addClass(id);
								},
								nopzCallbacll :function(){
									var id = $(this).data("file-id");
									removeClass(id);
								}
							});
						}else{
							var filesBox = $("#filesView").find(".files");
							//碰撞拖拽是碰撞回调
							dataControl.pzCallbackFn(newCase,{
								boxDom : filesBox,
								pzCallbacll :function(){
									var id = $(this).data("file-id");
									addClass(id);
								},
								nopzCallbacll :function(){
									var id = $(this).data("file-id");
									removeClass(id);
								}
							});
						}
					}
					
					function addClass(id){
						$("#filesLists").find(".files[data-file-id='"+id+"']").addClass("active");
						$("#filesView").find(".files[data-file-id='"+id+"']").addClass("active");
						_this.selectCheckAllBtn();
					}
					
					function removeClass(id){
						$("#filesLists").find(".files[data-file-id='"+id+"']").removeClass("active");
						$("#filesView").find(".files[data-file-id='"+id+"']").removeClass("active");
						_this.selectCheckAllBtn();
					}
					
					//鼠标抬起
					function upFn(){
						$(document).off("mousemove");
						$(document).off("mouseup");
						newCase.remove(); //移除新建选框
					}
				
				});
			},
			
			//选中全选按钮
			selectCheckAllBtn : function(){
				
				var sel = $("#filesView").find(".active").length = $("#filesLists").find(".active").length;
				var folder = $("#filesView").find(".files").length = $("#filesLists").find(".files").length;
				
				$("#selectAllFiles").removeClass("sel"); //切换时取消全选按钮
				
				//当选中的  与  总共的文件 一样时，表示选中全部
				(sel === folder && sel)  ? $("#selectAllFiles").addClass("sel") : $("#selectAllFiles").removeClass("sel");
				
			},
			
			//渲染树形菜单
			drawTreeMenu : function(data,currid){ 
				var treeMenu = $("#treeMenu");
				var TreeMenuHtml = template.treeMenuTemplate(data,currid);
				treeMenu.html(TreeMenuHtml);
				this.selctCurrTreeMenu(treeMenu,0); //默认选中第一个
				this.drawBreadNav(datas,0);
			},
			
			//渲染面包屑导航
			drawBreadNav : function(data,currid){
				//获取currid的父元素
				var parents = dataControl.getParents(data,currid).reverse();
				template.breadNavTemp(parents);//初始化面包屑导航
				this.drawFiles(datas,currid);//根据导航 渲染子菜单文件
			},
			
			//渲染子菜单文件文件夹
			drawFiles : function(data,currid){
				
				// 获取当前 currid 下面是否有子元素
				var hasChilds = dataControl.hasChilds(data,currid);//是否有子元素
				
				if(hasChilds){ //有子元素
					
					//获取 当前 currid 下的所有子元素
					var childs = dataControl.getChildById(data,currid);
					
					$("#noFileTips").removeClass("noFileTipsShow"); //隐藏无内容提示
					$("#view-of-icon").show(); //显示文件显示
					var html = "";
					var listsHtml = "";
					childs.forEach(function(item){
						html +=  template.folderView(item);
						listsHtml += template.forlderLists(item);
					});
					$("#filesView").html(html);
					$("#filesLists").html(listsHtml);
					
				}else{ //无子元素
					
					$("#view-of-icon").hide();
					$("#noFileTips").addClass("noFileTipsShow");
					$("#view-of-icon").find(".details").html("");//无子文件,移除所有内容
					
				}
				
			},
			
			//选中当前id的菜单
			selctCurrTreeMenu : function(obj,currid){
				currid = currid || 0;
				var ele = obj.find(".title[data-file-id='"+currid+"']");
				obj.find(".title").removeClass("active"); //取消其他选中状态
				ele.addClass("active");  //为当前的menu添加选中状态
			},
			
			//显示下拉菜单
			showDropDownMenu : function(obj,child1,child2,currName){
				$("#"+obj).mouseover(function(){
					$(this).find("."+child1).addClass(currName);
					$(this).find("."+child2).show();
				}).mouseout(function(){
					$(this).find("."+child1).removeClass(currName);
					$(this).find("."+child2).hide();
				});
			},
			
			//设置view的高度随浏览器的变化而变化
			setViewH : function(){
				var _this = this;
				var height = $("body").height() - 90;
				var width = $("body").width() - $(".left").outerWidth();
				$("#mainView").css("height",height);
				$("#panelArea").css("width",width);
			}
		}
		return tools.init(); //避免外界修改 里面的方法
	}
	window.main = main; //提供外界接口
})();