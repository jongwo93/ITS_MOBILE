<?php 
/*
Author: Sen Lin
This scripts is the view of the MVC model;
it diplays some simple html elements and creates unique DOM id for other scripts to refer.

*/
include 'Model.php';
use \Model\Model as Model;
Model::writeToJson(1243);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ITs Tree</title>
  <!-- css files -->
  <link href="bootstrap/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="d3/base.css">
  <link rel="stylesheet" href="style.css">
   <!-- js files -->

</head>
<body>
	<div class="container">
		<h2>ITS Tree</h2>
		<div class="first-row">
			<div class="col-md-3" id = "tree">
				<div id = "score">
					<p>sub-score</p>
				</div> <br><br>
				<div id = "totalScore">
					<p>total score</p>
				</div> <br>
				<div class="col-md-3" id = "tooltip">
				</div> <br>
				<br>
			</div>
			<div class="btn-group btn-group-md" id = "buttonsGroup">
				<!-- <button type="button" class="btn btn-default" id="next-branch">Next Branch</button> -->
				<button type="button" id="pre-question">Previous Question</button>
				<button type="button" id="next-question">Next Question</button>
				<br><br>
				Base Name  <select id = "menuSelectB"></select>
				Questions Name  <select id = "menuSelectQ"></select>
			</div>
			<br><br>
			<div class="mode">
				<input type="radio" name="mode" id="manual" checked="true"> &nbsp Manual 
				<br><br>
				<input type="radio" name="mode" id="auto"> &nbsp Auto
			</div>
		</div>
		<br>
		<div id = "ProgressBars" style = "display: none;">
			<p>SubProgress</P>
			<progress max="6.25" id = "subProgress"></progress>
			<p>Total Progress</P>
			<progress max="16"  id = "totalProgress"></progress>
		</div>
	</div> 

	<div class="question-answer">
		<div class="question-area container">
			<div class="col-xs-2 question-label-column">
				<p class="question-label">Question: </p>
				<div id = "image-content"></div>
			</div>
			<div id = "question-content"></div>
			<br>
			<div class="col-xs-2 answer-label-column">
				<p class="answer-label">Answer: </p>
			</div>
			<div id = "answer-content"></div>
		</div>
		<button class="btn btn-success" id="submit">Submit</button>
	</div>
	
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
<script src="//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>
<!-- <link rel="stylesheet" type="text/css" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css"> -->
	<script src="d3/d3.min.js"></script>
	<script src="script.js"></script>
</body>
</html>

