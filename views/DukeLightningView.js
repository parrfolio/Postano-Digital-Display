define([
	'underscore',
	'backbone',
	'collections/appCollection',
	'plugin/text!templates/DukeLightning.tmpl'
], function(_, Backbone, appCollection, DukeLightningTemplate) {
	var DukeLightningView = Backbone.View.extend({
		tagName: "section",
		id: "main",
		className: "dukelightning show",
		initialize: function(options) { 
			_.bindAll(this, 'beforeRender', 'render', 'afterRender'); 
		    var _this = this;
		    this.render = _.wrap(this.render, function(render) {
			appData.fetch({
	            success: function (model, response)
	            {	
			 	   _this.beforeRender(); 
					render(); 
					_this.afterRender();
	            }
	        });
				
			return _this; 
			}); 
	  	},
		beforeRender: function() {
			$("html,body").attr("style", "");
			$(this.el).wrap("<div id='outerWrapper' class='dukeOuterWrapper' />");
			$(this.el).wrap("<div id='wrapper' class='dukeWrapper' />");
	  	},
		render: function () {
			data = appData.toJSON();
			
			var haveData = (data[0].posts) ? data[0].posts.length : '';

			if(haveData != 0) {
				var count = data[0].posts.length;
				var GMTOffset = new Date().getTimezoneOffset() / 60;
				result = '';

				for (x = 0; x < count; x++) {
					

					var postdata = data[0].posts[x];
										
					postdata.index = x;

					

					postdata.formattedpubDate = Date.create(postdata.timestamp).addHours("-"+GMTOffset).relative(function(value, unit, ms, loc) {
					  if(ms.abs() > (1).day()) {
					    return '{12hr}:{mm}{tt} - {Weekday} {d} {Month}, {yyyy}';
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



			} else {
				$("#started").removeClass("appstarted");
				$("#error").addClass("errorthrown");
			}
		},
		afterRender: function() {
				//freetile plugin
				$(this.el).find("#middle").freetile({
					animate: true,
					containerResize: 0,
					elementDelay: 0,
					callback: function() {					
						//position the edge containers for infinite effect
						var mw = this.containerWidth;
						var mh = $("#middle").height();

						$("#left").css({
							"-webkit-transform": "translate3d(-"+(mw+30)+"px,0,0)",
							width: mw,
							height: mh
							});

						$("#right").css({
							"-webkit-transform": "translate3d("+(mw - 60)+"px,0,0)",
							width: mw,
							height: mh
							});


						var randomHighlight = function(){
							var number = data[0].posts.length;
							var min = 1 //number;
							var max = number * 3;
							var randomnumber = Math.floor(Math.random() * (max - min + 1)) + min;
							var item = $("#middle").find(".post:nth-child("+randomnumber+")");
							var left =  parseInt(item.css("left"), 10);
							var top =  parseInt(item.css("top"), 10);
							var offsetW = Math.floor(item.width() / 1.5);
							var offsetH = Math.floor(item.height() / 1.5);
							var w = Math.round(($(window).width() / 2) - offsetW);
							var h = Math.round(($(window).height() / 2) - offsetH);
							var canvas = $("#main");

							item.parents("#wrapper").removeClass("zoom");
							item.parents("#wrapper").removeClass("topright");
							item.parents("#wrapper").removeClass("topleft");
							item.parents("#wrapper").removeClass("bottomright");
							item.parents("#wrapper").removeClass("bottomleft");


							//$(".post").removeClass("focus");

							// top left
							if(left < w && top < h) {
								var top = Math.round(h - top);
								var left = Math.round(w - left);

								canvas.css({
									"-webkit-transform": "translate3d("+left+"px,"+top+"px,0)"
								});

								item.parents("#wrapper").addClass("topleft");
								//console.log("top left")
							}

							//top right
							if(left > w && top < h) {
								var top = Math.round(h - top);
								var left = Math.round(left - w);
								canvas.css({
									"-webkit-transform": "translate3d(-"+left+"px,"+top+"px,0)"
								});
								item.parents("#wrapper").addClass("topright");
								//console.log("top right")
							}

							//bottom right
							if(left > w && top > h) {
								var top = Math.round(top - h);
								var left = Math.round(left - w);
								canvas.css({
									"-webkit-transform": "translate3d(-"+left+"px,-"+top+"px,0)"
								});

								item.parents("#wrapper").addClass("bottomright");
								//console.log("bottom right")
							}

							//bottom left
							if(left < w && top > h) {
								var top = Math.round(top - h);
								var left = Math.round(w - left);
								canvas.css({
									"-webkit-transform": "translate3d("+left+"px,-"+top+"px,0)"
								});

								item.parents("#wrapper").addClass("bottomleft");
								//console.log("bottom left")
							}


							var camera = $("#wrapper")[0];
							
							if(camera) {
								camera.addEventListener("webkitTransitionEnd", move, false);	
							}
							
							var start = Date.now();  
							var timer = 6000;

							function move(e) {
								camera.removeEventListener("webkitTransitionEnd", move, false);
								item.parents("#wrapper").removeClass("topright");
								item.parents("#wrapper").removeClass("topleft");
								item.parents("#wrapper").removeClass("bottomright");
								item.parents("#wrapper").removeClass("bottomleft");

								var progress = e.timeStamp - start;							

								if (progress < timer) {
									item.parents("#wrapper").addClass("zoom");
									setTimeout(function(){
										requestAnimationFrame(randomHighlight);
									},timer);
								}
							}
						}

						window.requestAnimationFrame(randomHighlight);
					}
				});
			}
	});
	 return DukeLightningView;
});