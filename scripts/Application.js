require.config({
	baseUrl: './',	
	shim: {
	    underscore: {
	      exports: '_'
	    },
	    backbone: {
	      deps: ['underscore', 'jquery'],
	      exports: 'Backbone'
	    },
		'freetile':['jquery'],
		'jmpress':['jquery']
	  },
	  paths: {
	    jquery: 'scripts/lib/jquery',
		'sugar': 'scripts/lib/sugar',
		'freetile': 'scripts/lib/jquery.freetile.min',
		'jmpress': 'scripts/lib/jmpress',
		underscore: 'scripts/lib/underscore',
		backbone: 'scripts/lib/backbone',
		'plugin/text':	'scripts/lib/requirejs-text'
	  }
});

require([
	'jquery',
	'sugar',
	'freetile',
	'jmpress',
	'backbone',
	'scripts/ApplicationRouter',
	'views/NavigationView'
], function($, Sugar, Freetile, Jmpress, Backbone, ApplicationRouter, NavigationView) {
	var router = new ApplicationRouter($('#container'));

	var navigationView = new NavigationView({
		el: $('nav')[0],
		router: router
	}).render();

   	Backbone.history.start();
});