<?php
include('config_mobile.php');

session_start();
$serviceURL = 'http://its.vip.gatech.edu/m/MobileApp/PHPCAS.php';
$casURL = 'https://login.gatech.edu/cas';
$ticket = $_GET['ticket'];

//If we have a CAS ticket
if(isset($ticket)){
	// echo "hi";
	//Validate ticket and fetch username
	$url = $casURL. '/serviceValidate?ticket='.$ticket.'&service='.$serviceURL;
	$res = file_get_contents($url);
	//var_dump($res);
	$parser = xml_parser_create();
	xml_parse_into_struct($parser, $res, $vals, $index);
	xml_parser_free($parser);
	//Assume the validation is successful
	// var_dump($vals);
	$username = $vals[2]['value'];
	// var_dump($username);
	$_SESSION['user'] = $username;
	echo $username;
}
else{
	//If there's no session ticket, it is assumed that an AJAX call is being performed.
	//If a user exists, else do nothing
	if(isset($_SESSION['user'])){
		$mysqli = new mysqli($DB_DSN, $DB_USER, $DB_PASS, $DB_NAME);
		//var_dump($mysqli); echo '<br><br>';
		$query = "SELECT id FROM users WHERE username='" . $_SESSION['user'] . "'";
		//$query = "SELECT id FROM users WHERE username='" . 'rliou7' . "'";
		//$query = "SELECT id FROM users";
		//echo $query . '<br><br>';	
		$res =  $mysqli->query($query);
		//var_dump($res); echo '<br><br>';
		//echo $res . '<br><br>';	
		$user_id = $res->fetch_array(MYSQLI_NUM);
		//echo $user_id . '<br><br>';	
		//var_dump($user_id); echo '<br><br>';
		//echo $user_id[0];
		$res->free();
		$JSON_array = array(
			"username" => $_SESSION['user'],
			"userid" => $user_id[0]
		);
		echo(json_encode($JSON_array));	
		die(); //Make sure the below webpage code doesn't corrupt the JSON data
	}
}
?>
<link rel="stylesheet" href="http://code.jquery.com/mobile/1.4.4/jquery.mobile-1.4.4.min.css" />
<script src="http://code.jquery.com/jquery-1.11.1.min.js"></script>
<script src="http://code.jquery.com/mobile/1.4.4/jquery.mobile-1.4.4.min.js"></script>
<script>
$.mobile.loading('show',{
	text: 'Logging you in',
	textVisible: true,
	theme: 'b',
	textonly: false
});
</script>
