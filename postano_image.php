<?php

class Postano
{
    private static $API_URL     = "http://api.postano.com";
    private static $API_VERSION = "1";

    private $public_key;
    private $secret_key;

    public function __construct( $public_key, $secret_key )
    {
        $this->public_key = $public_key;
        $this->secret_key = $secret_key;
    }

    public function send_request( $action, $body )
    {
        $url = $this->create_url( $action, $body );
        return $this->call_action( $url, $body );
    }

    private function create_url( $action, $body )
    {
        $time_stamp = date( "Y-m-d\TH:i:s.uP" );
        $query      = "PostanoPublicKey=".rawurlencode( $this->public_key )."&".
                      "SignatureVersion=".self::$API_VERSION."&".
                      "Timestamp=".rawurlencode( $time_stamp );
        $query      = rawurlencode( $body )."&".$query;
        $signature  = base64_encode( hash_hmac( 'sha1', $query, $this->secret_key, true ) );
        $url        = self::$API_URL."/?"."Action=".$action."&".
                      "PostanoPublicKey=".rawurlencode( $this->public_key )."&".
                      "SignatureVersion=".self::$API_VERSION."&".
                      "Timestamp=".rawurlencode( $time_stamp )."&".
                      "Signature=".$signature;
    
        return $url;
    }

    private function call_action( $url, $body )
    {
        $params = array
            (
                CURLOPT_POST           => 1,
                CURLOPT_HEADER         => 0,
                CURLOPT_URL            => $url,
                CURLOPT_FRESH_CONNECT  => 1,
                CURLOPT_RETURNTRANSFER => 1,
                CURLOPT_FORBID_REUSE   => 1,
                CURLOPT_TIMEOUT        => 60,
                CURLOPT_POSTFIELDS     => $body
            );

        $c      = curl_init();
        curl_setopt_array( $c, $params );

        if ( !$res = curl_exec( $c ) )
            trigger_error( curl_error( $c ) );

        curl_close( $c );
        return $res;
    }
}

$api = new Postano( 'dd5dab1e31696d660d0d', 'xnwvTpc7Ox4uGErXoCg3755wTwbtqw5fvZBeIveE' );
$res = $api->send_request( "GetPosts", '{ "postano_id":69157, count:50 }' );

echo $res;
?>