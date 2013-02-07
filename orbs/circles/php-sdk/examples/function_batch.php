<?php

require '../src/facebook.php';
require 'config_db.php';

//get POST'ed list of facebook pages to look up
$batchEntries=explode(',', $_POST['entry'] );


$queries = array();

for($i=0;$i<20&&$i<count($batchEntries);$i++){

	array_push($queries, array('method' => 'GET', 'relative_url' => '/'.$batchEntries[$i])); 
}

$objs = $facebook->api('/?batch='.json_encode($queries), 'POST');

$count=-1;

//add or update each row gotten by FB api
foreach($queries as $q){
	$count++;
	$json=json_decode($objs[$count]['body']);
	
	//error_log($objs[$count]['body']);
	//if the facebook page is found - display it
	
	if(empty($json->error)){
	
	//display entry to show progress
	echo "<div class='facebook_property'>";
	echo "<span class='id'> Facebook ID: ".$json->id."</span> <div class=img_holder><img src=\"".$json->picture."\"></div> <h3 class='name'> ".$json->name."</h3> <span class='likes'> ".number_format($json->likes)." </span> <a href=\"".$json->link."\">Link</a> <a class='remove' id_reference=\"".$json->id."\">Remove</a> </div>";
	
	//check for username to stop PHP throwing errors for missing username
	if(!empty($json->username)) $username=$json->username; else $username="";
	
	//add to structure DB
	$query="REPLACE INTO $db_structure (`id`,`fb_id`,`lookup`,`name`,`avatar`,`link`,`likes`,`last_update`) VALUES ('', '".$json->id."', '".$username."', '".$json->name."', '".$json->picture."', '".$json->link."', '".$json->likes."', NOW());";
	
	//add to history DB
	$query2="INSERT INTO $db_history (`id`,`fb_id`,`likes`,`date`) VALUES ('', '".$json->id."', '".$json->likes."', NOW());";
	
	$ok = mysql_query($query);
	if (!$ok) {echo "Mysql replace Error: ".mysql_error();}
	
	$ok2 = mysql_query($query2);
	if (!$ok2) {echo "Mysql history Error: ".mysql_error();}
	}
	else{
		echo "<div class='facebook_property error'>";
		echo "<h3 class=name>Facebook id \"".$batchEntries[$count]."\" not found.</h3> <h3>Check the username and update your CSV.</h3></div>";
	
	}
}


?>