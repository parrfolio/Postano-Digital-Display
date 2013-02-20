define([
  'underscore',
  'backbone',
  'models/appModel'
], function(_, Backbone, appModel){
  var appCollection = Backbone.Collection.extend({
    model: appModel,
	sync: function(method, model, options) {  
		options.timeout = 10000;  
		options.dataType = "json";  
		return Backbone.sync(method, model, options);  

	},
	url: function() {
		return '../proxy.php';
	}
  });

	appData = new appCollection();

});