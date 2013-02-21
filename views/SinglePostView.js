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
	  	},
		render: function () {
			data = appData.toJSON();
			
				var count = data[0].posts.length;
				result = '';

				for (x = 0; x < count; x++) {
					

					var postdata = data[0].posts[x];
					
					result += _.template(SinglePostTemplate, postdata);
						
		        }	
			
				this.$el.prepend(result);

		},
		afterRender: function() {
			
			}
	});
	 return SinglePostView;
});