define([
	'underscore',
	'backbone',
	'collections/appCollection',
	'plugin/text!templates/DukeLightning.tmpl'
], function(_, Backbone, appCollection, DukeLightningTemplate) {
	var DukeLightningView = Backbone.View.extend({
		tagName: "section",
		id: "main",
		className: "dukelightning",
		initialize: function(options) { 
			_.bindAll(this, 'errorRender', 'beforeRender', 'render', 'highlight',  'afterRender', 'refreshView', 'presentView'); 
		    var _this = this;
		    this.render = _.wrap(this.render, function(render) {
			appData.fetch({
	            success: function (model, response)
	            {
					if(!response.error_message) {
				 	   _this.beforeRender(); 
						render();
					} else {
						_this.errorRender();
					}
	            }
	        });
				
			return _this; 
			}); 
	  	},
		errorRender: function() {
			var _this = this;
			alert("Opps, something is not right. Please refresh your browser.")
		},
		beforeRender: function() {
			$("html,body").attr("style", "");
			$(this.el).wrap("<div id='outerWrapper' class='dukeOuterWrapper' />");
			$(this.el).wrap("<div id='wrapper' data-camera='on' />");
			//$(this.el).parents("body").append("<div id='button' class='button'> next </div>");
	  	},
		render: function () {
			var _this = this;
			
			data = appData.toJSON();
			var haveData = (data[0].posts) ? data[0].posts.length : '';

			if(haveData != 0) {
				var count = data[0].posts.length;
				var GMTOffset = new Date().getTimezoneOffset() / 60;
				result = '';

				for (x = 0; x < count; x++) {
					

					var postdata = data[0].posts[x];
										
					postdata.index = x;
					
					/*function checkExists(imageUrl, callback) {
					    var img = new Image();
					
						img.id = 'the id';
						
					    img.onerror = function() {
					        callback(img, false);
					    };

					    img.onload = function() {
					        callback(img, true);
					    };

					    img.src = imageUrl;
					}
					
					checkExists(postdata.image, function(img, exists) {
					    if(!exists) {
							console.log(img.id)
					    }
					});*/
					
					var classes = ['alt_1', 'alt_2', 'alt_3', 'alt_4', 'alt_5', 'alt_5', 'alt_6', 'alt_7', 'alt_8', 'alt_9', 'alt_10'];

					postdata.box = classes[Math.floor(Math.random()*classes.length)];

					

					postdata.formattedpubDate = Date.create(postdata.timestamp).addHours("-"+GMTOffset).relative(function(value, unit, ms, loc) {
					  if(ms.abs() > (1).day()) {
					    return '{Weekday} at {12hr}:{mm}{tt}';
					  }
					});
						
					
		
						result += _.template(DukeLightningTemplate, postdata);
						
		        }

				this.$el.html('<div id="left" class="board edge left" />'+
				'<div id="middle" class="board middle" />'+
				'<div id="right" class="board edge right" />');

				this.$el.find("#left").prepend(result).prepend(result).prepend(result).prepend(result).prepend(result);
				this.$el.find("#middle").prepend(result).prepend(result).prepend(result);			
				this.$el.find("#right").prepend(result).prepend(result).prepend(result).prepend(result).prepend(result);

				_this.afterRender();

			} else {
				alert("Opps, Something went wrong. Try refreshing your browser.");

			}
		},
		
		highlight: function() {
			var _this = this;
			var number = (data[0].posts) ? data[0].posts.length : '0';
			var min = number //number;
			var max = number * 2;
			var randomnumber = Math.floor(Math.random() * (max - min + 1)) + min;
			var item = $("#middle").find(".post:nth-child("+randomnumber+")");
			var left =  parseInt(item.css("left"), 10);
			var top =  parseInt(item.css("top"), 10);
			var offsetW = Math.floor(item.width() / 1.5);
			var offsetH = Math.floor(item.height() / 1.5);
			var w = Math.round(($(window).width() / 2) - offsetW);
			var h = Math.round(($(window).height() / 2) - offsetH);
			var canvas = $("#main");
			var camera = document.getElementById("wrapper");
			
			$(".post").removeClass("on");
			
			$(camera).removeClass();

			// top left
			if(left < w && top < h) {
				var top = Math.round(h - top);
				var left = Math.round(w - left);

				canvas.css({
					"-webkit-transform": "translate3d("+left+"px,"+top+"px,0)"
				});
			}

			//top right
			if(left > w && top < h) {
				var top = Math.round(h - top);
				var left = Math.round(left - w);
				canvas.css({
					"-webkit-transform": "translate3d(-"+left+"px,"+top+"px,0)"
				});
			}

			//bottom right
			if(left > w && top > h) {
				var top = Math.round(top - h);
				var left = Math.round(left - w);
				canvas.css({
					"-webkit-transform": "translate3d(-"+left+"px,-"+top+"px,0)"
				});
			}

			//bottom left
			if(left < w && top > h) {
				var top = Math.round(top - h);
				var left = Math.round(w - left);
				canvas.css({
					"-webkit-transform": "translate3d("+left+"px,-"+top+"px,0)"
				});
			}
			
			if(camera) {
				camera.addEventListener("webkitTransitionEnd", move, false);	
			}
			
			var timer = 6000;
			
			function move(e) {
				if(e.propertyName === "-webkit-transform") {
					
					camera.removeEventListener("webkitTransitionEnd", move, false);
					
					$(camera).removeClass().addClass("zoom");
					
					item.addClass("on");

					setTimeout(function(){
						window.requestAnimationFrame(_this.highlight);
					},timer);
				}
			}
		},
		
		afterRender: function() {
			var _this = this;
			$(this.el).find("#middle").freetile({
				animate: true,
				containerResize: 0,
				elementDelay: 0,
				callback: function() {
				
				//position the edge containers for infinite effect
				var elw = this.ElementWidth;
				var ml = this.currentPos.length - 1;
				var mw =  ml * elw;
				var mh = this.ElementHeight + this.ElementTop;
			
				$("#left").css({
					"-webkit-transform": "translate3d(-"+(mw+30)+"px,0,0)",
					width: mw,
					height: mh
					});

				$("#right").css({
					"-webkit-transform": "translate3d("+mw+"px,0,0)",
					width: mw,
					height: mh
					});
				
					_this.presentView();
				}
			});
		},
			
		refreshView: function() {
			var _this = this;
			var change = '02/28/2013 11:42';
			var today = new Date();
			var curr_hour = today.getHours();
			var curr_min = today.getMinutes();
			var time = curr_hour + ":" + curr_min;
			var dd = today.getDate();
			var mm = today.getMonth()+1; //January is 0!
			var yyyy = today.getFullYear();
			if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} today = mm+'/'+dd+'/'+yyyy;

			var dateTime = today + ' ' + time;

			if (dateTime == change) {
				
				
				//add domains here document.location.href = 'http://172.18.0.238:9036/#DukeLightning';
				
				//Backbone.history.navigate('DukeLightning', true);	
				
			} else {
				var newFragment = Backbone.history.getFragment($(this).attr('href'));
			    if (Backbone.history.fragment == newFragment) {
			        // need to null out Backbone.history.fragement because 
			        // navigate method will ignore when it is the same as newFragment
			        Backbone.history.fragment = null;
			        Backbone.history.navigate(newFragment, true);
			    }

			}
		},
		
		presentView: function() {
			var _this = this;
			
			//present view
			$("#outerWrapper").addClass("show");
			
			//start view
			setTimeout(function(){
				_this.highlight();
			}, 6000);
		
			//debug button
			/*$("#button").on('click', function(){
				_this.highlight();
			});*/
			
			//refresh view get new data
			setTimeout(_this.refreshView, 300000); //300000
		}
	});
	 return DukeLightningView;
});
