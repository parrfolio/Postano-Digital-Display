var container, stats;
var camera, scene, projector, renderer;
var arr_tweets=[];
var arr_activeTweets=[];
var arr_tweets_dom=[];
var speed=.2,
	targetMaxSpeed=8,
	targetMinSpeed=6,
	targetMaxDist=1, //global to determine max camera distance to target
	targetCurrentDist=1, //global to compare current camera distance to target for speed easing
	moving=true,
	targeted=false,
	targetPathSet=false,
	targetBall=4,
	flyingBall=1,
	cameraReturning=false,
	useController=true,
	outerViewDistance=90;

var targetColor="0xE23289",
	baseColor="0xE23289",
	filterColor="0x03ABDD";
	
var particleCount=0;
	
//====================================\\
// 13thParallel.org BeziŽr Curve Code \\
//   by Dan Pupius (www.pupius.net)   \\
//====================================\\

coord = function (x,y) {
  if(!x) var x=0;
  if(!y) var y=0;
  return {x: x, y: y};
}

function B1(t) { return t*t*t }
function B2(t) { return 3*t*t*(1-t) }
function B3(t) { return 3*t*(1-t)*(1-t) }
function B4(t) { return (1-t)*(1-t)*(1-t) }

function getBezier(percent,C1,C2,C3,C4) {
  var pos = new coord();
  pos.x = C1.x*B1(percent) + C2.x*B2(percent) + C3.x*B3(percent) + C4.x*B4(percent);
  pos.y = C1.y*B1(percent) + C2.y*B2(percent) + C3.y*B3(percent) + C4.y*B4(percent);
  return pos;
}

function getBezierSpeed(percent,C1,C2,C3,C4) {
  var pos = new coord();
  pos.x = C1.x*B1(percent) + C2.x*B2(percent) + C3.x*B3(percent) + C4.x*B4(percent);
  pos.y = C1.y*B1(percent) + C2.y*B2(percent) + C3.y*B3(percent) + C4.y*B4(percent);
  return pos.y;
}

//bezier points for a good speed easing
var bStart=coord(0,0);
var bEnd=coord(115,0);
var c1=coord(1.6,1);
var c2=coord(98.4,1.6);


var PI2 = Math.PI * 2;

var programFill = function ( context ) {

	context.beginPath();
	context.arc( 0, 0, 1, 0, PI2, true );
	context.closePath();
	context.fill();

}

var programStroke = function ( context ) {

	context.lineWidth = 0.05;
	context.beginPath();
	context.arc( 0, 0, 1, 0, PI2, true );
	context.closePath();
	context.stroke();
	

}

function toScreenXY( position, camera, jqdiv ) {
	//console.log("toxy");
    var pos = position.clone();
    projScreenMat = new THREE.Matrix4();
    projScreenMat.multiply( camera.projectionMatrix, camera.matrixWorldInverse );
    projScreenMat.multiplyVector3( pos );
    
	//console.log('returning');

    return { x: ( pos.x + 1 ) * jqdiv.width() / 2 + jqdiv.offset().left,
         y: ( - pos.y + 1) * jqdiv.height() / 2 + jqdiv.offset().top };

}

function showCurrentTweet(){
	$('#tweets').html(arr_tweets_dom[targetBall]).addClass("showTweet");
}

function hideCurrentTweet(){
	$('#tweets').removeClass("showTweet");
}


var mouse = { x: 0, y: 0 }, INTERSECTED;

init();
animate();

function init() {

	

	camera = new THREE.Camera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.y = 300;
	camera.position.z = 500;

	scene = new THREE.Scene();
	
	projector = new THREE.Projector();
	renderer = new THREE.CanvasRenderer();
	var wwidth  = $(window).width(),
		wheight = $(window).height();
	renderer.setSize(wwidth, wheight);

	$("body").append(renderer.domElement);


	document.addEventListener( 'mousemove', onDocumentMouseMove, false );

}

function onDocumentMouseMove( event ) {

	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

//

function animate() {

	requestAnimationFrame( animate );

	render();
	//stats.update();

}

function moveToTarget(mover,target,speed, buffer){
	
	var mPoints=mover.position.clone(),  //position of mover
		tPoints=target.position.clone(), //position of target
		nPoints=mover.position.clone(), //proposed new position - starts as mover
		xDir='static', yDir='static', zDir='static';

	//determine directions to go - probably overcomplex, but I'm learnin' here
		if(mPoints.x > tPoints.x  + buffer.x) xDir='left'; else xDir='right';
		if(mPoints.y > tPoints.y  + buffer.y) yDir='up'; else yDir='down';
		if(mPoints.z > tPoints.z  + buffer.z) zDir='out'; else zDir='in';
	
	//move the X axis, match target's X axis when you reach target's X
		if(xDir=='left') nPoints.x = mPoints.x - speed;
		if(xDir=='right') nPoints.x = mPoints.x + speed;
		if(xDir=='left' && nPoints.x < tPoints.x - buffer.x) nPoints.x = tPoints.x  - buffer.x;
		if(xDir=='right' && nPoints.x > tPoints.x + buffer.x) nPoints.x = tPoints.x + buffer.x;
		
	//move the Y axis, match target's Y axis when you reach target's Y
		if(yDir=='down') nPoints.y = mPoints.y - speed;
		if(yDir=='up') nPoints.y = mPoints.y + speed;
		if(yDir=='down' && nPoints.y < tPoints.y - buffer.y) nPoints.y = tPoints.y  - buffer.y;
		if(yDir=='up' && nPoints.y > tPoints.y + buffer.y) nPoints.y = tPoints.y + buffer.y;
		
	//move the Z axis, match target's Z axis when you reach target's Z
		if(zDir=='out') nPoints.z = mPoints.z - speed;
		if(zDir=='in') nPoints.z = mPoints.z + speed;
		if(zDir=='out' && nPoints.z < tPoints.z - buffer.z) nPoints.z = tPoints.z - buffer.z;
		if(zDir=='in' && nPoints.z > tPoints.z + buffer.z) nPoints.z = tPoints.z + buffer.z;				
		
		//assign new position to mover
		mover.position = nPoints;
						
}

function newMoveToTarget(mover,target,speed){
	
	var mPoints=mover.position.clone(),  //position of mover
		tPoints=target.clone(), //position of target
		nPoints=mover.position.clone() //proposed new position - starts as mover
		
		//determine directions and speeds
		if(mPoints.x > tPoints.x  ) xDir='left'; else xDir='right';
		if(mPoints.y > tPoints.y  ) yDir='up'; else yDir='down';
		if(mPoints.z > tPoints.z  ) zDir='out'; else zDir='in';
		
		if(mPoints.x == tPoints.x  ) xDir='done';
		if(mPoints.y == tPoints.y  ) yDir='done'; 
		if(mPoints.z == tPoints.z  ) zDir='done';

		//console.log("Camera moving "+xDir+" "+yDir+" "+zDir);			
				
		var xDif=Math.abs(mPoints.x - tPoints.x);
		var yDif=Math.abs(mPoints.y - tPoints.y);
		var zDif=Math.abs(mPoints.z - tPoints.z);
		
		//determine max length - gets bulk of speed
		var maxLength=Math.max(xDif,yDif,zDif);
		
		//console.log("Camera dist: "+maxLength);
		
		if(maxLength>0){
			//hide tweet while moving;
			hideCurrentTweet();

			//set speed according to bezier
			var curSpeed=Math.abs(getBezierSpeed(maxLength/targetMaxDist,bStart,c1,c2,bEnd)*speed)+targetMinSpeed;
			if(curSpeed<=1) console.log("slowing!! "+curSpeed);
			
			var xSpeed=curSpeed*(xDif/maxLength);
			var ySpeed=curSpeed*(yDif/maxLength);
			var zSpeed=curSpeed*(zDif/maxLength);
		
		//move the X axis, match target's X axis when you reach target's X
			if(xDir=='left') nPoints.x = mPoints.x - xSpeed;
			if(xDir=='right') nPoints.x = mPoints.x + xSpeed;
			if(xDir=='left' && nPoints.x < tPoints.x ) nPoints.x = tPoints.x  ;
			if(xDir=='right' && nPoints.x > tPoints.x ) nPoints.x = tPoints.x ;
			
		//move the Y axis, match target's Y axis when you reach target's Y
			if(yDir=='down') nPoints.y = mPoints.y + ySpeed;
			if(yDir=='up') nPoints.y = mPoints.y - ySpeed;
			if(yDir=='down' && nPoints.y > tPoints.y ) nPoints.y = tPoints.y ;
			if(yDir=='up' && nPoints.y < tPoints.y ) nPoints.y = tPoints.y ;
			
		//move the Z axis, match target's Z axis when you reach target's Z
			if(zDir=='out') nPoints.z = mPoints.z - zSpeed;
			if(zDir=='in') nPoints.z = mPoints.z + zSpeed;
			if(zDir=='out' && nPoints.z < tPoints.z ) nPoints.z = tPoints.z;
			if(zDir=='in' && nPoints.z > tPoints.z ) nPoints.z = tPoints.z;				
			
			//console.log(maxLength +" / "+ targetMaxDist);
			//console.log(xSpeed);
		} else { 
			//if done moving, set original moving var to true, used for return camera move. TODO separate concerns
			moving=true;
			if(targeted) showCurrentTweet();
		 }
		//assign new position to mover
		mover.position = nPoints;						
}


//determine a location for the camera to go that puts the target ball in center view.
function determineTweetView(targetBall,outerDistance){
	
	var mPoints=camera.target.position.clone(),  //center of scene
		tPoints=targetBall.position.clone(), //position of target
		nPoints=targetBall.position.clone() //new viewing position - starts as target
		
			
		//determine directions 
		if(mPoints.x > tPoints.x  ) xDir='left'; else xDir='right';
		if(mPoints.y > tPoints.y  ) yDir='up'; else yDir='down';
		if(mPoints.z > tPoints.z  ) zDir='out'; else zDir='in';
		
		var xDif=Math.abs(mPoints.x - tPoints.x);
		var yDif=Math.abs(mPoints.y - tPoints.y);
		var zDif=Math.abs(mPoints.z - tPoints.z);
		
		//console.log("From center moving "+xDir+" "+yDir+" "+zDir);			

		
		//determine max length and the shape of the traversing triangles - determines how far past the target to go
		var maxLength=Math.max(xDif,yDif,zDif);
		//console.log("Center dist: "+maxLength);			

	
		if(maxLength>0){
			var xPast=(maxLength+outerDistance)*(xDif/maxLength);
			var yPast=(maxLength+outerDistance)*(yDif/maxLength);
			var zPast=(maxLength+outerDistance)*(zDif/maxLength);
			//console.log(xPast+" "+yPast+" "+zPast);
					
		//move the X axis, match target's X axis when you reach target's X
			if(xDir=='left') nPoints.x = mPoints.x - xPast;
			if(xDir=='right') nPoints.x = mPoints.x + xPast;
			
		//move the Y axis, match target's Y axis when you reach target's Y
			if(yDir=='down') nPoints.y = mPoints.y + yPast;
			if(yDir=='up') nPoints.y = mPoints.y - yPast;
			
		//move the Z axis, match target's Z axis when you reach target's Z
			if(zDir=='out') nPoints.z = mPoints.z - zPast;
			if(zDir=='in') nPoints.z = mPoints.z + zPast;
			
		}
		
		/*
		console.log(xDir+" "+yDir+" "+zDir);
		console.log("Target: "+tPoints.x+" "+tPoints.y+" "+tPoints.z)
		console.log("View: "+nPoints.x+" "+nPoints.y+" "+nPoints.z)
		
*/
		//return the position
		return nPoints;						
}


//a one-time determination of the distance between two points to set the easing scale
function determineTargetDistance(mover,target){
	
	if(!targetPathSet){
		targetPathSet=true;
		
		var mPoints=mover.position.clone(),  //position of mover
		tPoints=target.clone() //position of target
			
		var xDif=Math.abs(mPoints.x - tPoints.x);
		var yDif=Math.abs(mPoints.y - tPoints.y);
		var zDif=Math.abs(mPoints.z - tPoints.z);
		
		//determine max length and the shape of the traversing triangles - determines how far past the target to go
		targetMaxDist=Math.max(xDif,yDif,zDif);
	
	}
	
	return targetMaxDist;
}


var radius = 700;
var theta = 0;

function render() {

	
	//standard floataround if moving
	if(moving && !targeted){
	
		// rotate camera
		theta += speed;
	
		camera.position.x = radius * Math.sin( theta * Math.PI / 360 );
		camera.position.y = radius * Math.sin( theta * Math.PI / 360 );
		camera.position.z = radius * Math.cos( theta * Math.PI / 360 );
		camera.oldPosition=camera.position.clone();
	}
	// find intersections

	if(targeted){
		
		determineTargetDistance(camera, determineTweetView(scene.objects[targetBall],outerViewDistance));
		
		scene.objects[targetBall].materials[0]=new THREE.ParticleCanvasMaterial({ 
					color: targetColor, //red
					/// green filter color 0xb1c804
					program: programFill
					 
				});
		
		newMoveToTarget(camera, determineTweetView(scene.objects[targetBall],outerViewDistance), targetMaxSpeed);
		
	
/*
		
	if(scene.objects.length>10){
	 
	newMoveToTarget(scene.objects[flyingBall], determineTweetView(scene.objects[targetBall],700), targetMaxSpeed);
					scene.objects[flyingBall].materials[0]=new THREE.ParticleCanvasMaterial({ 
					color: 0xb1c804, //adjust green here ryan
					program: programFill
					 
				});
	}
*/
	
	} 
	
	if(!targeted && !moving){
			newMoveToTarget(camera, camera.oldPosition, targetMaxSpeed, moving);
	}
	
	

	camera.update();

	//clear hover if not hovering
	for(var i=0;i<scene.objects.length;i++){
		//console.log(scene.objects[i].materials.pop(1,1));
	}
	
		
	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector, camera );
	
	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

	var intersects = ray.intersectScene( scene );

	if ( intersects.length > 0 ) {

						
		if ( INTERSECTED != intersects[ 0 ].object ) {
			
			if ( INTERSECTED ) { 
				INTERSECTED.materials[ 0 ].program = programFill;
				}

			INTERSECTED = intersects[ 0 ].object;
			INTERSECTED.materials[ 0 ].program = programFill;
			
					//colorize hover
					INTERSECTED.materials.push=new THREE.ParticleCanvasMaterial({ 
					color: baseColor, //adjust green here ryan
					program: programFill
					 
				});
			
		}

	} else {

		if ( INTERSECTED ) INTERSECTED.materials[ 0 ].program = programFill;

		INTERSECTED = null;

	}
	
	if(scene.objects.length>10){var newPos=(toScreenXY(scene.objects[4].position,camera,$('html')));

			 	//console.log(newPos.x+" / "+newPos.y);

			 	$('#testbox').css('left',newPos.x);
			 	$('#testbox').css('top',newPos.y);}
	
	renderer.render( scene, camera );

}


var last = '';
var timeOut;
var arr_profanity=["xyxghiychidhidhfidafu"];
//disables profanity filter

function getTweets(id){
		$.getJSON("server.php?start="+id,
		function(data){
				$.each(data, function(count,item){
						addNew(item);
						last = item.id;
				});
		});
}

function findProfanity(str){
	str=str.toLowerCase();
	for(var i=0;i<arr_profanity.length;i++){
			if (str.indexOf(arr_profanity[i])!=-1){
				//console.log("Found banned word '"+arr_profanity[i]+"' in '"+str+"'")
				return true;
			}
	}
	
	return false;
}

function filterByWord(word){
	//clear active array
	arr_activeTweets=[];
	
	//iterate through array
	for(var i=0;i<arr_tweets.length;i++){
		if(arr_tweets[i].text!=null){
	    var str=arr_tweets[i].text.toLowerCase();
	    
		if (str.indexOf(word)!=-1){
				//console.log("Found the word '"+word+"' in '"+str+"'");
				arr_activeTweets.push(arr_tweets[i]);
			}
		}
	}
	
	$(scene.objects).each(function(){
		for(var j=0;j<arr_activeTweets.length;j++){
			//console.log('checking '+ arr_activeTweets[j] + ' against '+this.id);
			if(this.id==arr_activeTweets[j].id) {this.materials[0]=(
			new THREE.ParticleCanvasMaterial({ 
					//opacity: '.'+ arr_activeTweets[j].statuses_count,
					color: filterColor, //adjust green here ryan
					program: programFill
					 
				})
			
			)
			
			}
		}
	});

	
}

//interface with controller
var str_controllerState="normal";


//get initial state
if(useController){
$.get('control/get_controller.php',function(data){

		//console.log(data);
		var setObj = $.parseJSON(data);
	str_controllerState=setObj.control;

//check for listener
		var interval=setInterval(function(){$.get('control/get_controller.php',function(data){
		
		//console.log(data);
		var checkObj = $.parseJSON(data);
		//console.log(checkObj.control + " vs " + str_controllerState);

if(checkObj.control != str_controllerState){
			//console.log(checkObj.control + " vs!!! " + str_controllerState);
			
			if(checkObj.control=="reset") { console.log('HEY RESET'); restoreMaterials();}
			else { filterByWord(checkObj.control); }
			str_controllerState=checkObj.control;
			$(".player").fadeTo(800,0,function(){
				$(this).remove();
			})
			$("body").append('<div class="player" rel="'+ checkObj.control +'"><img src="../images/'+ checkObj.control +'.png" alt="'+ checkObj.control +'" /><span>'+ checkObj.control +'</span></div>');
			$(".player").fadeTo(800,1);
			
}			
		
		
		
		
		
	})},1000);
	
	
//check for navigation
		var interval=setInterval(function(){$.get('control/get_navigation.php',function(data){
		
		//console.log(data);
		var checkObj = $.parseJSON(data);
		//console.log(checkObj.control + " vs " + str_controllerState);

		if(checkObj.navigation == "orbit"){
			restoreMaterials();
			moving=false;
			targeted=false;	
				$(".player").fadeTo(800,0,function(){
					$(this).remove();
				})
		}
					
		if(checkObj.navigation == "next"){
			restoreMaterials();

			targetBall++;
			if(targetBall > scene.objects.length-1) targetBall=0;			
			targeted=true;
				$(".player").fadeTo(800,0,function(){
					$(this).remove();
				})
			
		}
		
		if(checkObj.navigation == "previous"){
			restoreMaterials();
	    	targetBall--;			
	    	if(targetBall < 0) targetBall=scene.objects.length-1;			

			targeted=true;
				$(".player").fadeTo(800,0,function(){
					$(this).remove();
				})
		}
	
		
		$.post("control/set_navigation.php",  { control: "off" });
		
		
		
	})},500);	
	
	
})
}


function addNew(item){
		tweet(item);
		if(scene.objects.length>200){ //If we have more than 300 tweets
		
			scene.objects.shift();
		}
}

function tweet(item) {
	
		/* template to add highlighted tweet */
		var d = Date.parse(''+item.created_at+''),
		    my_data = {
				profile_image_url: item.profile_image_url,
				id: item.id,
				name: item.name,
				screen_name: item.screen_name,
				tweet: item.text,
				created_at: d.toString('dddd, MMMM dd, yyyy h:mm:ss tt')
	        	},
			tweets = ich.realtimetweets_templ(my_data);
			if(!findProfanity(item.text+" "+item.name)){
				//$("#tweets").prepend(tweets);
				arr_tweets_dom.push(tweets);
				arr_tweets.push({'text':item.text,'id':item.id, 'opacity':item.statuses_count});	
			
		
			
	
			// add particles and position them
		var colorfill = item.profile_background_color,								 
		 	particle = new THREE.Particle( new THREE.ParticleCanvasMaterial({ 
					opacity: '.'+ item.statuses_count,
					color: baseColor, 
					program: programFill,
					 
				}));
		particleCount++;		
		
		particle.position.x = Math.random() * 800 - 400;
		particle.position.y = Math.random() * 800 - 400;
		particle.position.z = Math.random() * 800 - 400;
		particle.scale.x = particle.scale.y = 25;
		particle.id= item.id;
		particle.enum= particleCount;
		particle.originalMaterial=particle.materials[0];

		scene.addObject(particle);
		
		}
		
}

function poll(){
		timeOut = setTimeout('poll()', 300);
		getTweets(last);
}

function restoreMaterials(){
	for(var i=0;i<scene.objects.length;i++){
		scene.objects[i].materials[0]=scene.objects[i].originalMaterial;
	}
	
}

//now run it!
$(document).ready(function() {
	poll();
	
	$('html').click(function(){
		if(INTERSECTED!=null){
			restoreMaterials();
			
			//if clicking targeted ball, restore position, else, target ball
				if((INTERSECTED.enum-1)==targetBall){	
					moving=false;
					targeted=false;
					
				}
				
				else {
				cameraReturning=false;
				targetPathSet=false;
				targeted=true;
				moving=true;
				console.log(INTERSECTED.enum-1);
				
				targetBall=INTERSECTED.enum-1;
				}
			}
	});
	
	$(document).keypress(function(event){
	
		if(event.which==32){
			restoreMaterials();
			moving=false;
			targeted=false;	
		}
					
		if(event.which==46){
			restoreMaterials();

			targetBall++;
			if(targetBall > scene.objects.length-1) targetBall=0;			
			targeted=true;
			
		}
		
		if(event.which==44){
			restoreMaterials();
	    	targetBall--;			
	    	if(targetBall < 0) targetBall=scene.objects.length-1;			

			targeted=true;
		}
		
		
	});
	
});


