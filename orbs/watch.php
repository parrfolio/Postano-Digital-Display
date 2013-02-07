<?php
	include_once('config.php');
	$opts = array(
		'http'=>array(
			'method'	=>	"POST",
			'content'	=>	'track='.WORDS_TO_TRACK,
		)
	);
	//We're going to store the data in the database, so, let's open a connection:
	$db = mysql_connect('localhost', 'root', 'root');
	mysql_select_db('bbuk', $db);

	$context = stream_context_create($opts);
	while (1){
		$instream = fopen('https://'.TWITTER_USERNAME.':'.TWITTER_PASSWORD.'@stream.twitter.com/1/statuses/filter.json','r' ,false, $context);
	if($instream != false){
		while(! feof($instream)) {
			if(! ($line = stream_get_line($instream, 20000, "\n"))) {
				continue;
			}else{
				
				$tweet = json_decode($line);
				
				if(!empty($tweet->{'id'})){
				//Clean the inputs before storing
					$id = mysql_real_escape_string($tweet->{'id'});
					$text = mysql_real_escape_string($tweet->{'text'});
					$retweet_count = mysql_real_escape_string($tweet->{'retweet_count'});
					$screen_name = mysql_real_escape_string($tweet->{'user'}->{'screen_name'});
					$name = mysql_real_escape_string($tweet->{'user'}->{'name'});
					$followers_count = mysql_real_escape_string($tweet->{'user'}->{'followers_count'});
					$statuses_count = mysql_real_escape_string($tweet->{'user'}->{'statuses_count'});
					$friends_count = mysql_real_escape_string($tweet->{'user'}->{'friends_count'});
					$profile_image_url = mysql_real_escape_string($tweet->{'user'}->{'profile_image_url'});
					$profile_background_color = mysql_real_escape_string($tweet->{'user'}->{'profile_background_color'});
					//We store the new post in the database, to be able to read it later
					$ok = mysql_query("INSERT INTO tweets (id ,text, retweet_count, screen_name, name, followers_count, statuses_count, friends_count, profile_image_url, profile_background_color, created_at) VALUES ('$id', '$text', '$retweet_count', '$screen_name', '$name', '$followers_count', '$statuses_count', '$friends_count', '$profile_image_url', '$profile_background_color', NOW())");
					if (!$ok) {echo "Mysql Error: ".mysql_error();}
					flush();
					}
				}
			}
		}
	}
?>
