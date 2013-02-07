<?php
/**
 * Copyright 2011 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

require '../src/facebook.php';

// Create our Application instance (replace this with your appId and secret).
$facebook = new Facebook(array(
  'appId'  => '241333159227158',
  'secret' => '2d1e15361fd29d232dd698892dfdea71',
));


// We may or may not have this data based on whether the user is logged in.
//
// If we have a $user id here, it means we know the user is logged into
// Facebook, but we don't know if the access token is valid. An access
// token is invalid if the user logged out of Facebook.


    $post = $facebook->api('webtrends/posts');
	
	print_r($posts);
	
	foreach($posts->data as $post){
	$count++;
	$preview=$post->description;
	
	if($description=='') $preview=$post->message;
	
	echo "<BR> $count: ".substr($post->description,0,45).'....';
	//echo'<BR> '."https://graph.facebook.com/".$post->id."?access_token=$token";
	
	}				
	
		

	
?>