<?php 
	
	//database credentials
	$db = mysql_connect('localhost', 'root', 'root');
	mysql_select_db('bbuk', $db);

	$ret1=mysql_query("TRUNCATE `navigation`;");
	
	if($ret1){
			$ret2=mysql_query("INSERT INTO `navigation` VALUES ('','".$_POST['control']."');");
			
	}else{echo "db error";}
		
?>