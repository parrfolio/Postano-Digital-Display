define([
	'backbone',
	'views/HomeView',
	'views/DukeLightningView',
	'views/QuantumAvengerView',
	'views/SinglePostView',
	'views/NotFoundView'
], function(Backbone, HomeView, DukeLightningView, QuantumAvengerView, SinglePostView, NotFoundView) {
	return Backbone.Router.extend({
		initialize: function(el) {
			this.el = el;
			
			//default
			this.homeView = new HomeView();
			this.notFoundView = new NotFoundView();
			
			//custom
			this.DukeLightningView = new DukeLightningView();
			this.QuantumAvengerView = new QuantumAvengerView();
			this.SinglePostView = new SinglePostView();
			
		},

		routes: {
			"": "home",
			"DukeLightning": "DukeLightning",
			"QuantumAvenger": "QuantumAvenger",
			"SinglePost": "SinglePost",
			"*else": "notFound"
		},

		currentView: null,

		switchView: function(view) {
			if (this.currentView) {
				$(this.currentView.el).off().empty().detach().remove();
			}			

			// Move the view element into the DOM (replacing the old content)
			this.el.html(view.el);

			// Render view after it is in the DOM (styles are applied)
			view.render();

			this.currentView = view;
		},

		home: function() {
			this.switchView(this.homeView);
		},

		notFound: function() {
			this.switchView(this.notFoundView);
		},
		
		DukeLightning: function() {
			this.switchView(this.DukeLightningView);      
		},

		QuantumAvenger: function() {
			this.switchView(this.QuantumAvengerView);
		},
		
		SinglePost: function() {
			this.switchView(this.SinglePostView);
		}
	});
});