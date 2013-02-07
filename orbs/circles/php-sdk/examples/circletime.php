<?php

if(!isset($_GET['brand'])) $brand='starbucks'; else $brand=$_GET['brand'];

function filterText($text)
{
   $search = array (
      '&',
      '<',
      '>',
      '"',
      chr(212),
      chr(213),
      chr(210),
      chr(211),
      chr(209),
      chr(208),
      chr(201),
      chr(145),
      chr(146),
      chr(147),
      chr(148),
      chr(151),
      chr(150),
      chr(133),
      chr(10),
      chr(13),
      chr(9),
      '[',
      ']'
   );
   $replace = array (
      '&amp;',
      '&lt;',
      '&gt;',
      '\\"',
      '&#8216;',
      '&#8217;',
      '&#8220;',
      '&#8221;',
      '&#8211;',
      '&#8212;',
      '&#8230;',
      '&#8216;',
      '&#8217;',
      '&#8220;',
      '&#8221;',
      '&#8211;',
      '&#8212;',
      '&#8230;',
      '',
      '',
      '',
      '',
      ''
   );
   return str_replace($search, $replace, $text);
}

// USAGE:
header('Content-Type: text/html; charset="UTF-8"');


require '../src/facebook.php';

// Create our Application instance (replace this with your appId and secret).
$facebook = new Facebook(array(
  'appId'  => '241333159227158',
  'secret' => '2d1e15361fd29d232dd698892dfdea71',
));


    $posts = $facebook->api("$brand/posts");
	
	echo "<span class=debug>";
	print_r($posts);
	echo "</span>";
	
	foreach($posts['data'] as $post){
	
		$numComments=0;
		if(!empty($post['comments']['count'])) $numComments=$post['comments']['count'];
		
		$numLikes=0;
		if(!empty($post['likes']['count'])) $numLikes=$post['likes']['count'];
	
		if(empty($post['description'])) $preview=filterText($post['message']); else $preview=filterText($post['description']);
		
		echo "<span class='post'>{ \"text\":\"".substr($preview,0,120)."....\", \"likes\": ".$numLikes.", \"comments\": ".$numComments.", \"date\": \"". date('g:i a l, F j',strtotime($post['created_time']))."\", \"timestamp\": ". strtotime($post['created_time']) ." }</span>";
		//echo'<BR> '."https://graph.facebook.com/".$post->id."?access_token=$token";
		
	}
	
?>

<!DOCTYPE html>

<html>
<head>
<style type="text/css">
	#overlay {		
		color: white;
		position: fixed;
		height: 80px;
		width: 100%;
		font-size: 14px;
		z-index: 1000;
		bottom:0;
		padding:20px;
		font-family: Georgia;
		background-color: rgba(255,255,255,.2)
	}
	
	#brand_chooser{
		position: fixed;
		z-index: 1000;
		height: 30px;
		width:300px;
		margin:auto 0 0 auto;
		color:white;
		padding:20px;
		font-family: Georgia;
		background-color: rgba(255,255,255,.2);
		position:relative;
		}
		
	#brand_name{
		position: fixed;
		left:20px;
		top: 20px;
		font-size: 36px;
		font-family: Georgia;
		color: white;
		padding:20px;
	}
			
	
	#overlay span{
		position: absolute;
	}
	
	#overlay .date{
		font-size:16px;
		top:10px;
	}
	
	#overlay .likes{
		font-size:16px;
		right: 100px;
		top:36px;
	}
	
	#overlay .comments{
		font-size:16px;
		right: 100px;
		top:76px;
	}
	
	#overlay .text{
		font-size:20px;
		top:36px;
		width:600px;
	}
	
	.post{
		display: none;	
	}
	
	.debug{
		display: none;
	}
		
	canvas {
	  margin:  0px;
	  padding: 0px;
	  position: fixed;
	  z-index: 0;
	}
	
	html {
        background: url(background.jpeg) no-repeat center center fixed;
        -webkit-background-size: cover;
        -moz-background-size: cover;
        -o-background-size: cover;
        background-size: cover;
	}



body{margin:0;padding:0}
</style>

  <script src="processing.js"></script>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js"></script>

<body>

<script type="text/javascript">
		function addCommas(nStr)
		{
			nStr += '';
			x = nStr.split('.');
			x1 = x[0];
			x2 = x.length > 1 ? '.' + x[1] : '';
			var rgx = /(\d+)(\d{3})/;
			while (rgx.test(x1)) {
				x1 = x1.replace(rgx, '$1' + ',' + '$2');
			}
			return x1 + x2;
		}	
</script>


 <script type="application/processing"> 

  //first some jQuery and some variables to be defined through jQuery
  var arr_posts= [],
  	  numPosts=$('.post').size(),
   	  int_topLikes=1,
   	  int_topComments=1,
   	  int_maxScale=1;
		
		function sortByLikes(a, b) {
			return b.likes - a.likes;
		}
		
		function sortByComments(a, b) {
			return b.comments - a.comments;
		}
  
  $(function(){
  
	  	$('.post').each(function(){
			console.log($(this).html());
	 	 	arr_posts.push($.parseJSON($(this).html()));
	  		//console.log(arr_posts[arr_posts.length-1]);
	 	});
	  	
	  	arr_byLikes=arr_posts.slice();
	    arr_byComments=arr_posts.slice();
	  	arr_byLikes.sort(sortByLikes);
	    arr_byComments.sort(sortByComments);
	    
	    int_topLikes = arr_byLikes[0].likes;
	    int_topComments = arr_byComments[0].comments;
	    
	    int_maxScale=max(int_topLikes, int_topComments);

		init();
  });
	
	
  /* 
  PROCESSINGJS.COM HEADER ANIMATION  
  MIT License - F1lT3R/Hyper-Metrix
  Native Processing Compatible 
  */  

  // Set number of circles
  int count = numPosts;
  // Set maximum and minimum circle size
  int maxSize = 100;
  int minSize = 20;
  int numColumns=9;
  // Build float array to store circle properties
  float[][] e = new float[count][5];
  // Set size of dot in circle center
  float ds=2;
  // Selected mode switch
  int sel = 0;
  // Set drag switch to false
  boolean dragging=false;


  // Set up canvas
  void init(){
    // Frame rate
    frameRate(30);
    // Size of canvas (width,height)
    size(window.innerWidth,window.innerWidth);
    // Stroke/line/border thickness
    strokeWeight(1);
    int theX=0;
    int xFac=0;
       int theY=120;
    // Initiate array with random values for circles
    for(int j=0;j< count;j++){

       xFac++;
       
    	if((j+1)%numColumns==0){
    	    xFac=0;
   		    theY+=120;
    	}
    	
    	theX=(xFac+1)*120;
    
      e[j][0]=theX; // X 
      e[j][1]=theY; // Y
      e[j][2]=(arr_posts[j].likes/int_maxScale)*100; //first radius - based on likes        
      e[j][3]=0; // X Speed
      e[j][4]=0; // Y Speed    
      e[j][5]=(arr_posts[j].comments/int_maxScale)*100 //inner size - based on comments
    }
  }

  // Begin main draw loop (called 25 times per second)
  void draw(){
    // Fill background black
    background(0,0);
    // Begin looping through circle array
    for (int j=0;j< count;j++){
    // Disable shape stroke/border
    noStroke();
    // Cache diameter and radius of current circle
    float radi=e[j][2];
    float smallRadi=e[j][5];
    float diam=radi/2;
    // If the cursor is within 2x the radius of current circle...
    if( dist(e[j][0],e[j][1],mouseX,mouseY) < 120/2 ){
    // Change fill color to green.
    fill(60,207,120,180);
    
    //talk to jquery
    $('#overlay .text').text(arr_posts[j].text);
    $('#overlay .date').text(arr_posts[j].date);
    $('#overlay .likes').text(addCommas(arr_posts[j].likes)+" likes");
    $('#overlay .comments').text(addCommas(arr_posts[j].comments+" comments"));
    
    
    // Remember user has circle "selected"  
    sel=1;
    // If user has mouse down and is moving...
    if (dragging){
      // Move circle to circle position
      e[j][0]=mouseX;
      e[j][1]=mouseY;
      }
    } else {
      // Keep fill color blue
      fill(40,187,100,180);
      // User has nothing "selected"
      sel=0;
    }
    // Draw circle
    ellipse(e[j][0],e[j][1],radi,radi);
    
    // fill middle with white
     fill(255,255,255,180);
    // Draw smaller circle
    ellipse(e[j][0],e[j][1],smallRadi,smallRadi);

    // Turn off stroke/border
    noStroke();      

    }
  }

</script>

<canvas width="200" height="200"></canvas>

<span id="brand_name"><?php echo $brand; ?></span>

<div id=overlay>
	<span class=date></span>
	<span class=text></span>
	<span class=likes></span>
	<span class=comments></span>
</div>

<div id="brand_chooser">
	<form action="circletime.php">
		<label>Choose another brand:</label>
		<input name="brand" id="brand">
		<input type="submit">
	</form>
</div>

</body>
</html>
