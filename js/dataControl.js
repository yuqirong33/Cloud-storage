/*!
 * 依赖文件：jquery-1.11.1
 * 创建人：yuqirong
 * 创建时间：create 2018-02-02
 * 创建版本: v1.0
 * 页面主要: 数据操作
*/
(function(){
	
	var dataControl = {
		
		//获取这个id下面的所有子数据
		getChildById : function(data,pid){
			var newArr = [];
			for(var i=0;i<data.length;i++){
				if(data[i].pid == pid){
					newArr.push(data[i]);
				}
			}
			return newArr;
		},
		
		//获取当前id的所有父元素
		getParents : function (data,currentId){
			var arr = [];
			for( var i = 0; i < data.length; i++ ){
				if( data[i].id == currentId ){
					arr.push(data[i]);
					arr = arr.concat(dataControl.getParents(data,data[i].pid))
					break;
				}
			}
			return arr;
		},
		
		//获取当前的id在第几层
		getLevelById:function (data,id){
			return this.getParents(data,id).length;
		},
		
		//当前id是否有子元素
		hasChilds:function (data,id){
			return this.getChildById(data,id).length !== 0;
		},
		
		//删除数据，传入要删除的数据：数组形式
		delDataByArr : function(data,newArr,id){
			
			for(var i=0;i<data.length;i++){
				for(var j=0;j<newArr.length;j++){
					if(data[i].title){
						if(data[i].title === newArr[j].title && data[i].id === newArr[j].id && data[i].pid === newArr[j].pid){
							data.splice(i,1); //删除子元素，
						}
					}else{
						throw new Error("网络异常，删除文件过程中出现错误！")
					}
				}
			}
			
			for(var i=0;i<data.length;i++){
				if(data[i].id == id){
					data.splice(i,1); //删除自己
				}
			}
			
		},
		
		//名字是否存在
		isNameExsit:function (data,id,names,currentId){
			var childs = dataControl.getChildById(data,id); //所有子元素
			for( var i = 0; i < childs.length; i++ ){
				if( childs[i].title === names && childs[i].id != currentId ){
					return true;
					break;
				}
			}
			return false;
		},
		
		//修改某个id的名字
		changeNameById:function (data,id,names){
			for( var i = 0; i < data.length; i++ ){
				if( data[i].id == id ){
					data[i].title = names;
					return true;
				}
			}
			return false;	
		},
		
		//判断要移动到的目标位子 是不是要移动文件的子文件
		isChildsOfCurrent : function(parentArr,currentId){
			for(var i=0;i<parentArr.length;i++){
				if(parentArr[i].id == currentId){
					return true; //当前目标位置是原目标的子级
				}
			}
			return false;
		},
			
		//碰撞检测：rerGion
		rerGion :  function(obj1,obj2){
			var top1 = obj1.offset().top;
			var right1 = obj1.offset().left+obj1.width();
			var bottom1 = obj1.offset().top + obj1.height();
			var left1 = obj1.offset().left; 
			var top2 = obj2.offset().top;
			var right2 = obj2.offset().left+obj2.width();
			var bottom2 = obj2.offset().top + obj2.height();
			var left2 = obj2.offset().left;
			//没有碰撞的情况
			if(left1 > right2 || bottom1 < top2 ||  right1 < left2 || top1 > bottom2){	
				return false;
			}else{
				return true;
			}
		},
		
		//碰撞回调
		pzCallbackFn:function(obj,jsons){
			//boxDom : boxDom,//要碰撞的元素
			var boxDom = jsons.boxDom;
			
			for(var i=0;i<boxDom.length;i++){
				if(dataControl.rerGion(obj,boxDom.eq(i)) && obj!== boxDom.eq(i) ){
					//撞到时回调函数
					jsons.pzCallbacll && typeof jsons.pzCallbacll === "function" && jsons.pzCallbacll.call(boxDom.eq(i));
				}else{
					//未撞到时回调函数
					jsons.nopzCallbacll && typeof jsons.nopzCallbacll === "function" && jsons.nopzCallbacll.call(boxDom.eq(i));
				}
			}
		},
		
		getDates : function(){
			var _this = this;
			var time = new Date();
			var year = time.getFullYear();
			var mouth = time.getMonth()+1;
			var day = time.getDate();
			return _this.dataFromat(year) + '-' + _this.dataFromat(mouth) + '-' + _this.dataFromat(day);
		},
		
		getTimers : function(){
			var _this = this;
			var time = new Date();
			var hour = time.getHours();
			var miu = time.getMinutes();
			var sen = time.getSeconds();
			return _this.dataFromat(hour) + ':' + _this.dataFromat(miu) + ':' + _this.dataFromat(sen);
		},
		
		dataFromat : function(n){
			return n>=10 ? n : "0"+n;
		},
		
		//排序
		sorts : function (arr,way,falg){
			if(falg){//从高到低
				arr.sort(function(a,b){
					return a[way] - b[way];
				});
			}else{//从低到高
				arr.sort(function(a,b){
					return b[way] - a[way];
				});
			}
		}
		
	}
	
	window.dataControl = dataControl;  //导出
	
})();
