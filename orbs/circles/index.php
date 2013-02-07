<?php

if(!isset($_GET['brand'])) $brand='BigBrotherUK'; else $brand=$_GET['brand'];

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


require 'php-sdk/src/facebook.php';

// Create our Application instance (replace this with your appId and secret).
$facebook = new Facebook(array(
  'appId'  => '255058427847494',
  'secret' => 'add7ec45edefb0292c743331dcc141bd',
));

                
    $posts = $facebook->api("$brand/posts",Array('limit'=>100));
	
	echo "<span class=debug>";
//	print_r($posts);
	echo "</span>";
	
	foreach($posts['data'] as $post){
	
		$numComments=0;
		if(!empty($post['comments']['count'])) $numComments=$post['comments']['count'];
		
		$numLikes=0;
		if(!empty($post['likes']['count'])) $numLikes=$post['likes']['count'];
	
		if(empty($post['description'])) $preview=filterText($post['message']); else $preview=filterText($post['description']);
		
		
		
		echo "<span class='post'>{ \"text\":\"".$preview."....\", \"likes\": ".$numLikes.", \"comments\": ".$numComments.", \"date\": \"". date('g:i a l, F j',strtotime($post['created_time']))."\", \"timestamp\": ". strtotime($post['created_time']) ." }</span>";
		//echo'<BR> '."https://graph.facebook.com/".$post->id."?access_token=$token";
		
	}
	
	//now do a search
	$token='145634995501895|917c72207ca2fa46cd7af8d8.1-1297354510|ofEmuFVfiXDyMLTTDLtulEdFwGs';

		function get_url_contents($url){
        $crl = curl_init();
        $timeout = 20;
        curl_setopt ($crl, CURLOPT_URL,$url);
        curl_setopt ($crl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt ($crl, CURLOPT_CONNECTTIMEOUT, $timeout);
        curl_setopt ($crl, CURLOPT_SSL_VERIFYPEER, false);
        $ret = curl_exec($crl);
        curl_close($crl);
        	return $ret;
		}		

/*
$search=json_decode(get_url_contents("https://graph.facebook.com/search?q=$brand&access_token=$token"));
	
	echo "<span class=debug>";
	print_r($search);
	echo "</span>";

	foreach($search->data as $post){
	
		$numSearchComments=0;
		if(!empty($post->comments->count)) $numComments=$post->comments->count;
		
		$numSearchLikes=0;
		if(!empty($post->likes->count)) $numLikes=$post->likes->count;
	
		if(empty($post->description)) $preview=filterText($post->message); else $preview=filterText($post->description);
		
		echo "<span class='search'>{ \"text\":\"".substr($preview,0,120)."....\", \"likes\": ".$numSearchLikes.", \"comments\": ".$numSearchComments.", \"date\": \"". date('g:i a l, F j',strtotime($post->created_time))."\", \"timestamp\": ". strtotime($post->created_time) ." }</span>";
		//echo'<BR> '."https://graph.facebook.com/".$post->id."?access_token=$token";
		
	}
*/

?>
<!DOCTYPE html>

<html>
<head>

<title>Windows Phone Facebook Engagement</title>
<style type="text/css">

@font-face {
font-family: 'SegoeWP-Light';
src: url('fonts/SegoeWP-Light.eot');
src: url('fonts/SegoeWP-Light.eot?#iefix') format('embedded-opentype'),
     url('fonts/SegoeWP-Light.woff') format('woff'),
     url('fonts/SegoeWP-Light.ttf') format('truetype'),
     url('fonts/SegoeWP-Light.svg#SegoeWP-Light') format('svg');
font-weight: normal;
font-style: normal;
}


@font-face {
font-family: 'SegoeWP';
src: url('fonts/SegoeWP.eot');
src: url('fonts/SegoeWP.eot?#iefix') format('embedded-opentype'),
    url('fonts/SegoeWP.woff') format('woff'),
    url('fonts/SegoeWP.ttf') format('truetype'),
    url('fonts/SegoeWP.svg#SegoeWP') format('svg');
font-weight: normal;
font-style: normal;
}


body {
    background: #000 url("img/bg.png") no-repeat;
	margin:0;
	padding:0
	}

	#darken {
		position: fixed;
		width:100%;
		height: 100%;
		background-color: rgba(0,0,0,.7);
		top:0;
		z-index: -100;
	}
	
	#blacken{
		position: fixed;
		width:100%;
		height: 100%;
		background-color: black;
		top:0;
		z-index: -50;
	}
	
	#overlay {		
		background-color: rgba(0, 0, 0, 0.8);
		    bottom: 0;
		    color: white;
		    font-family: SegoeWP-Light,helvetica,arial,sans-serif;
		    font-size: 14px;
		    height: 80px;
		    min-height: 160px;
		    line-height: 1.2;
		    padding: 0;
		    position: fixed;
		    width: 100%;
		    z-index: 1000;
	}
	
	#brand_chooser{
		position: fixed;
		z-index: 1000;
		height: 30px;
		width:300px;
		margin:auto 0 0 auto;
		color:white;
		padding:20px;
		font-family:SegoeWP, helvetica, arial, sans-serif;
		
		background-color: rgba(255,255,255,.2);
		position:relative;
		}
		
		#brand_chooser input {
			border: 0 none;
			    color: #999999;
			    padding: 5px;
			width:250px;
			font-family:SegoeWP, helvetica, arial, sans-serif;
			
		}
		
	#brand_name{
		position: fixed;
		left:40px;
		top: 20px;
		text-indent:-999em;
		width:196px;
		height:98px;
		opacity:.7;
	    background: transparent url('img/eye.png') no-repeat; 
			}
			
	
	#overlay span{
		display:block;
	}
	
	#overlay .date {
	    color: #888888;
	    font-size: 14px;
	    padding: 20px 0 0 50px;
	}
	
	#overlay .likes, #overlay .comments {
		font-family:SegoeWP-Light, helvetica, arial, sans-serif;
		color: #1ba1e2;
	    float: left;
	    font-size: 48px;
	    left: 670px;
	    position: absolute;
	}
	
	.month_label {
		font-family:SegoeWP-Light, helvetica, arial, sans-serif;
		color: #EEEEEE;
	}
	
	#overlay .likes{
	    top: 22px;
		color:#eee;
	}
	
	#overlay .comments{
	    top: 80px;
	}
	
	#overlay .text{
		font-size: 28px;
		    padding: 0 0 40px 50px;
		    top: 36px;
		    width: 600px;
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
</style>

  <script src="js/processing.js"></script>
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
   	  int_maxScale=1,
   	  int_scope=1,
   	  mode="timeline"
   	  		
		function sortByLikes(a, b) {
			return b.likes - a.likes;
		}
		
		function sortByComments(a, b) {
			return b.comments - a.comments;
		}
  
  $(function(){
  
  	//load a google image for the brand
  	//GoogleLoad();
  
	  	$('.post').each(function(){
			//console.log($(this).html());
	 	 	arr_posts.push($.parseJSON($(this).html()));
	  		//console.log(arr_posts[arr_posts.length-1]);
	 	});
	  	
	  	arr_byLikes=arr_posts.slice();
	    arr_byComments=arr_posts.slice();
	  	arr_byLikes.sort(sortByLikes);
	    arr_byComments.sort(sortByComments);
	    arr_filtered=[];
	    arr_ticks=[];
	    arr_monthX=[];
	    arr_monthN=[];	    

   	  
   	  	arr_monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];

	    
	    int_topLikes = arr_byLikes[0].likes;
	    int_topComments = arr_byComments[0].comments;
	    
	    int_maxScale=max(int_topLikes, int_topComments);
		
		//process timeline
		int_scope=arr_posts[0].timestamp-arr_posts[numPosts-1].timestamp;
		int_numDays=Math.floor(int_scope/86400);

		//build array of short and tall ticks for monthlies
		for(var q=0;q<int_numDays;q++){
			var theDate=new Date((arr_posts[arr_posts.length-1].timestamp*1000)+(q*86400000));
			if(theDate.getDate()==1){ arr_ticks.push('tall');
				arr_monthX.push(q*(window.innerWidth/(int_numDays)));
				arr_monthN.push(arr_monthNames[theDate.getMonth()]);
			}
			else arr_ticks.push('short');
		}
		
		//add labels
		for(var m=0;m<arr_monthX.length;m++){
			var monthLabel= $('<div class="month_label" style="position:absolute; left:'+(arr_monthX[m]+10)+'px; top:160px;">'+arr_monthN[m]+"</div>");
			$('body').append(monthLabel);
		}
		
		//console.log(int_numDays);
		
		//show first post
	    $('#overlay .text').text(arr_posts[0].text.substr(0,120)+'...');
	    $('#overlay .date').text(arr_posts[0].date);
	    $('#overlay .likes').text(addCommas(arr_posts[0].likes)+" likes");
	    $('#overlay .comments').text(addCommas(arr_posts[0].comments+" comments"));
		
		//now that you have all the data, run the renderer
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
       int theY=290;
    // Initiate array with random values for circles
    for(int j=0;j< count;j++){
    
      e[j][0]=Math.abs(arr_posts[count-1].timestamp-arr_posts[j].timestamp)/int_scope*(window.innerWidth-30)+15; // X 
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
    if( dist(e[j][0],e[j][1],mouseX,mouseY) < (radi/2+10) ){
    // Highlight circle.
    fill(27,161,226,255);
    
    //talk to jquery
    $('#overlay .text').text(arr_posts[j].text.substr(0,120)+'...');
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
      //fill(27,161,226,160);
     
      // User has nothing "selected"
      sel=0;
    }
    


  // fill middle with white
    // fill(255,255,255,180); 



   
    fill(27,161,226,160);

    //check if this one is filtered - highlight green
	for(var f=0;f<arr_filtered.length;f++){
			  //console.log(j+' vs '+arr_filtered)
		      if(j==arr_filtered[f])  fill(255,174,71,190);

	
	}
	
    // Draw smaller circle
    ellipse(e[j][0],e[j][1],smallRadi,smallRadi);

	 fill(255,255,255,180); 

    // Draw circle
    ellipse(e[j][0],e[j][1],radi,radi);
    
  
    // Turn off stroke/border
    //noStroke();      
    strokeWeight(1);   // Default
    stroke(95,125,139);
    
    for(var p=0;p<arr_ticks.length;p++){
    	var lineX=p*(window.innerWidth/(int_numDays));
    	if(arr_ticks[p] == 'tall')  {   line(lineX,180,lineX,210);
    		
    	}
  		  	else 
  	    line(lineX,200,lineX,190);
   
    }
    


    }
  }
  
function filter(keyword){
	arr_filtered=[];
	
	if(keyword!=''){
		for(var i=0;i<arr_posts.length;i++){
			if(arr_posts[i].text!=undefined){
				if(arr_posts[i].text.toLowerCase().indexOf(keyword.toLowerCase())!=-1){
					arr_filtered.push(i);
					console.log("Found "+keyword+" in "+arr_posts[i].text);
				}
			}			
		}		
	}
}

$('#brand').keyup(function(){
	console.log('typin');
	filter($('#brand').val());

});

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
		<label>Filter:</label>
		<input name="brand" id="brand">
</div>


<!--
<div id=darken></div>
<div id=blacken></div>
-->


</body>
</html>
