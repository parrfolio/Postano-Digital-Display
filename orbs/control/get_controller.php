<?php

	$db = mysql_connect('localhost', 'root', 'root');
	mysql_select_db('bbuk', $db);
	 
 $sql = "SELECT * FROM controller;";

 $retval = mysql_query($sql);

	if(! $retval )
	{
		  die('Could not get data: ' . mysql_error());
		}
		else {
		
		while($row = mysql_fetch_array($retval, MYSQL_ASSOC))
		{
		
			 			 		
	 		$control=stripslashes($row['control']);
	 		
	 		  		
 		}
 	}
 	
 	echo "{ \"control\": \"$control\" } ";
 	

 	
 	
?>