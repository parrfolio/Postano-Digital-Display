define([
	'underscore',
	'backbone',
	'plugin/text!templates/home.tmpl'
], function(_, Backbone, homeTemplate) {
	return Backbone.View.extend({
		tagName: "section",
		id: "home",
		className: "show",
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
		// Register events for clicking on the buttons
		events: {
			'click a': 'goto'
		},

		/*
		 * Prevent the default action and go to the page using Backbone.history
		 */
		goto: function(e) {
			e.preventDefault();

			var target = $(e.target).attr('href');
			if (target) {
				Backbone.history.navigate(target, true);
			}
		},
		
		beforeRender: function() {
			
		},

		render: function() {
			//intialize template
			var template = _.template(homeTemplate, {});
			$(this.el).html(template);

			return this;
		},
		
		afterRender: function() {
			
		}
	});
});
