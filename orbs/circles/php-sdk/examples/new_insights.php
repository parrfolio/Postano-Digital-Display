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


$token='145634995501895|917c72207ca2fa46cd7af8d8.1-1297354510|ofEmuFVfiXDyMLTTDLtulEdFwGs';

		function get_url_contents($url){
        $crl = curl_init();
        $timeout = 20;
        curl_setopt ($crl, CURLOPT_URL,$url);
        curl_setopt ($crl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt ($crl, CURLOPT_CONNECTTIMEOUT, $timeout);
        curl_setopt ($crl, CURLOPT_SSL_VERIFYPEER, false);
        $ret = curl_exec($crl);
        curl_close($crl);
        	return $ret;
		}		

$ins=json_decode(get_url_contents("https://graph.facebook.com/webtrends/posts?access_token=$token"));

//print_r($ins->data);

$count=0;

foreach($ins->data as $post){
	$count++;
	$preview=$post->description;
	
	if($description=='') $preview=$post->message;
	
	echo "<BR> $count: ".substr($post->description,0,45).'....';
	//echo'<BR> '."https://graph.facebook.com/".$post->id."?access_token=$token";
	
	$analytics=json_decode(get_url_contents("https://graph.facebook.com/".$post->id."/insights/post_consumptions_unique/lifetime?access_token=$token"));
					
	print_r($analytics);
					
	
		
	}


?>