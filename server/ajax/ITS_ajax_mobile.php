<?php
include('../classes/ITS_question_mobile.php');
include('../classes/ITS_screen_mobile.php');
include('../config_mobile.php');
//include('../PHPCAS.php');

session_start(); //DO NOT PUT BEFORE INCLUDES DUE TO THE SERIALIZATION THAT SESSION_START AUTOMATICALLY PERFORMS

// !@cond TEST
// $t = microtime(true);
// $id = $_GET['id'];
$id = 2350;
// $JSON_array['test'] = $id;
// echo(json_encode($JSON_array));

if(isset($id)){						// If client wants to start new user ITS session
	$mysqli = new mysqli($DB_DSN, $DB_USER, $DB_PASS, $DB_NAME);
	$screen = new ITS_screen_mobile($id, $TERM, $MIN_CHAPTER_NUM, $TB_NAME, $TB_USER, $mysqli);
	$_SESSION['screen'] = $screen;
}
if(!isset($_SESSION['screen'])){
	$JSON_array['error'] = 1;
}
else{
	$action = $_GET['action'];
	$data   = $_GET['data'];
	// to test where it is not working in the code.
	// $JSON_array['test'] = 'test';
	// echo(json_encode($JSON_array));
	
	$screen = $_SESSION['screen'];
	$mysqli = new mysqli($DB_DSN, $DB_USER, $DB_PASS, $DB_NAME); // Update database connection
	$screen->mysqli = $mysqli;

	//Pre-screen rendering
	if($action == 'q'){
		if(isset($data)){
			$screen->chapter = $data;
			$screen->set_IDR(0);
		}	
	}
	else if($action == 'r' && isset($data)){
			$screen->set_IDR($data);
	}
	else if($action == 'm'){
		$JSON_array['base_chapter'] = $MIN_CHAPTER_NUM;
		$JSON_array['max_chapter'] = $MAX_CHAPTER_NUM;
	} 
	else if($action == 'p'){
		//$mysqli->close();
		//$JSON_array['test'] = $data;
	}
	
	//Screen manipulation
	if($action == 'submit'){
		$data = explode('~', $data);
		$qNum = intval($data[0]);
		$qType = $data[1];
		$answered = $data[2];
		$JSON_array['Q-feedback'] = $screen->record_QUESTION($qNum, $qType, $answered, 1);
	}
	else{
		if($action == 'skip'){
			$qNum = intval($data);
			$screen->record_QUESTION($qNum, '', '', 0);
			$JSON_array['content'] = $screen->get_SCREEN('q');
		}
		else{
			$JSON_array['content'] = $screen->get_SCREEN($action);
		}
	}
	//Post-screen rendering
	if($action == 'r'){
		$JSON_array['review_info'] = array($screen->review_index, $screen->review_length);
	}
}
//echo (microtime(true) - $t);
echo(json_encode($JSON_array));
//!@endcond 
?>
