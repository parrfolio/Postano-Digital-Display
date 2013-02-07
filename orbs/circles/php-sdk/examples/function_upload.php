<script src="js/jquery.js"></script>
<script>

$(function(){

	$('#submit').click(function(){
		//send this data to the batcher
		console.log(window);
		
		window.parent.startBatches($('.list_holder').text());
	})

});


</script>

<?php

 ini_set('auto_detect_line_endings', true);
 set_time_limit(0);
 
 $int=0;
 $string='';
 
 //function to discover empty CSV lines
 function fgetcsv_empty_line($row_array) {
 	 return ( !isset($row_array[1]) and empty($row_array[0]) );
 }
 
 
if (($_FILES["file"]["type"] == 'text/csv')

&& ($_FILES["file"]["size"] < 20000))
  {
  if ($_FILES["file"]["error"] > 0)
    {
    
    }
  else
    {
	
	$handle = fopen($_FILES["file"]["tmp_name"], "r");
	
	echo '<span class="list_holder" style="display:none">';
	//spit out CSV data
	while(!feof($handle)) { 
		$int++;
		$line = fgetcsv($handle,0,' ');
		//echo("<BR>DEBUG $int ".$line[0]);
		if(!fgetcsv_empty_line($line[0])){ $string.=$line[0];
		$string.= ',';}
	}

	//remove the final comma and spit out the data
	$end = substr($string,0,strlen($string)-1);
	echo $end;
	
    }
  }
else
  {
  	echo "Invalid file - please use a CSV";
  }
?>
</span>

<!-- add button to iframe -->
<input type="button" id="submit" value="Store FB data">
