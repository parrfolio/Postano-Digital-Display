<link rel="stylesheet" href="screen.css">


<?php

require 'config_db.php';
	
	//first, grab all your aggregating facebook pages
	$query_aggro="SELECT * from `$db_structure` ORDER BY `likes` DESC";
	$state_aggro=mysql_query($query_aggro);
	
	
	if(! $state_aggro )
	{
		  die('Could not get data: ' . mysql_error());
		  logMysqlError();
		}
		else {
			//we have successfully queried the database. Now to add up all the Likes.
			
			//declare some counting variables
			$likeTotal = 0;
			$pageTotal = 0; //total number of FB pages we're tracking
			$topN	= 10; // number of pages to highlight
			
			echo "<h2>Top $topN pages:</h2>";
			
			while($row = mysql_fetch_array($state_aggro, MYSQL_BOTH))
			{
				$likeTotal+=$row[likes];
				$pageTotal++;
				
				if($pageTotal<=$topN){
					echo "<div class='facebook_property'>";
					echo "<span class='id'> Facebook ID: ".$row[id]."</span> <div class=img_holder><img src=\"".$row[avatar]."\"></div> <h3 class='name'> ".$row[name]."</h3> <span class='likes'> ".number_format($row[likes])." </span> <a href=\"".$row[link]."\">Link</a>  </div>";				
				}
							
			}
		}
	
	echo "<div style='clear:both'></div>";
	echo "<BR>";
	echo number_format($likeTotal) . " total likes";
	echo "<BR>";
	echo number_format($pageTotal) . " total pages";
	
		
/*
	{
		//if all is ready, empty snapshot table
		$query_clear="TRUNCATE table `$db_snapshot`;";
	
		$ok = mysql_query($query_clear);
		if (!$ok) {echo "Mysql Error: ".mysql_error();
		
			logMysqlError();
		
		}
		else {
			$query_add="INSERT INTO `$db_snapshot` VALUES ('', '3000', '5000', '', NOW());";
	
		    $ok2 = mysql_query($query_add);
			if (!$ok2) {echo "Mysql Error: ".mysql_error();}
		}
	}		
*/
?>