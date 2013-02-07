<?php

require_once('../src/facebook.php');
require 'config_db.php';

$toRemove=$_POST['remove'];


	$query="DELETE FROM $db_structure WHERE (`fb_id` = $toRemove);";
	
	echo $query;
	
	$ok = mysql_query($query);
	if (!$ok) {echo "Mysql delete Error: ".mysql_error();}
	
?>	