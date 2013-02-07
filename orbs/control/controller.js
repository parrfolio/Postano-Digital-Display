//controller

$(function(){
	$('.filters li').click(function(){
		var str_control=$(this).attr('rel');
		$.post("set_controller.php",  { control: str_control });
	});
	
	//get status repeatedly
	var interval=setInterval(function(){$.get('get_controller.php',function(data){
		//console.log(data);
		var obj = $.parseJSON(data);
		$('.filters li').removeClass('active');
		$('.filters li[rel='+ obj.control +']').addClass('active');	
	})},100);
	

	$('nav a').click(function(){
		var str_control=$(this).attr('class');
		//remove 'active' if active
		str_control=str_control.split(" ")[0];
		
		$.post("set_navigation.php",  { control: str_control });
		return false
	});
	
	//get status repeatedly
	var interval2=setInterval(function(){$.get('get_navigation.php',function(data){	
				
		var obj = $.parseJSON(data);
		$('nav a').removeClass('active');
		$('nav a.'+ obj.navigation).addClass('active');
	})},100);	
});