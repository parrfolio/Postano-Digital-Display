define([
	'underscore',
	'backbone',
	'collections/appCollection',
	'plugin/text!templates/QuantumAvenger.tmpl'
], function(_, Backbone, appCollection, QuantumAvengerTemplate) {
	var QuantumAvengerView = Backbone.View.extend({
		tagName: "section",
		id: "impress",
		className: "show quantumAvenger",
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
	  	},
		render: function () {
			data = appData.toJSON();

			var haveData = (data[0].posts) ? data[0].posts.length : '';

			if(haveData != 0) {
				var count = data[0].posts.length;
				var GMTOffset = new Date().getTimezoneOffset() / 60;
				result = '';

				for (x = 0; x < count; x++) {


					var postdata = data[0].posts[x];

					postdata.index = x;



					postdata.formattedpubDate = Date.create(postdata.timestamp).addHours("-"+GMTOffset).relative(function(value, unit, ms, loc) {
					  if(ms.abs() > (1).day()) {
					    return '{12hr}:{mm}{tt} - {Weekday} {d} {Month}, {yyyy}';
					  }
					});


						result += _.template(QuantumAvengerTemplate, postdata);

		        }	


				this.$el.prepend(result).prepend(result)


			} else {
				$("#started").removeClass("appstarted");
				$("#error").addClass("errorthrown");
			}

		},
		afterRender: function() {
				// initialize classes and visibility
				$("#started").removeClass("appstarted");


				setTimeout(function(){ //main set timeout fails without this

					// adds rotation classes and converts heights to widths for select posts
					for( n=2; n<=50; n+=6)
					{
						postloop = $("#impress .step").eq(n - 1);
						postloop.addClass("rotated90");
						var myHeight = postloop.height();
						var myWidth = postloop.width();
						postloop.addClass("rotated");
						postloop.css("width" , myHeight + "px");
						postloop.css("height" , myWidth + "px");
					}

					for( n=4; n<=46; n+=6)
					{
						postloop = $("#impress .step").eq(n - 1);
						postloop.addClass("rotatedNeg90");
						var myHeight = postloop.height();
						var myWidth = postloop.width();
						postloop.addClass("rotated");
						postloop.css("width" , myHeight + "px");
						postloop.css("height" , myWidth + "px");					
					}

					for( n=6; n<=48; n+=6)
					{
						postloop = $("#impress .step").eq(n - 1);
						postloop.addClass("rotated180");
						postloop.addClass("rotated");
					}


					//freetile plugin
					$("#impress").freetile({
						animate: true,
						containerResize: 0,
						elementDelay: 0,
						callback: function() {

						//get center item needs the timeout so that I can get #impress').height()
						setTimeout(function(){
							var impressCenterX = Math.floor($('#impress').width() / 2 ); //retrieve current window width
							var impressCenterY = Math.floor($('#impress').height() / 2); //retrieve current window height

							$("#impress .step").each(function(index){

								var marginOffset =150

								var postWidth = $("#impress .step").width();
								var postHeight = $("#impress .step").height();

								leftOffset = parseInt($(this).css("left"), 10);
								rightOffset = leftOffset + postWidth;
								topOffset = parseInt($(this).css("top"), 10);
								bottomOffset = topOffset + postHeight;

								var left =  leftOffset < impressCenterX + marginOffset;
								var right = rightOffset + marginOffset > impressCenterX;
								var top = topOffset < impressCenterY + marginOffset;
								var bottom = bottomOffset + marginOffset > impressCenterY;

								if (left && right && top && bottom){
									$(this).addClass("myFirst");
									//console.log("Center Found")
								}
							});//end each

						},100); //find center

						// in timeout to ensure that this fores after the centering
						//impress layout
						setTimeout(function(){

							$("#impress .step").each(function(index){

								//convert top,left into x,y
								var item = $(this);
								var left =  parseInt(item.css("left"), 10);
								var top =  parseInt(item.css("top"), 10);
								var halfHeight = $(this).height() / 2;
								var halfWidth = $(this).width() / 2;
								$(this).attr("data-y", top + halfHeight)
								$(this).attr("data-x", left + halfWidth);
								var myHeightOffset = Math.floor(($(this).height() - $(this).width()) /2);
								var myWidthOffset = Math.floor(($(this).height() - $(this).width()) / 2);

								// add data-rotate based on class identifier

								//180
								if ($(this).hasClass("rotated180"))
								{
									$(this).attr("data-rotate", "180");
								}

								//90
								if ($(this).hasClass("rotated90"))
								{	

									$(this).attr("data-rotate", "90");
									$(this).attr("data-y", top + halfHeight - myHeightOffset);
									$(this).attr("data-x", left + halfWidth + myHeightOffset);
								}
								//90
								if ($(this).hasClass("rotatedNeg90"))
								{	
									$(this).attr("data-rotate", "-90");
									$(this).attr("data-y", top + halfHeight - myHeightOffset);
									$(this).attr("data-x", left + halfWidth + myHeightOffset);
								}

								// clears inline styles
								$("#impress .step").css("width", "")
								$("#impress .step").css("height", "")

								// reset the left and top values back to 0
								$(this).css("left", "0px");
								$(this).css("top", "0px");

							}); //main each function

							//impress wrapper setup
							$('#impress').wrap('<div id="impressOuterWrapper" class="impressOuterWrapper"/>');
							$('#impress').wrap('<div id="impressWrapper" class="impressWrapper startHidden"/>');
							$("#wrapper").addClass("show");
							$('#impress').addClass("zoomIn");


							// // impress init
							setTimeout(function(){
								$('#impress').jmpress({
									hash: {use: false
									},
									animation: {
								        transitionDuration: '2s', // Length of animation
								    }
								});				


								//find first step
								startingStep = "#" + $("#impress").find(".myFirst").attr("id");
								$('#impress').jmpress('goTo', startingStep);

								setTimeout(function(){
									$('#impressWrapper').removeClass("startHidden");
								},3000);	

							},0);//impress init

						},200);//impress layout



							var threeDzoomNext = function(){	

								//random
								randomNext = "#step-" + Math.ceil(Math.random() * x);
								$('#impress').jmpress('goTo', randomNext);

					            $('#impress').removeClass("zoomIn");

								setTimeout(function(){

									var zoomOut = $('#impress').find(".active").hasClass("zoomOutSlide");

									if(zoomOut) {
					                	$('#impress').removeClass("zoomIn");
					                }
					                else{
						            	$('#impress').addClass("zoomIn");
						            }

					            },900);
							} //next

							var threeDzoomPrevious = function(){	
								$('#impress').jmpress( 'prev' );
					            $('#wrapper').removeClass("zoomIn");
					            $('#impressWrapper').removeClass("zoomStart");

								setTimeout(function(){

									var zoomOut = $('#impress').find(".active").hasClass("zoomOutSlide");

									if(zoomOut) {
					                	$('#impress').addClass("zoomOut");
					                }
					                else{
						            	$('#impress').addClass("zoomIn");
						            }

					            },900); 

							} //previous

							$('#nextButton').click(function() {
								threeDzoomNext();
							});

							$('#previousButton').click(function() {
								threeDzoomPrevious();
							});

						//next timer
						threeDzoomNextTimer = setInterval(threeDzoomNext, 10000);


						} //freetile callback

					}); //freetile

				},100); //main set timeout
			
			}
	});
	 return QuantumAvengerView;
});
