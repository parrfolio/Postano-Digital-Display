<link rel="stylesheet" href="screen.css">

<script src="js/jquery.js"></script>
<script>
//limit of calls that can be sent to FB at once. This may change, so made it a var.
var int_batchLimit=20;

//uploading async code
function init() {
	document.getElementById('file_upload_form').onsubmit=function() {
		document.getElementById('file_upload_form').target = 'upload_target'; //'upload_target' is the name of the iframe
	}
}
window.onload=init;

function startBatches(str_list){
		var arr_batchLists=[];
		
		$('#instructions').hide();
		$('#data').show();
	
		//find out how many entries there are and how many batches we'll need
		var arr_entries=str_list.split(',');
		var int_numBatches=Math.floor(arr_entries.length/int_batchLimit);
				
		//as long as it's not divisible by the batch limit, we'll need an extra batch for the last entries
		if (int_numBatches % int_batchLimit != 0 || int_numBatches==0) int_numBatches++;
				
		//create batches of FB pages to look up
		for(var i=0;i<int_numBatches;i++){
			  (function(i) {
  		
  			//gather page id's from the start of the batch index to the end of this batch
			var int_batchStart=i*int_batchLimit
			
			//start blank string to serialize into
			arr_batchLists.push('');
			
			for(var j=int_batchStart; j<int_batchStart+int_batchLimit-1 && j<arr_entries.length; j++){
				//serialize the the pages in this batch
				arr_batchLists[i]+=arr_entries[j];
				
				//if it's not the last item in the batch, add a comma
				if(j!=int_batchStart+int_batchLimit-2 && j!=(arr_entries.length-1)) arr_batchLists[i]+=",";
				
			}	
						
			//send serialized list to PHP for lookup after a brief delay to keep them in order and not bog down the server
			var timer_post=setTimeout(function(){ $.post("function_batch.php", { entry: arr_batchLists[i] }, function(data){
				$('#status').html('Do not close this window. Recording entry '+j+' of '+arr_entries.length+'... Expected to take '+(((int_numBatches*5)/60)+1)+" minutes total.");
				
				//update status message if final
				if(i==int_numBatches-1){
					$('#status').html('Proccess complete with '+$('.error').size()+' errors.');
					$('#data h2').html('Facebook data collection is complete.');
				} 

				//show progress given by PHP
				$('#table').append(data);		
			})},i*5000)
		})(i)
		}}
	//end of submit click	


$(function(){

			
	

	$('.remove').live('click',function(){
		dom_remove= $(this).parent()	
		var str_remove=$(this).attr('id_reference');
		
		$.post("function_remove.php", { remove: str_remove }, function(data){
				dom_remove.remove();
		});
		
	});
	
//end of jQuery
});


</script>

<!-- The data encoding type, enctype, MUST be specified as below -->
<form id="file_upload_form" method="post" enctype="multipart/form-data" action="function_upload.php">
<input name="file" id="file" size="27" type="file" /><br />
<input type="submit" name="action" value="Upload" /><br />
<iframe id="upload_target" name="upload_target" src="" style="width:200px;height:50px;border:0px solid black;"></iframe>
</form>

<div id="instructions">
<p>Upload a CSV containing the facebook IDs you wish to collect in a single column. Id's are the right-most in a URL, either a username or a number. <a href='facebooks_small.csv'>Download a sample CSV.</a></p>
<img src="excel.png"><img src="ids.png">
</div>

<div id=data>
	<h2>Facebook data is being collected.</h2>
	<div id="status"></div>
	<div id="controls">
		<form>
			<input type=checkbox value="error" checked="true"> Show Errors (<span class="num_errors">0</span>)
			<input type=checkbox value="regular" checked="true"> Show Successes (<span class="num_successes">0</span>)
		</form>
	</div>
	
	<div id="table"></div>
	
		
</div>
<?php 

?>