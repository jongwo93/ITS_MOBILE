//Global variables
var alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
var FILES_PATH = "http://quid.gatech.edu/ITS_FILES/";
//var AJAXURL = 'ajax/ITS_ajax_mobile.php';
var AJAXURL = 'http://its.vip.gatech.edu/m/MobileApp/ajax/ITS_ajax_mobile.php';
// var AJAXURL = 'http://itsdev3.vip.gatech.edu/~dboatwright6/ajax/ITS_ajax_mobile.php';
var CASURL = 'http://its.vip.gatech.edu/m/MobileApp/PHPCAS.php';

function updateScreen(mode, opt, id)
{
	//$(".ui-btn-active").removeClass("ui-btn-active ui-disabled");
	$(".ui-btn-active").removeClass("ui-btn-active"); 
	$("#" + mode).addClass("ui-btn-active ui-state-persist");
	$.ajax({
		url: AJAXURL, 
		type: 'GET', 
		data: {id: id, action: mode, data: opt}, 
		dataType: 'json', 
		success: function(data){
			var text = '';
			console.log(data);
			switch(mode){
				case 'skip':
				case 'q':
				text += renderQuestion(data['content'], 'q');
				break;
				
				case 'm':
				text += renderModules(data['base_chapter']);
				break;
				
				case 'r':
				text += renderQuestion(data['content'], 'r');
				//console.log(data['review_info']);
				text += printReviewButtons(data['review_info']);
				break;
				
				case 's':
				text += renderScores(data['content']);
				break;
			}
			text = text.replace(/<latex>/gm, "\\(");
			text = text.replace(/<\/latex>/gm, "\\)");
			//console.log(text);
			//Getting rid of <pre class=ITS_Equation> tags
			//Soooo sketchy:
			if(text.match(/<pre class="?ITS_Equation"?>/gim)){
				text = text.replace(/<pre class="?ITS_Equation"?>/gim, "<br><br>");
				text = text.replace(/<\/pre>/gim, "<br><br>");
			}
			// //Getting rid of <pre class="MATLAB"> tags
			// //Soooo sketchy:
			// if(text.match(/<pre class="?ITS_Equation"?>/gim)){
			// 	text = text.replace(/<pre class="?ITS_Equation"?>/gim, "<br><br>");
			// 	text = text.replace(/<\/pre>/gim, "<br><br>");
			// }

			//console.log(text);
			$('#content').html(text).trigger('create');
			MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
		}
	});
}

function submit(qNum, qType){
	var values = new Array();
	switch (qType) {
		case 'm':
		$('.ui-block-a li input').each(function(index){
			values[index] = $(this).val();
		});
		break;
		
		case 'mc':
		values[0] = $('.ui-radio-on').attr('for');
		break;
		
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
			console.log(data);
			if(data.hasOwnProperty("Q-statistics")){
				if(qType == 'c'){
					//$("#submit1").val('Score: ' + data["score"] + ' | ' + data["Q-statistics"]);
					$("#submit1").val('Score: ' + data["score"]);
				}
				else{
					/*var str = 'Score: ' + data["score"] + ' || ' ;
					$.each(data["Q-statistics"], function(key, value){ 
						str += key + ' : ' + value + ' ';
					});*/

					$("#submit1").val('Score: ' + data["score"]);
				}
			}
			else{
				$('#submit1').val('Error: Already submitted!');
			}
			$("#submit1").button("refresh");
		}
	});
}

function renderScores(scoreData){
	var text = '';
	var numModules = scoreData.Module.length;
	//console.log("The num of modules:");
	//console.log(numModules);

	text += '<div id="score_center" class="ui-content">';
	text += '<table -stroke data-mode="columntoggle"  class="ui-responsive ui-shadow">';
	text += '<thead><tr><th>Module</th><th>Score</th><th>Percentage</th><th>Att/Avail</th></tr></thead><tbody>';
	for(var i = 0; i < numModules; i++){
		text += '<tr><th>'+scoreData.Module[i]+'</th><th>'+scoreData.Scores[i]+'</th><th>'+scoreData.Percentage[i]+'%</th><th>'+scoreData.Attem[i]+'/'+scoreData.Avail[i]+'</th></tr>';
	}
	text += '</tbody></table></div>';
	//console.log(text);
	return text;
}

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
	//$('#reviewButtons').html(text).trigger('create');
}

function renderModules(baseChapter){
	var i;
	var text = '<ul data-role="listview" data-inset="true" data-filter="false">';
	for(i = 1; i < baseChapter; ++i){
		text += '<li><a id="goToModule' + i + '" href="#" data-role="button" class="ui-disabled">Module ' + i + '</div></li>';
	}
	for(i = baseChapter; i <= 8; ++i){
		text += '<li><a id="goToModule' + i + '" href="#" data-role="button" onclick="updateScreen(\'q\', ' + i + ')">Module ' + i + '</div></li>';
	}
	text += '</ul>';
	return text;
	//$('#content').html(text).trigger('create');
}

function renderQuestion(Qdata, mode){
	var text = '';
	switch (Qdata["Q-type"]) {
		case 'm':
		text += printMatchingQuestion(Qdata, mode);
		break;
		
		case 'mc':
		text += printMultipleChoiceQuestion(Qdata, mode);
		break;
		
		case 'c':
		text += printCalculationQuestion(Qdata, mode);
		break;
	}
	if(mode == 'q'){
		//Submit button
		text += '<input type="button" value="Submit" id="submit1" data-role="button" onClick="submit(' + Qdata['Q-num'] + ', \'' + Qdata['Q-type'] + '\')">';
		//Skip button, needs to be grayed out when no more questions are remaining
		text += '<input type="button" value="Skip" id="skip" data-role="button" onClick="updateScreen(\'skip\', ' + Qdata['Q-num'] + ')">';
		//console.log(text);
	}
	return text;
}

function printMatchingReview(qUserScore, qUserAnswer){
	var answerText = '';
    answerText += '<div class="ui-grid-b"><div class="ui-block-a ui-bar-a">';
	answerText += 'Answered: ' + qUserAnswer + '</div>';
	answerText += '<div class="ui-block-b ui-bar-a">';
	answerText += 'Score: ' + qUserScore + '</div></div>';
	return answerText;
	//$('#review').html(answerText).trigger('create');
}

function printMultipleChoiceReview(qUserScore, qUserAnswer){
	var answerText = '';
    answerText += '<div class="ui-grid-b"><div class="ui-block-a ui-bar-a">';
	answerText += 'Answered: ' + qUserAnswer + '</div>';
	answerText += '<div class="ui-block-b ui-bar-a">';
	answerText += 'Score: ' + qUserScore + '</div></div>';
	return answerText;
	//$('#review').html(answerText).trigger('create');
}

function printCalculationReview(qUserScore, qUserAnswer){
	var answerText = '';
    answerText += '<div class="ui-grid-b"><div class="ui-block-a ui-bar-a">';
	answerText += 'Answered: ' + qUserAnswer + '</div>';
	answerText += '<div class="ui-block-b ui-bar-a">';
	answerText += 'Score: ' + qUserScore + '</div></div>';
	return answerText;
	//$('#review').html(answerText).trigger('create');	
}

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

	text += '<div><h3>' + qTitle + '</h3></div><br>';
	if(qImage){
		text += '<p><a href="#' + qImage + '" data-rel="popup" data-position-to="window" data-iconpos="notext" class="ui-content"><img border="0" src="' + qImagePath + '" class="ITS_image_link"></a></p>';
		text += '<div data-role="popup" id="' + qImage + '" class="ui-content" data-tolerance="60">';
		text += '<img src="' + qImagePath + '" class="ITS_image_popup">'; 
		text += '<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right">Close</a></div></div>';
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

function printMultipleChoiceQuestion(Qdata, mode){
	//Insert code here to print out the multiple choice question
	
	var text = '';
	var qTitle = Qdata["Q-title"];
	var qQuestion = Qdata["Q-question"];
	var qAnswers = Qdata["Q-answers-values"];
	var qAnswersIFlag = Qdata["Q-answers-values"]["IFlag"];
	//console.log(Qdata);
	var qNum = Qdata["Q-num"];
	//console.log(qNum);
	var numAnswers = Qdata["Q-answers"];
	var qUserScore = Qdata['user_score'];
	var qUserAnswer = Qdata['user_answer'];
	
	var qImage = Qdata["Q-image"];
	var qImagePath = FILES_PATH + qImage;
	
	text = text + '<div><h3>' + qTitle + '</h3></div>';
	if(qImage){
		text += '<p><a href="#' + qImage + '" data-rel="popup" data-position-to="window" data-iconpos="notext" class="ui-content"><img border="0" src="' + qImagePath + '" class="ITS_image_link"></a></p>';
		text += '<div data-role="popup" id="' + qImage + '" class="ui-content" data-tolerance="60">';
		text += '<img src="' + qImagePath + '" class="ITS_image_popup">'; 
		text += '<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right">Close</a></div></div>';
	}
	text += '<p>' + qQuestion + '</p>';
	//console.log(qQuestion);
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
	
	text += '<div><h3>' + qTitle + '</h3></div>'; 
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
		
		* */
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

$(document).ready(function(){
//$(".reviewPage").on("swiperight",function(){$.get('ajax/ITS_ajax_mobile.php', {mode: 'r', format: 'HTML', module: 1}, function(data){$('#content').html(data).trigger("create")});})
//$(".reviewPage").on("swipeleft",function(){$.get('ajax/ITS_ajax_mobile.php', {mode: 'r', format: 'HTML', module: -1}, function(data){$('#content').html(data).trigger("create")});})

});

// //Global variables
// var alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
// var FILES_PATH = "http://quid.gatech.edu/ITS_FILES/";
// //var AJAXURL = 'ajax/ITS_ajax_mobile.php'; //For the website
// var AJAXURL = 'http://itsdev3.vip.gatech.edu/~dboatwright6/ajax/ITS_ajax_mobile.php'; //For the mobile application

// // Legacy from Ricky...
// //var AJAXURL = 'http://itsdev3.vip.gatech.edu/~rliou7/MobileApp/ajax/ITS_ajax_mobile.php'; //For the mobile application

// function updateScreen(mode, opt, id)
// {
// 	//$(".ui-btn-active").removeClass("ui-btn-active ui-disabled");
// 	$(".ui-btn-active").removeClass("ui-btn-active"); 
// 	$("#" + mode).addClass("ui-btn-active ui-state-persist");
// 	$.ajax({
// 		url: AJAXURL, 
// 		type: 'GET', 
// 		data: {id: id, action: mode, data: opt}, 
// 		dataType: 'json', 
// 		success: function(data){
// 			var text = '';
// 			//console.log(data);
// 			switch(mode){
// 				case 'skip':
// 				case 'q':
// 				text += renderQuestion(data['content'], 'q');
// 				break;
				
// 				case 'm':
// 				text += renderModules(data['base_chapter']);
// 				break;
				
// 				case 'r':
// 				text += renderQuestion(data['content'], 'r');
// 				//console.log(data['review_info']);
// 				text += printReviewButtons(data['review_info']);
// 				break;
				
// 				case 's':
// 				text += renderScores(data['content']);
// 				break;
// 			}
// 			text = text.replace(/<latex>/gm, "\\(");
// 			text = text.replace(/<\/latex>/gm, "\\)");
// 			//console.log(text);
// 			//Soooo sketchy:
// 			if(text.match(/<pre class="?ITS_Equation"?>/gim)){
// 				text = text.replace(/<pre class="?ITS_Equation"?>/gim, "<br><br>");
// 				text = text.replace(/<\/pre>/gim, "<br><br>");
// 			}

// 			//console.log(text);
// 			$('#content').html(text).trigger('create');
// 			MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
// 		}
// 	});
// }

// function login(error){
// 	$("#s").addClass("ui-disabled");
// 	$("#m").addClass("ui-disabled");
// 	$("#q").addClass("ui-disabled");
// 	$("#r").addClass("ui-disabled");
// 	var text;
// 	text = "Enter your Georgia Tech Username. (NOT your GT ID)";
// 	if(error){
// 		text += '<br>INCORRECT username.  Try again';
// 	}
// 	text += '<textarea class="TXA_ANSWER" id="ITS_USERNAME" name="a"></textarea>';
// 	text += '<input type="button" value="Submit" id="submit1" data-role="button" onClick="submitLogin()">';
// 	$('#content').html(text).trigger('create');
// }

// function submitLogin(){
// 	var values = new Array();
// 	values[0] = $('#ITS_USERNAME').val();
// 	//console.log(values);
// 	if(values[0] == ""){
// 		//Can't log in with blank username
// 		login(1);
// 	}else{
// 		$.ajax({
// 			url: AJAXURL,
// 			type: 'GET', 
// 			data: {action: 'submitLogin', data: values[0]}, 
// 			dataType: 'json', 
// 			success: function(data){
// 				data = data['loggedIn'];
// 				//console.log("This is the data: "+data);
// 				if(data == "yes"){
// 					//Logged in correctly
// 					//console.log("I'm in the update screen");
// 					$("#s").removeClass("ui-disabled");
// 					$("#m").removeClass("ui-disabled");
// 					$("#q").removeClass("ui-disabled");
// 					$("#r").removeClass("ui-disabled");
// 					updateScreen('m');
// 				}else{
// 					//console.log("I'm in the incorrect login");
// 					//Incorrect login
// 					login(1);
// 					//$('#content').html(text).trigger('create');
// 				}
// 				//Data was submitted
// 				//$("#submit1").button("refresh");
// 			}
// 		});
// 	}
// }

// function logout(){
// 	login();
// }

// function submit(qNum, qType){
// 	var values = new Array();
// 	switch (qType) {
// 		case 'm':
// 		$('.ui-block-a li input').each(function(index){
// 			values[index] = $(this).val();
// 		});
// 		break;
		
// 		case 'mc':
// 		values[0] = $('.ui-radio-on').attr('for');
// 		break;
		
// 		case 'c':
// 		values[0] = $('#ITS_TA').val();
// 		break;
// 	}
// 	//console.log(qNum);
// 	//console.log(qType);
// 	//console.log(values);
	
// 	$.ajax({
// 		url: AJAXURL,
// 		type: 'GET', 
// 		data: {action: 'submit', data: qNum + '~' + qType + '~' + values}, 
// 		dataType: 'json', 
// 		success: function(data){
// 			data = data["Q-feedback"];
// 			console.log(data);
// 			if(data.hasOwnProperty("Q-statistics")){
// 				if(qType == 'c'){
// 					//$("#submit1").val('Score: ' + data["score"] + ' | ' + data["Q-statistics"]);
// 					$("#submit1").val('Score: ' + data["score"]);
// 				}
// 				else{
// 					/*var str = 'Score: ' + data["score"] + ' || ' ;
// 					$.each(data["Q-statistics"], function(key, value){ 
// 						str += key + ' : ' + value + ' ';
// 					});*/

// 					$("#submit1").val('Score: ' + data["score"]);
// 				}
// 			}
// 			else{
// 				$('#submit1').val('Error: Already submitted!');
// 			}
// 			$("#submit1").button("refresh");
// 		}
// 	});
// }

// function renderScores(scoreData){
// 	var text = '';
// 	var numModules = scoreData.Module.length;
// 	//console.log("The num of modules:");
// 	//console.log(numModules);

// 	text += '<div id="score_center" class="ui-content">';
// 	text += '<table -stroke data-mode="columntoggle"  class="ui-responsive ui-shadow">';
// 	text += '<thead><tr><th>Module</th><th>Score</th><th>Percentage</th><th>Att/Avail</th></tr></thead><tbody>';
// 	for(var i = 0; i < numModules; i++){
// 		text += '<tr><th>'+scoreData.Module[i]+'</th><th>'+scoreData.Scores[i]+'</th><th>'+scoreData.Percentage[i]+'%</th><th>'+scoreData.Attem[i]+'/'+scoreData.Avail[i]+'</th></tr>';
// 	}
// 	text += '</tbody></table></div>';
// 	//console.log(text);
// 	return text;
// }

// function printReviewButtons(review_info_array){
// 	var text = '';
// 	var review_index = review_info_array[0];
// 	var review_length = review_info_array[1];
	
// 	if(review_length == 1){
// 		text += '<a href="#" class="ui-disabled" data-role="button" onclick=updateScreen(\'r\',1)>Next</a>';
// 		text += '<a href="#" class="ui-disabled" data-role="button" onclick=updateScreen(\'r\',-1)>Previous</a>';	
// 	}
// 	else if(review_length == 0){
// 		text += 'No review questions!';
// 	}
// 	else{
// 		if(review_index == 0){
// 			text += '<a href="#" data-role="button" onclick=updateScreen(\'r\',1)>Next</a>';
// 			text += '<a href="#" class="ui-disabled" data-role="button" onclick=updateScreen(\'r\',-1)>Previous</a>';	
// 		}
// 		else if(review_index == (review_length - 1)){
// 			text += '<a href="#" class="ui-disabled" data-role="button" onclick=updateScreen(\'r\',1)>Next</a>';
// 			text += '<a href="#" data-role="button" onclick=updateScreen(\'r\',-1)>Previous</a>';
// 		}
// 		else{
// 			text += '<a href="#" data-role="button" onclick=updateScreen(\'r\',1)>Next</a>';
// 			text += '<a href="#" data-role="button" onclick=updateScreen(\'r\',-1)>Previous</a>';
// 		}
// 	}
// 	return text;
// 	//$('#reviewButtons').html(text).trigger('create');
// }

// function renderModules(baseChapter){
// 	var i;
// 	var text = '<ul data-role="listview" data-inset="true" data-filter="false">';
// 	for(i = 1; i < baseChapter; ++i){
// 		text += '<li><a id="goToModule' + i + '" href="#" data-role="button" class="ui-disabled">Module ' + i + '</div></li>';
// 	}
// 	for(i = baseChapter; i <= 8; ++i){
// 		text += '<li><a id="goToModule' + i + '" href="#" data-role="button" onclick="updateScreen(\'q\', ' + i + ')">Module ' + i + '</div></li>';
// 	}
// 	text += '</ul>';
// 	return text;
// 	//$('#content').html(text).trigger('create');
// }

// function renderQuestion(Qdata, mode){
// 	var text = '';
// 	switch (Qdata["Q-type"]) {
// 		case 'm':
// 		text += printMatchingQuestion(Qdata, mode);
// 		break;
		
// 		case 'mc':
// 		text += printMultipleChoiceQuestion(Qdata, mode);
// 		break;
		
// 		case 'c':
// 		text += printCalculationQuestion(Qdata, mode);
// 		break;
// 	}
// 	if(mode == 'q'){
// 		//Submit button
// 		text += '<input type="button" value="Submit" id="submit1" data-role="button" onClick="submit(' + Qdata['Q-num'] + ', \'' + Qdata['Q-type'] + '\')">';
// 		//Skip button, needs to be grayed out when no more questions are remaining
// 		text += '<input type="button" value="Skip" id="skip" data-role="button" onClick="updateScreen(\'skip\', ' + Qdata['Q-num'] + ')">';
// 		//console.log(text);
// 	}
// 	return text;
// }

// function printMatchingReview(qUserScore, qUserAnswer){
// 	var answerText = '';
//     answerText += '<div class="ui-grid-b"><div class="ui-block-a ui-bar-a">';
// 	answerText += 'Answered: ' + qUserAnswer + '</div>';
// 	answerText += '<div class="ui-block-b ui-bar-a">';
// 	answerText += 'Score: ' + qUserScore + '</div></div>';
// 	return answerText;
// 	//$('#review').html(answerText).trigger('create');
// }

// function printMultipleChoiceReview(qUserScore, qUserAnswer){
// 	var answerText = '';
//     answerText += '<div class="ui-grid-b"><div class="ui-block-a ui-bar-a">';
// 	answerText += 'Answered: ' + qUserAnswer + '</div>';
// 	answerText += '<div class="ui-block-b ui-bar-a">';
// 	answerText += 'Score: ' + qUserScore + '</div></div>';
// 	return answerText;
// 	//$('#review').html(answerText).trigger('create');
// }

// function printCalculationReview(qUserScore, qUserAnswer){
// 	var answerText = '';
//     answerText += '<div class="ui-grid-b"><div class="ui-block-a ui-bar-a">';
// 	answerText += 'Answered: ' + qUserAnswer + '</div>';
// 	answerText += '<div class="ui-block-b ui-bar-a">';
// 	answerText += 'Score: ' + qUserScore + '</div></div>';
// 	return answerText;
// 	//$('#review').html(answerText).trigger('create');	
// }

// function printCalculationQuestion(Qdata, mode){
// 	//Print out calculation question
	
// 	var text = '';
// 	var qTitle = Qdata["Q-title"];
// 	var qQuestion = Qdata["Q-question"];
// 	var qAnswers = Qdata["Q-answers"];
// 	var qImage = Qdata["Q-image"];
// 	var qNum = Qdata["Q-num"];
// 	var qImage = Qdata["Q-image"];
// 	var qUserScore = Qdata['user_score'];
// 	var qUserAnswer = Qdata['user_answer'];
	
// 	var qImagePath = FILES_PATH + qImage;

// 	text += '<div><h3>' + qTitle + '</h3></div><br>';
// 	if(qImage){
// 		text += '<p><a href="#' + qImage + '" data-rel="popup" data-position-to="window" data-iconpos="notext" class="ui-content"><img border="0" src="' + qImagePath + '" style="width:90%;max-height:auto"></a></p>';
// 		text += '<div data-role="popup" id="' + qImage + '" class="ui-content" data-tolerance="60">';
// 		text += '<img src="' + qImagePath + '" style="width:100%">'; 
// 		text += '<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right">Close</a></div></div>';
// 	}
// 	text += '<div class="ui-content">' + qQuestion + '</div>';
// 	if(mode == 'q'){
// 		text += '<textarea class="TXA_ANSWER" id="ITS_TA" name="a"></textarea>';
// 	}
// 	else{
// 		text += printCalculationReview(qUserScore, qUserAnswer);
// 	}
// 	return text;
// }

// function printMultipleChoiceQuestion(Qdata, mode){
// 	//Insert code here to do print out the multiple choice question
	
// 	var text = '';
// 	var qTitle = Qdata["Q-title"];
// 	var qQuestion = Qdata["Q-question"];
// 	var qAnswers = Qdata["Q-answers-values"];
// 	var qNum = Qdata["Q-num"];
// 	var numAnswers = Qdata["Q-answers"];
// 	var qUserScore = Qdata['user_score'];
// 	var qUserAnswer = Qdata['user_answer'];
	
// 	var qImage = Qdata["Q-image"];
// 	var qImagePath = FILES_PATH + qImage;
	
// 	text = text + '<div><h3>' + qTitle + '</h3></div>';
// 	if(qImage){
// 		text += '<p><a href="#' + qImage + '" data-rel="popup" data-position-to="window" data-iconpos="notext" class="ui-content"><img border="0" src="' + qImagePath + '" style="width:90%;max-height:auto"></a></p>';
// 		text += '<div data-role="popup" id="' + qImage + '" class="ui-content" data-tolerance="60">';
// 		text += '<img src="' + qImagePath + '" style="width:100%">'; 
// 		text += '<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right">Close</a></div></div>';
// 	}
// 	text += '<p>' + qQuestion + '</p>';
// 	text += '<div class="ITS_answer"><fieldset data-role="controlgroup">';
	
// 	var i;
// 	for(i = 0; i < numAnswers; i++){
// 		text += '<input type="radio" name="selector" value="' + alphabet[i]+ '" id="' + alphabet[i] + '" /><label for="' + alphabet[i] + '">' + qAnswers[i] + '</label>';
// 	}
	
// 	if(mode != 'q'){
// 		text += printMultipleChoiceReview(qUserScore, qUserAnswer);
// 	}
	
// 	text += '</div>';
// 	return text;
// }

// function printMatchingQuestion(Qdata, mode){
// 	var text = ''; 
// 	var qTitle = Qdata["Q-title"]; 
// 	var qQuestion = Qdata["Q-question"]; 
// 	var qAnswersL = Qdata["Q-answers-values"][0]; 
// 	var qAnswersR = Qdata["Q-answers-values"][1]; 
// 	var qAnswersRFlag = Qdata["Q-answers-values"][2];
// 	var qImage = Qdata["Q-image"]; //Not needed I believe... 
// 	var qNum = Qdata["Q-num"]; 
// 	var qUserScore = Qdata['user_score'];
// 	var qUserAnswer = Qdata['user_answer'];
	
// 	text += '<div><h3>' + qTitle + '</h3></div>'; 
// 	text += '<p>' + qQuestion + '</p>';

// 	qAnswersL = $.map(qAnswersL, function(n){
// 		if(n == 'NULL'){
// 			return null;
// 		}
// 		else{
// 			return n;
// 		}
// 	});
	
// 	qAnswersR = $.map(qAnswersR, function(n){
// 		if(n == 'NULL'){
// 			return null;
// 		}
// 		else{
// 			return n;
// 		}
// 	});

// 	var numL = Object.keys(qAnswersL).length;
// 	var numR = Object.keys(qAnswersR).length; 
// 	text += '<div class="ui-grid-a"><div class="ui-block-a"><ul data-role="listview" data-insert="true" class = "ui-listview ui-listview-inset ui-corner-all ui-shadow">'; 
// 	var i, k;
// 	for(i = 0; i < numL; i++){ 
// 			text += '<li style="white-space: normal !important;" class = "ui-li ui-li-static ui-btn-up-c">' + '<select id="input" data-role="none" name="input">';
	
// 			for(k = 0; k < numR; k++){ 
// 				text += '<option value=' + alphabet[k] + '>' + alphabet[k] + '</option>';
// 			}
// 			text+= '</select>' + qAnswersL[i] + '</li>';
// 	}
// 	text += '</ul></div>'; 
// 	text += '<div class="ui-block-b"><ul data-role="listview" data-insert="true" class = "ui-listview ui-listview-inset ui-corner-all ui-shadow">'; 
// 	if(typeof qAnswersRFlag === "undefined"){
// 		for(i = 0; i < numR ; i++){ 
// 			text = text + '<li class = "ui-li ui-li-static ui-btn-up-c">'+ ' ' + alphabet[i] + '. '+ qAnswersR[i] + '</li>'; 
// 		} 
// 	}
// 	else{
// 		for(i = 0; i < numR ; i++){ 
// 		qImagePath = FILES_PATH + qAnswersR[i];
// 		/*text += '<p><center><a href="#pop" data-rel="popup" data-position-to="window" data-transition="fade class="ui-link">';
// 		text += '<img class="popphoto" border="0" src="' + qImagePath + '" width=90%></a></center></p>';
// 		text2 += '<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" ';
// 		text2 += 'class="ui-btn-right ui-btn ui-shadow ui-btn-corner-all ui-btn-icon-notext ui-btn-up-a" data-corners="true"';
// 		text2 += ' data-shadow="true" data-iconshadow="true" data-wrapperels="span" title="Close"><span class="ui-btn-inner">';
// 		text2 += '<span class="ui-btn-text">Close</span><span class="ui-icon ui-icon-delete ui-icon-shadow">&nbsp;</span></span></a>';
// 		text2 += '<img class="popphoto" border="0" src="' + qImagePath + '" width=90%>';
// 		$('#pop').html(text2).trigger('create');
		
// 		* */
// 		text += '<li class = "ui-li ui-li-static ui-btn-up-c"> ' + alphabet[i] + '. ';
// 		text += '<a href="#' + qAnswersR[i] + '" data-rel="popup" data-position-to="window" data-role="button" data-iconpos="notext">';
// 		text += '<img src="' + qImagePath + '" style="width:90%"></a>';
// 		text += '<div data-role="popup" id="' + qAnswersR[i] + '" class="ui-content" data-tolerance="60">';
// 		//text += '<img src="' + qImagePath + '" style="max-width:90%;max-height:90%">'; 
// 		text += '<img src="' + qImagePath + '" style="width:100%">'; 
// 		text += '<a href="#" data-rel="back" data-role="button" data-theme="a" data-icon="delete" data-iconpos="notext" class="ui-btn-right">Close</a></div></li>';
// 		} 		
// 	}

// 	text += '</div></div>';
// 	if(mode != 'q'){
// 		text += printMatchingReview(qUserScore, qUserAnswer);
// 	} 
// 	return text;
// }    



// $(document).ready(function(){
// //$(".reviewPage").on("swiperight",function(){$.get('ajax/ITS_ajax_mobile.php', {mode: 'r', format: 'HTML', module: 1}, function(data){$('#content').html(data).trigger("create")});})
// //$(".reviewPage").on("swipeleft",function(){$.get('ajax/ITS_ajax_mobile.php', {mode: 'r', format: 'HTML', module: -1}, function(data){$('#content').html(data).trigger("create")});})

// });
