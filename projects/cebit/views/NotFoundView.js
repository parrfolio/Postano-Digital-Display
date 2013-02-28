define([
	'underscore',
	'backbone',
	'plugin/text!templates/not-found.tmpl'
], function(_, Backbone, notFoundTemplate) {
	return Backbone.View.extend({
		tagName: "section",
		id: "notFound",
		className: "notFound show",
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
			
		},
		
		render: function() {
			var template = _.template(notFoundTemplate, {});
			$(this.el).html(template);

			return this;
		},
		
		afterRender: function() {
			
		}
	
	});
});
