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
	render: function () {
		data = this.collection.toJSON();
		
		
		
		var haveData = (data[0].posts) ? data[0].posts.length : '';
		
		if(haveData != 0) {
			var count = data[0].posts.length;
			var GMTOffset = new Date().getTimezoneOffset() / 60;
			result = '';
			
			for (x = 0; x < count; x++) {
		
				var postdata = 	data[0].posts[x];
				console.log(postdata)

				postdata.formattedpubDate = Date.create(postdata.timestamp).addHours("-"+GMTOffset).relative(function(value, unit, ms, loc) {
				  if(ms.abs() > (1).day()) {
				    return '{12hr}:{mm}{tt} - {Weekday} {d} {Month}, {yyyy}';
				  }
				});
		
	              	result += this.template(postdata);
	        }
	
			this.$el.prepend(result);
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
			
			//freetile plugin
			$(this.el).freetile({
				animate: true,
				containerResize: 0,
				elementDelay: 0,
				callback: function() {
					$(this.el).addClass("show");
					
					var randomHighlight = function(){
						var number = data[0].posts.length;
						var randomnumber = Math.ceil(Math.random()*number);
						var item = $(".post:nth-child("+randomnumber+")");
						var position = item.position();
						var offsetW = Math.floor(item.width() / 1.5);
						var offsetH = Math.floor(item.height() / 2.5);
						var w = Math.round(($(window).width() / 2) - offsetW);
						var h = Math.round(($(window).height() / 2) - offsetH);
						var canvas = $("#main");

						// top left
						if(position.left < w && position.top < h) {
							var top = Math.round(h - position.top);
							var left = Math.round(w - position.left);

							canvas.css({
								"-webkit-transform": "translate3d("+left+"px,"+top+"px,0)"
							});
						}

						//top right
						if(position.left > w && position.top < h) {
							var top = Math.round(h - position.top);
							var left = Math.round(position.left - w);
							canvas.css({
								"-webkit-transform": "translate3d(-"+left+"px,"+top+"px,0)"
							});
						}

						//bottom right
						if(position.left > w && position.top > h) {
							var top = Math.round(position.top - h);
							var left = Math.round(position.left - w);
							canvas.css({
								"-webkit-transform": "translate3d(-"+left+"px,-"+top+"px,0)"
							});
						}

						//bottom left
						if(position.left < w && position.top > h) {
							var top = Math.round(position.top - h);
							var left = Math.round(w - position.left);
							canvas.css({
								"-webkit-transform": "translate3d("+left+"px,-"+top+"px,0)"
							});
						}

							var el = canvas[0];
							el.addEventListener("webkitTransitionEnd", updateTransition, true);



							function updateTransition() {
								$(".post").removeClass("alt");
								item.addClass("alt");	
							}

					}

					largeTimer = setInterval(randomHighlight, 6000);

					/*$(".button").on("click", function(){
						randomHighlight();
					});*/
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