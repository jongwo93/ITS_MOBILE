//Global variables
var alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

//--- REMOTE ---
/*
var FILES_PATH = "http://quid.gatech.edu/ITS_FILES/";
var AJAXURL    = 'http://its.vip.gatech.edu/mobile/server/ajax/ITS_ajax_mobile.php';
var CASURL 	   = 'http://its.vip.gatech.edu/mobile/server/PHPCAS.php';
*/

//--- LOCAL ---
var FILES_PATH = "http://quid.gatech.edu/ITS_FILES/"; // path to images
var AJAXURL    = '../server/ajax/ITS_ajax_mobile.php';
var CASURL     = '../server/PHPCAS.php';
var base_chapter = 1; var max_chapter = 8;
/*--------------------------------------------------------------------*/
function login(){
	$("#s").addClass("ui-disabled");
	$("#m").addClass("ui-disabled");
	$("#q").addClass("ui-disabled");
	$("#r").addClass("ui-disabled");
	$("#t").addClass("ui-disabled"); // test
	$("#p").addClass("ui-disabled"); // performance (added by Nick)

	var text;
	text = '<input type="button" value="Click to log in!" id="submit1" data-role="button" onClick="submitLogin()">';
	$('#content').html(text).trigger('create');
}
/*--------------------------------------------------------------------*/
function submitLogin(){
	var ref = window.open('https://login.gatech.edu/cas/login?service='+CASURL, '_blank', 'location=no');
	ref.addEventListener('loadstop', function(event){
		var url = event.url;
		if(url.match(/^http:\/\/its.vip.gatech.edu\/*/)){
			//Username should be on the server
			$.ajax({
				url: CASURL,
				type: 'GET',
				data: {},
				crossDomain: true,
				dataType: 'json',
				success: function(data){
					//Successfully logged in
					$("#s").removeClass("ui-disabled");
					$("#m").removeClass("ui-disabled");
					$("#q").removeClass("ui-disabled");
					$("#r").removeClass("ui-disabled");
					$("#t").removeClass("ui-disabled");
					$("#p").removeClass("ui-disabled"); // performance
					updateScreen('m', '', data["userid"]);
					ref.close();
				},
				error: function(data){
					alert("Error obtaining username.");
				}
			});
		}
	});
}
/*--------------------------------------------------------------------*/
function logout(){
	var ref = window.open('https://login.gatech.edu/cas/logout', '_blank', 'location=no');
	ref.addEventListener('loadstop', function(event){
		ref.close();
	});
	login();
}
/*--------------------------------------------------------------------*/
function updateScreen(mode, opt, id){
	//$(".ui-btn-active").removeClass("ui-btn-active ui-disabled");
	$(".ui-btn-active").removeClass("ui-btn-active");
	$("#" + mode).addClass("ui-btn-active ui-state-persist");
	
	if(mode == 'q'){  // prevent from sending request many calls
		$("#q").attr("onclick","");
	}
	else{
		$("#q").attr("onclick","updateScreen('q')");
	}

	//console.log(mode);
	/** SEND TO SERVER ( see: /server/ajax/ITS_ajax_mobile.php ) */
	$.ajax({  //$ is jquery jquery ajax = functions
		url: AJAXURL, // where on the server you sent this request
		type: 'GET', //Get / Post
		data: {id: id, action: mode, data: opt},  // 
		dataType: 'json',  // send as json and return as json
		success: function(data){
			//console.log(data);
			//console.log("sweet sauce", mode);
			var text = '';
			
			//console.log(data);
			/** MODE BASED ON TAB */
			switch(mode){
				/*--------*/
				case 'skip':
				case 'q':
				text += renderQuestion(data['content'], 'q');
				if(opt && (mode == 'q')){
					//If there's is an option passed when coming to this q mode, it's going to be the module
					$("#center_header").html("ITS Mobile - A-"+opt).trigger('create');
				}
				break;
				/*--------*/
				case 'm':
				base_chapter = data['base_chapter'];
				//console.log('inside update screen');
				//console.log(base_chapter);
				max_chapter = data['max_chapter'];
				text += renderModules(base_chapter, max_chapter);
				break;
				/*--------*/
				case 'r':
				text += renderQuestion(data['content'], 'r');
				//console.log(data['review_info']);
				text += printReviewButtons(data['review_info']);
				break;
				/*--------*/
				case 's': // Scores
				text += renderScores(data['content'], max_chapter);
				break;
				/*--------*/
				case 't': // Test
		        var con = document.getElementById('content')
		        , xhr = new XMLHttpRequest();

		        xhr.onreadystatechange = function (e) {
			        if (xhr.readyState == 4 && xhr.status == 200) {
			          	con.innerHTML = xhr.responseText;
			        }
			    }
				xhr.open("GET", "../ITS_spring_2015/Main.php", true);
		        xhr.setRequestHeader('Content-type', 'text/html');
		        xhr.send();		 
				break;
				/*--------*/
				case 'up': // Performance table
				// Need for-loops here ... and get data from SQL
				colla = '<div data-role="collapsible"><h1>More ...</h1><p>Content here ...</p></div>';
				text += '<table class="table"><tr><td>1</td><td>'+colla+'</td></tr><tr><td>2</td><td>'+colla+'</td></tr></table>';
				//console.log(data);
				break;
				/*--------*/
				case 'p':  // Performance			
				text += renderPerformanceReview(data['content']);
				//text += renderPerformanceReview(data['performanceData']);
				//console.log(data)
				break;
			}

			text = text.replace(/<latex>/gm, "\\(");
			text = text.replace(/<\/latex>/gm, "\\)");
			
			// console.log(text);
			// Getting rid of <pre class=ITS_Equation> tags
			if(text.match(/<pre class="?ITS_Equation"?>/gim)){
				text = text.replace(/<pre class="?ITS_Equation"?>/gim, "<br><br>");
				text = text.replace(/<\/pre>/gim, "<br><br>");
			}
			// //Getting rid of <pre class="MATLAB"> tags
			// if(text.match(/<pre class="?ITS_Equation"?>/gim)){
			// 	text = text.replace(/<pre class="?ITS_Equation"?>/gim, "<br><br>");
			// 	text = text.replace(/<\/pre>/gim, "<br><br>");
			// }

			//Getting rid of hardcoded images in answer choices
			if(text.match(/ITS_pzplot/gim)){
				text = text.replace(/phpimg\//gim, ""+FILES_PATH+"phpimg/");
			}
			else if(text.match(/ITS_FILES\/phpimg/gim)){
				text = text.replace(/\/ITS_FILES\//gim, ""+FILES_PATH+"");
			}

			//If id is set, means new screen, so update the current module to base chapter
			if(!(typeof id === 'undefined')){
				$("#center_header").html("ITS Mobile - A-"+base_chapter).trigger('create');
			}

			//console.log(text);
			$('#content').html(text).trigger('create');
			MathJax.Hub.Queue(["Typeset",MathJax.Hub]);

			//Disable ability to select answer choices:
			if(mode == 'r'){
				$("[id=input]").each(function(index){
					$(this).prop('disabled',true);
				});
				$(".ui-radio").each(function(index){
					$(this).prop('disabled',true);
				});
			}
		}
	});
}
/*--------------------------------------------------------------------*/
//Purpose: GENERATE TABLE OF PERFORMANCE REVIEW ON MOBILE APP (NICK)
function renderPerformanceReview(pData) {
	var text = '';
	if(pData == null) {
		return text;
	}
	//save data returned from jquery into arrays for utilization
	var qName = pData['Question Name'];
	var qId = pData['Question id'];
	var tagName = pData['Tag Name'];
	var tagId = pData['Tag id'];
	var score = pData['Score']; 	
	var assign = pData['assignment'];
	
	var retVal = {};
	var retArr = [];

	var rowNum = pData.assignment.length;

	//Initialize retArr with each assignments
	//Initialize retVal with each retArr as object.
	//ex) if there are assignment 1, 8 in retArr,
	//retVal will be initialized with 1 = new object, 8 = new object
	for (var i = 0; i < rowNum; i++) {  
		if (i == 0) {
			retArr.push(assign[0]);
			retVal[assign[0].toString()] = {};
		} else {
			if(retArr[retArr.length - 1] != assign[i]) {
				retArr.push(assign[i]);
				retVal[assign[i].toString()] = {};
			}
		}
	}

	//For each assignment object in retVal, Questions will be initialized as object
	//Then, tags, score, question id will be initialized in each Question object as variable.
	j = 0;
	for(var i = 0; i < retArr.length; i++) {
		var path = retArr[i].toString();
		while (j != rowNum && assign[j] == retArr[i]) {
			qPath = qName[j].toString();
			if(retVal[path][qPath] == undefined) {
				retVal[path][qPath] = {};
			}
			retVal[path][qPath]['TEST'] = j;
			retVal[path][qPath]['Qid'] = [];
			retVal[path][qPath]['Qid'].push(qId[j]);
			if(retVal[path][qPath]['TagName'] == undefined) {
				retVal[path][qPath]['TagName'] = [];
			}
				retVal[path][qPath]['TagName'].push(tagName[j]);
			
			retVal[path][qPath]['Score'] = [];
			retVal[path][qPath]['Score'].push(score[j]);
			j++;
		}
	}
	//console.log(retVal['1']);
	//console.log(Object.keys(retVal['1']).length);
	for( var key in retVal['1']) {
		console.log(key);
		console.log(retVal['1'][key.toString()]['Score']);
	}
	//This is for test, JSON.stringify will print out stringified objects on screen.
	// return JSON.stringify(retVal);

	// Example of making a collapsable table within a table
	//colla = '<div data-role="collapsible"><h1>More ...</h1><p>Content here ...</p></div>';
	//text+= '<table class="table"><tr><td>1</td><td>'+colla+'</td></tr><tr><td>2</td><td>'+colla+'</td></tr></table>';

/////////////Jquery Mobile version 1.0////////////
	// for(var i = 0; i < retArr.length; i++) {
	// 	table = '<div data-role = "collapsible"><h1>Review</h1><p><input type = "text" id = "myInput" onkeyup = "myFunction()" placeholder = "Search for Names..">'; 
	// 	table += '<table id = "ptable"><tr><th>Question</th><th>ID</th><th>Tag</th><th>Score</th></tr>';

	// 	path = retArr[i].toString();
	// 	for (var key in retVal[path]) {
	// 		qPath = key;
	// 		table += '<tr class = "header"><th>' + key + '</th><th>' + retVal[path][qPath]['Qid'] + '</th><th>' + retVal[path][qPath]['TagName'] + '</th><th>' + retVal[path][qPath]['Score'] + '</th></tr>';
	// 	}

	// 	table += '</table></p></div>';
	// 	text+= '<table class="table"><tr><td>Assignment ' + retArr[i] + '</td><td>'+table+'</td></tr></table>';

	// }

/////////////Jquery Mobile version 1.1////////////
//Listview ? for few functionality ?
//Filtering not working except for first talbe(assignment 1)
	text += '<div><table class="table"><tbody>'
	for(var i = 0; i < retArr.length; i++) {
		path = retArr[i].toString();

		table = '<div  class = "ui-content"  data-role = "collapsible"><form><input id="filterTable-input" data-type="search" placeholder="Search For Question...">';
		table += '</form><h1>Assignment ' + retArr[i] + ' (' + Object.keys(retVal[path]).length +' items..)</h1><p>'; 
		table += '<table data-role = "table" data-mode = "columntoggle" class = "ui-responsive ui-shadow"';
		table += ' id="A-tb-'+i+'" data-filter = "true" data-input = "#filterTable-input"><thead><tr><th data-priority =';
		table += ' "3">Question</th><th data-priority = "4">ID</th><th data-priority = "2">Tag</th><th data-priority = "1">Score</th></tr></thead><tbody>';
	
		for (var key in retVal[path]) {
			qPath = key;
			table += '<tr><td>' + key + '</td><td>' + retVal[path][qPath]['Qid'] + '</td><td>';
			table += retVal[path][qPath]['TagName'] + '</td><td>' + retVal[path][qPath]['Score'] + '</td></tr>';	
		}
		table += '</tbody></table></p></div>';
		text+= '<tr><td>' + table + '</td></tr>';

	}
	text += '</tbody></table></div>';
	return text;
}

function submit(qNum, qType){
	// console.log('submitting');
	var values = new Array();
	switch (qType) {
		/*--------*/
		case 'm':
		// console.log("it's matching");
		$("[id=input]").each(function(index){
			values[index] = $(this).val();
			// console.log(values);
		});
		break;
		/*--------*/
		case 'mc':
		values[0] = $('.ui-radio-on').attr('for');
		break;
		/*--------*/
		case 'c':
		values[0] = $('#ITS_TA').val();
		break;
	}
	//console.log(qNum);
	//console.log(qType);
	//console.log(values);

	$.ajax({
		url: AJAXURL,
		type: 'GET',
		data: {action: 'submit', data: qNum + '~' + qType + '~' + values},
		dataType: 'json',
		success: function(data){
			data = data["Q-feedback"];
			// console.log(data);
			if(data.hasOwnProperty("Q-statistics")){
				if(qType == 'c'){
					//$("#submit1").val('Score: ' + data["score"] + ' | ' + data["Q-statistics"]);
					$("#submit1").val('Score: ' + data["score"]);
				}
				else{
					//var str = 'Score: ' + data["score"] + ' || ' ;
					//$.each(data["Q-statistics"], function(key, value){
					//	str += key + ' : ' + value + ' ';
					//});
					$("#submit1").val('Score: ' + data["score"]);
				}
			}
			else{
				$('#submit1').val('Error: Already submitted!');
			}
				$('#submit1').attr('onclick',"");

			$("#submit1").button("refresh");
			//Change skip button into next button
			$("#skip").val('Next');
			$('#skip').unbind('click');
			$('#skip').attr('onClick', "updateScreen('q')");
			$("#skip").button("refresh");
		}
	});
}
/*--------------------------------------------------------------------*/
function renderScores(scoreData,numModules){
	var text = '';
	// var numModules = scoreData.Module.length;
	// console.log("The num of modules:");
	// console.log(numModules);

	text += '<div id="score_center" class="ui-content">';
	text += '<table -stroke data-mode="columntoggle"  class="ui-responsive ui-shadow">';
	text += '<thead><tr><th>Assignment</th><th>Score</th><th>Percentage</th><th>Att/Avail</th></tr></thead><tbody>';
	for(var i = 0; i < numModules; i++){
		text += '<tr><th>'+scoreData.Module[i]+'</th><th>'+scoreData.Scores[i]+'</th><th>'+scoreData.Percentage[i]+'%</th><th>'+scoreData.Attem[i]+'/'+scoreData.Avail[i]+'</th></tr>';
	}
	text += '</tbody></table></div>';
	//console.log(text);
	return text;
}
/*--------------------------------------------------------------------*/
function printReviewButtons(review_info_array){
	var text = '';
	var review_index = review_info_array[0];
	var review_length = review_info_array[1];

	if(review_length == 1){
		text += '<a href="#" class="ui-disabled" data-role="button" onclick=updateScreen(\'r\',1)>Next</a>';
		text += '<a href="#" class="ui-disabled" data-role="button" onclick=updateScreen(\'r\',-1)>Previous</a>';
	}
	else if(review_length == 0){
		text += 'No review questions!';
	}
	else{
		if(review_index == 0){
			text += '<a href="#" data-role="button" onclick=updateScreen(\'r\',1)>Next</a>';
			text += '<a href="#" class="ui-disabled" data-role="button" onclick=updateScreen(\'r\',-1)>Previous</a>';
		}
		else if(review_index == (review_length - 1)){
			text += '<a href="#" class="ui-disabled" data-role="button" onclick=updateScreen(\'r\',1)>Next</a>';
			text += '<a href="#" data-role="button" onclick=updateScreen(\'r\',-1)>Previous</a>';
		}
		else{
			text += '<a href="#" data-role="button" onclick=updateScreen(\'r\',1)>Next</a>';
			text += '<a href="#" data-role="button" onclick=updateScreen(\'r\',-1)>Previous</a>';
		}
	}
	return text;
}
/*--------------------------------------------------------------------*/
function renderModules(baseChapter,maxChapter){
	var i;
	var text = '<ul data-role="listview" data-inset="true" data-filter="false">';
	for(i = 1; i < baseChapter; ++i){
		text += '<li><a id="goToModule' + i + '" href="#" data-role="button" class="ui-disabled">A-' + i + '</div></li>';
	}
	for(i = baseChapter; i <= maxChapter; ++i){
		text += '<li><a id="goToModule' + i + '" href="#" data-role="button" onclick="updateScreen(\'q\', ' + i + ')">A- ' + i + '</div></li>';
	}
	text += '</ul>';
	return text;
	//$('#content').html(text).trigger('create');
}
/*--------------------------------------------------------------------*/
function renderQuestion(Qdata, mode){
	var text = '';
	switch (Qdata["Q-type"]) {
		/*--------*/
		case 'm':
		text += printMatchingQuestion(Qdata, mode);
		break;
		/*--------*/
		case 'mc':
		text += printMultipleChoiceQuestion(Qdata, mode);
		break;
		/*--------*/
		case 'c':
		text += printCalculationQuestion(Qdata, mode);
		break;
	}
	if(mode == 'q'){
		if(Qdata["error"]){
			text += "No more questions in this assignment.";
		}
		else{
			//Submit button
			text += '<input type="button" value="Submit" id="submit1" data-role="button" onClick="submit(' + Qdata['Q-num'] + ', \'' + Qdata['Q-type'] + '\')">';
			//Skip button, needs to be grayed out when no more questions are remaining
			text += '<input type="button" value="Skip" id="skip" data-role="button" onClick="updateScreen(\'skip\', ' + Qdata['Q-num'] + ')">';
			//console.log(text);
		}
	}
	return text;
}
/*--------------------------------------------------------------------*/
function printMatchingReview(qUserScore, qUserAnswer){
	var answerText = '';
	answerText += '<div class="ui-grid-b"><div class="ui-block-a ui-bar-a">';
	answerText += 'Answered: ' + qUserAnswer + '</div>';
	answerText += '<div class="ui-block-b ui-bar-a">';
	answerText += 'Score: ' + qUserScore + '</div></div>';
	return answerText;
	//$('#review').html(answerText).trigger('create');
}
/*--------------------------------------------------------------------*/
function printMultipleChoiceReview(qUserScore, qUserAnswer){
	var answerText = '';
	answerText += '<div class="ui-grid-b"><div class="ui-block-a ui-bar-a">';
	answerText += 'Answered: ' + qUserAnswer + '</div>';
	answerText += '<div class="ui-block-b ui-bar-a">';
	answerText += 'Score: ' + qUserScore + '</div></div>';
	return answerText;
	//$('#review').html(answerText).trigger('create');
}
/*--------------------------------------------------------------------*/
function printCalculationReview(qUserScore, qUserAnswer){
	var answerText = '';
	answerText += '<div class="ui-grid-b"><div class="ui-block-a ui-bar-a">';
	answerText += 'Answered: ' + qUserAnswer + '</div>';
	answerText += '<div class="ui-block-b ui-bar-a">';
	answerText += 'Score: ' + qUserScore + '</div></div>';
	return answerText;
	//$('#review').html(answerText).trigger('create');
}
/*--------------------------------------------------------------------*/
function printCalculationQuestion(Qdata, mode){
	//Print out calculation question

	var text = '';
	var qTitle = Qdata["Q-title"];
	var qQuestion = Qdata["Q-question"];
	var qAnswers = Qdata["Q-answers"];
	var qImage = Qdata["Q-image"];
	var qNum = Qdata["Q-num"];
	var qImage = Qdata["Q-image"];
	var qUserScore = Qdata['user_score'];
	var qUserAnswer = Qdata['user_answer'];

	var qImagePath = FILES_PATH + qImage;

	// text += '<div><h3>' + qTitle + '</h3></div><br>';
	if(qImage){
		//text += '<p><a href="#' + qImage + '" data-rel="popup" data-position-to="window" data-iconpos="notext" class="ui-content"><img border="0" src="' + qImagePath + '" class="ITS_image_link"></a></p>';
		//text += '<div data-role="popup" id="' + qImage + '" class="ui-content" data-tolerance="60">';
		text += '<img src="' + qImagePath + '" class="ITS_image_popup">';
		//text += '<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right">Close</a></div></div>';
	}
	text += '<div class="ui-content">' + qQuestion + '</div>';
	if(mode == 'q'){
		text += '<textarea class="TXA_ANSWER" id="ITS_TA" name="a"></textarea>';
	}
	else{
		text += printCalculationReview(qUserScore, qUserAnswer);
	}
	return text;
}
/*--------------------------------------------------------------------*/
function printMultipleChoiceQuestion(Qdata, mode){
	//Insert code here to print out the multiple choice question

	var text = '';
	var qTitle = Qdata["Q-title"];
	var qQuestion = Qdata["Q-question"];
	var qAnswers = Qdata["Q-answers-values"];
	var qAnswersIFlag = Qdata["Q-answers-values"]["IFlag"];
	var qNum = Qdata["Q-num"];
	var numAnswers = Qdata["Q-answers"];
	var qUserScore = Qdata['user_score'];
	var qUserAnswer = Qdata['user_answer'];

	var qImage = Qdata["Q-image"];
	var qImagePath = FILES_PATH + qImage;

	// text = text + '<div><h3>' + qTitle + '</h3></div>';
	if(qImage){
		//text += '<p><a href="#' + qImage + '" data-rel="popup" data-position-to="window" data-iconpos="notext" class="ui-content"><img border="0" src="' + qImagePath + '" class="ITS_image_link"></a></p>';
		//text += '<div data-role="popup" id="' + qImage + '" class="ui-content" data-tolerance="60">';

		text += '<img src="' + qImagePath + '" class="ITS_image_popup">';
		//text += '<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right">Close</a></div></div>';
	}
	text += '<p>' + qQuestion + '</p>';
	text += '<div class="ITS_answer"><fieldset data-role="controlgroup">';

	var i;
	if(typeof qAnswersIFlag === "undefined"){
		//No images as answers
		for(i = 0; i < numAnswers; i++){
			text += '<input type="radio" name="selector" value="' + alphabet[i]+ '" id="' + alphabet[i] + '" /><label for="' + alphabet[i] + '">' + qAnswers[i] + '</label>';
		//console.log(qAnswers[i]);
	}
}
else{
	for(i = 0; i < numAnswers; i++){
		qImagePath = FILES_PATH + qAnswers[0][i];
		text += '<input type="radio" name="selector" value="' + alphabet[i]+ '" id="' + alphabet[i] + '" /><img src="' + qImagePath + '" class="ITS_image_link">';
	}
}

if(mode != 'q'){
	text += printMultipleChoiceReview(qUserScore, qUserAnswer);
}

text += '</div>';
return text;
}
/*--------------------------------------------------------------------*/
function printMatchingQuestion(Qdata, mode){
	var text = '';
	var qTitle = Qdata["Q-title"];
	var qQuestion = Qdata["Q-question"];
	var qAnswersL = Qdata["Q-answers-values"][0];
	var qAnswersR = Qdata["Q-answers-values"][1];
	var qAnswersRFlag = Qdata["Q-answers-values"][2];
	var qImage = Qdata["Q-image"]; //Not needed I believe...
	var qNum = Qdata["Q-num"];
	var qUserScore = Qdata['user_score'];
	var qUserAnswer = Qdata['user_answer'];

	// text += '<div><h3>' + qTitle + '</h3></div>';
	text += '<p>' + qQuestion + '</p>';

	qAnswersL = $.map(qAnswersL, function(n){
		if(n == 'NULL'){
			return null;
		}
		else{
			return n;
		}
	});

	qAnswersR = $.map(qAnswersR, function(n){
		if(n == 'NULL'){
			return null;
		}
		else{
			return n;
		}
	});

	var numL = Object.keys(qAnswersL).length;
	var numR = Object.keys(qAnswersR).length;
	text += '<div class="ui-grid-a"><div class="ui-block-a"><ul data-role="listview" data-insert="true" class = "ui-listview ui-listview-inset ui-corner-all ui-shadow">';
	var i, k;
	for(i = 0; i < numL; i++){
		text += '<li style="white-space: normal !important;" class = "ui-li ui-li-static ui-btn-up-c">' + '<select id="input" data-role="none" name="input">';

		for(k = 0; k < numR; k++){
			text += '<option value=' + alphabet[k] + '>' + alphabet[k] + '</option>';
		}
		text+= '</select>' + qAnswersL[i] + '</li>';
	}
	text += '</ul></div>';
	text += '<div class="ui-block-b"><ul data-role="listview" data-insert="true" class = "ui-listview ui-listview-inset ui-corner-all ui-shadow">';
	if(typeof qAnswersRFlag === "undefined"){
		for(i = 0; i < numR ; i++){
			text = text + '<li class = "ui-li ui-li-static ui-btn-up-c">'+ ' ' + alphabet[i] + '. '+ qAnswersR[i] + '</li>';
		}
	}
	else{
		for(i = 0; i < numR ; i++){
			qImagePath = FILES_PATH + qAnswersR[i];
		/*text += '<p><center><a href="#pop" data-rel="popup" data-position-to="window" data-transition="fade class="ui-link">';
		text += '<img class="popphoto" border="0" src="' + qImagePath + '" width=90%></a></center></p>';
		text2 += '<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" ';
		text2 += 'class="ui-btn-right ui-btn ui-shadow ui-btn-corner-all ui-btn-icon-notext ui-btn-up-a" data-corners="true"';
		text2 += ' data-shadow="true" data-iconshadow="true" data-wrapperels="span" title="Close"><span class="ui-btn-inner">';
		text2 += '<span class="ui-btn-text">Close</span><span class="ui-icon ui-icon-delete ui-icon-shadow">&nbsp;</span></span></a>';
		text2 += '<img class="popphoto" border="0" src="' + qImagePath + '" width=90%>';
		$('#pop').html(text2).trigger('create');
		*/
		text += '<li class = "ui-li ui-li-static ui-btn-up-c"> ' + alphabet[i] + '. ';
		text += '<a href="#' + qAnswersR[i] + '" data-rel="popup" data-position-to="window" data-role="button" data-iconpos="notext">';
		text += '<img src="' + qImagePath + '" class="ITS_image_link"></a>';
		text += '<div data-role="popup" id="' + qAnswersR[i] + '" class="ui-content" data-tolerance="60">';
		//text += '<img src="' + qImagePath + '" style="max-width:90%;max-height:90%">';
		text += '<img src="' + qImagePath + '" class="ITS_image_popup">';
		text += '<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right">Close</a></div></li>';
	}
}

text += '</div></div>';
if(mode != 'q'){
	text += printMatchingReview(qUserScore, qUserAnswer);
}
return text;
}
/*--------------------------------------------------------------------*/
$(document).ready(function(){
//$(".reviewPage").on("swiperight",function(){$.get('ajax/ITS_ajax_mobile.php', {mode: 'r', format: 'HTML', module: 1}, function(data){$('#content').html(data).trigger("create")});})
//$(".reviewPage").on("swipeleft",function(){$.get('ajax/ITS_ajax_mobile.php', {mode: 'r', format: 'HTML', module: -1}, function(data){$('#content').html(data).trigger("create")});})
	$(document).on('click', '.row', function() {
		console.log("texting click");
	});
});
/*--------------------------------------------------------------------*/
