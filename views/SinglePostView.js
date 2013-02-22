define([
	'underscore',
	'backbone',
	'collections/appCollection',
	'plugin/text!templates/SinglePost.tmpl'
], function(_, Backbone, appCollection, SinglePostTemplate) {
	var SinglePostView = Backbone.View.extend({
		tagName: "section",
		id: "singlePost",
		className: "singlePost",
		initialize: function(options) { 
			_.bindAll(this, 'errorRender', 'beforeRender', 'render', 'afterRender'); 
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
		errorRender: function() {
			var _this = this;
			alert("Opps, something is not right. Please refresh your browser.")
		},
		beforeRender: function() {
			$("html,body").attr("style", "");
			$(this.el).wrap("<div id='outerWrapper' class='singlePostOuterWrapper' />");
	  	},
		render: function () {
			
			data = appData.toJSON();
			
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

		              	result += _.template(SinglePostTemplate, postdata);
		        }

				this.$el.append(result);
			} else {
				$("#started").removeClass("appstarted");
				$("#error").addClass("errorthrown");
			}

		},
		afterRender: function() {
			
			p = $('.post:first-child');
	
			var highlight = function() {
			    p = window.p;
			    $('.post').removeClass("on");
		
				p.addClass("on");
			
				$(p)[0].addEventListener("webkitTransitionEnd", move, false);	
			    p = p.next().length ? p.next() : $('.post:first-child');
		
		
				var start = Date.now();  
				var timer = 6000;

				function move(e) {
				
					$(p)[0].removeEventListener("webkitTransitionEnd", move, false);
				
					var progress = e.timeStamp - start;							

					if (progress < timer) {					
						setTimeout(function(){
							requestAnimationFrame(highlight);
						},timer);
					}
				}
			}
			
			window.requestAnimationFrame(highlight);
		}
	});
	 return SinglePostView;
});