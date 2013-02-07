<?php 
	require_once('../src/facebook.php');
	
	$db = mysql_connect('localhost', 'root', 'root');
	mysql_select_db('statefarm', $db);
	
	$db_structure='statefarm_structure';
	$db_history='statefarm_history';
	$db_snapshot='statefarm_snapshot';
	$db_error='statefarm_errors';
	
	//log any mysql errors to a table for reference
	function logMysqlError(){
				$query_err="INSERT INTO `$db_error` VALUES ('', '".mysql_real_escape_string(mysql_error())."', NOW());";
			    $errOk = mysql_query($query_err);
			   		if (!$errOk) {echo "Mysql Error: ".mysql_error();}
			   	}
	
		// Create our Application instance (replace this with your appId and secret).
	$facebook = new Facebook(array(
	  'appId'  => '241333159227158',
	  'secret' => '2d1e15361fd29d232dd698892dfdea71',
	));


?>