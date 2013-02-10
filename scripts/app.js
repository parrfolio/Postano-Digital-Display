// GLOBAL =======================================================================
var largeUrl = 'proxy.php';
var data = {};
var largeInterval = 0;
var smallInterval = 0;
var largeTimer = 0;
var smallTimer = 0;
var refreshperiod = 300000; //300000 = 5 mins
var result = '';
var i = 0;

// MODELS =======================================================================
var vizModel = Backbone.Model.extend({});

var vizCollection = Backbone.Collection.extend({
	model: vizModel,
	sync: function(method, model, options) {  
		options.timeout = 10000;  
		options.dataType = "json";  
		return Backbone.sync(method, model, options);  
	
	},
	url: function() {
		return largeUrl;
	}
});

var viz = new vizCollection();

// VIEWS =======================================================================
var LargeView = Backbone.View.extend({
	tagName: "section",
	id: "main",
	className: "large show",
	template: Handlebars.compile($('#large_tmpl').html()),
	initialize: function(options) { 
	    _.bindAll(this, 'beforeRender', 'render', 'afterRender'); 
	    var _this = this; 
	    this.render = _.wrap(this.render, function(render) { 
	      _this.beforeRender(); 
	      render(); 
	      _this.afterRender(); 
	      return _this; 
	    }); 
  	},
	beforeRender: function() { 
		$("#wrapper").wrap("<div id='container' class='container' />");
  	},
	render: function () {
		data = this.collection.toJSON();

		var haveData = (data[0].posts) ? data[0].posts.length : '';
		
		if(haveData != 0) {
			var count = data[0].posts.length;
			var GMTOffset = new Date().getTimezoneOffset() / 60;
			result = '';
			
		
				for (i = 0; i < 3; i++) {
					var finalObj = $.extend({}, data[0])
				}
				
				
		
			for (x = 0; x < count; x++) {
					
				var postdata = data[0].posts[x];

				
				
				postdata.index = x;

				postdata.formattedpubDate = Date.create(postdata.timestamp).addHours("-"+GMTOffset).relative(function(value, unit, ms, loc) {
				  if(ms.abs() > (1).day()) {
				    return '{12hr}:{mm}{tt} - {Weekday} {d} {Month}, {yyyy}';
				  }
				});
					
	              	result += this.template(postdata);
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
		return this;
	},
	afterRender: function() {
			//hide/show elements
			setTimeout(function(){
				$("#wrapper").addClass("show");
				$("#started").removeClass("appstarted");
				$("nav").addClass("hide");
			},3000); //3000
			
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
						
						
						item.parents("#wrapper").removeClass("topright");
						item.parents("#wrapper").removeClass("topleft");
						item.parents("#wrapper").removeClass("bottomright");
						item.parents("#wrapper").removeClass("bottomleft");
						item.parents("#wrapper").removeClass("zoom");
						
						$(".post").removeClass("alt");

						// top left
						if(left < w && top < h) {
							var top = Math.round(h - top);
							var left = Math.round(w - left);

							canvas.css({
								"-webkit-transform": "translate3d("+left+"px,"+top+"px,0)"
							});
							
							item.parents("#wrapper").addClass("topleft");
							console.log("top left")
						}

						//top right
						if(left > w && top < h) {
							var top = Math.round(h - top);
							var left = Math.round(left - w);
							canvas.css({
								"-webkit-transform": "translate3d(-"+left+"px,"+top+"px,0)"
							});
							item.parents("#wrapper").addClass("topright");
							console.log("top right")
						}

						//bottom right
						if(left > w && top > h) {
							var top = Math.round(top - h);
							var left = Math.round(left - w);
							canvas.css({
								"-webkit-transform": "translate3d(-"+left+"px,-"+top+"px,0)"
							});
							
							item.parents("#wrapper").addClass("bottomright");
							console.log("bottom right")
						}

						//bottom left
						if(left < w && top > h) {
							var top = Math.round(top - h);
							var left = Math.round(w - left);
							canvas.css({
								"-webkit-transform": "translate3d("+left+"px,-"+top+"px,0)"
							});
							
							item.parents("#wrapper").addClass("bottomleft");
							console.log("bottom left")
						}
					
						
						var camera = $("#wrapper")[0];
						camera.addEventListener("webkitTransitionEnd", move, false);

						function move() {
							camera.removeEventListener("webkitTransitionEnd", move, false);
									
								
								item.parents("#wrapper").removeClass("topright");
								item.parents("#wrapper").removeClass("topleft");
								item.parents("#wrapper").removeClass("bottomright");
								item.parents("#wrapper").removeClass("bottomleft");
								
								item.parents("#wrapper").addClass("zoom");
								//item.addClass("alt");
							
							setTimeout(function(){
								$(".button").trigger("click");
							}, 6000);
						}
					}
					
					$(".button").on("click", function(){
						randomHighlight();
					});

					$(".button").trigger("click");
				}
			});
	}
});


var smallView = Backbone.View.extend({
	tagName: "section",
	id: "main",
	className: "small show",
	template: Handlebars.compile($('#small_tmpl').html()),
	render: function () {
		data = this.collection.toJSON();
		
		var haveData = (data[0].posts) ? data[0].posts.length : '';
		
		if(haveData != 0) {
			var count = data[0].posts.length;
			var GMTOffset = new Date().getTimezoneOffset() / 60;
			result = '';

 			for (x = 0; x < count; x++) {
		
				var postdata = 	data[0].posts[x];

				postdata.formattedpubDate = Date.create(postdata.timestamp).addHours("-"+GMTOffset).relative(function(value, unit, ms, loc) {
				  if(ms.abs() > (1).day()) {
				    return '{12hr}:{mm}{tt} - {Weekday} {d} {Month}, {yyyy}';
				  }
				});
		
	              	result += this.template(postdata);
	        }
	
			this.$el.append(result);
			this.loadPlugins();
		} else {
			$("#started").removeClass("appstarted");
			$("#error").addClass("errorthrown");
		}
		return this;
	},
	loadPlugins: function() {
		//hide/show elements
		setTimeout(function(){
			$("#wrapper").addClass("show");
			$("#started").removeClass("appstarted");
			$("nav").addClass("hide");
		},3000);
		$(this.el).css({"-webkit-transform": "translate3d(0,0,0)"});
		
		function setSlideOpacity(n, o) {
			$('.post').removeClass("on");
			$(".post:nth-child("+n+")").addClass("on");
		}

		for (x = 0; x > 1; x--) {
			setSlideOpacity(x, 0);
		}

		smallTimer = setInterval(function() {
			setSlideOpacity(x, 0);
			x = (x === i)? 1 : x + 1;
			setSlideOpacity(x, 1);
		}, 6000);	

	}
});

// ROUTER =====================================================================
var App = Backbone.Router.extend({
    routes: {
		'large': 'large',
		'small': 'small'
    },
    large: function ()
    {
		$("#started").addClass("appstarted");
		$("#wrapper").removeClass("show");
		$("nav").removeClass("hide");
		
		
        viz.fetch({
            success: function (model, response)
            {
					clearInterval(smallTimer);
					var view = new LargeView({ collection: viz });
	                $("#wrapper").html(view.render().el);
				

				largeInterval = setInterval(function(){
					$("#error").removeClass("errorthrown");
					clearInterval(largeTimer);
					
					$("#wrapper").removeClass("show");
					$("#main").css({"-webkit-transform": "translate3d(0,0,0)"});
					
					var view = new LargeView({ collection: viz });
	                $("#wrapper").html(view.render().el);
	
				}, refreshperiod);
				
                
            }
        });
    },
	small: function ()
    {
		$("#started").addClass("appstarted");
		$("#wrapper").removeClass("show");
		$("nav").removeClass("hide");
		
       	viz.fetch({
            success: function (model, response)
            {
				clearInterval(largeTimer);
                var view = new smallView({ collection: viz });
                $("#wrapper").html(view.render().el);

				smallInterval = setInterval(function(){
					$("#error").removeClass("errorthrown");
					clearInterval(smallTimer);
					
					$("#wrapper").removeClass("show");
					

					var view = new smallView({ collection: viz });
	                $("#wrapper").html(view.render().el);
	
				}, refreshperiod);
				
            }
        });
    }
});


// APP =====================================================================

$(function () {
    window.app = new App();
	Backbone.history.start();

   	/* no hash but no refreshing urls
	Backbone.history.start({pushState: true});
	$(document).on("click", "a[href^='/']", function(event) {
	  if (!event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
	    event.preventDefault();
	    var url = $(event.currentTarget).attr("href").replace(/^\//, "");
	    app.navigate(url, { trigger: true });
	  }
	});*/
});