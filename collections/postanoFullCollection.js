define([
  'underscore',
  'backbone',
  'models/postanoFullModel'
], function(_, Backbone, postanoFullModel){
  var postanoFullCollection = Backbone.Collection.extend({
    model: postanoFullModel,
	sync: function(method, model, options) {  
		options.timeout = 10000;  
		options.dataType = "json";  
		return Backbone.sync(method, model, options);  

	},
	url: function() {
		return '../postano_full.php';
	}
  });
	appDataFull = new postanoFullCollection();

});