<?php
/*!
 * @file ITS_ajax_mobile.php
 * @brief ITS mobile AJAX code for interfacing between the client and server side.
 * @file ITS_ajax_mobile.php
 * @author Ricky Liou (rliou92@gmail.com)
 * @date April 16, 2014
 * 
 * @param[in] 'id' new user id
 * @param[in] 'action' ITS screen action ('q', 'r', 's', 'm', 'submit', 'skip')
 * @param[in] 'data' general purpose data dependent on the action
 * @param[out] $JSON_array JSON formatted array containing the output data
 * 
 * @par Parameter Detailed Descriptions
 * - @b 'data' \n
 * The input data is dependent on the 'action' parameter. If 'action' is:
 * > <b> 'q': </b>
 * > 
 * > > If set, changes current chapter number.
 * > 
 * > <b> 'r': </b>
 * >
 * > > If set, review index is incremented if positive, decremented if negative, or reset if 0. If index is out-of-bounds, it will not change. 
 * >
 * > <b> 's': </b>
 * >
 * > > N/A
 * >
 * > <b> 'm': </b>
 * >
 * > > N/A
 * >
 * > <b> 'submit': </b>
 * >
 * > Question id, question type, and user answer delimited by '~' 
 * >
 * > > Question id: question id number
 * >
 * > > Question type: 'c', 'm', 'mc'
 * >
 * > > User answer: array of user answers dependent on question type:
 * >
 * >>	> 'c': Number
 * >>
 * >>	> 'mc': Single uppercase letter
 * >>
 * >>	> 'm': Comma separated uppercase letters in order with respect to the left hand side
 * > 
 * > <b> 'skip': </b>
 * >
 * > Question id of question skipped
 * >
 * - @b '$JSON_array' \n
 * JSON array fields: 
 * > <b> 'ridx_end': </b>
 * >
 * > Returned if the review index is manipulated. 1 = reached max index value. -1 = reached min index value.
 * >
 * > <b> 'Q-feedback': </b>
 * >
 * > Returned after a question is submitted. Content depends on question type:
 * >
 * > > 'c':
 * >> 
 * >>  > array[0] = answer, array[1] = tolerance limits
 * >>
 * > > 'mc': 
 * >>
 * >> > Array of percentages of all current term student answers for each answer in order
 * >>
 * > > 'm':
 * >>
 * >> > Array of scores for each left hand side value in order
 * >>
 * > 
 * > <b> 'content': </b>
 * > 
 * > ITS screen content dependent on action:
 * > > 's':
 * >>
 * >> > <b> "Module": </b>
 * >> > Module number
 * >>
 * >> > <b> "Scores": </b>
 * >> > Points earned in respective module
 * >>
 * >> > <b> "Percentage": </b>
 * >> > Earned points / available points
 * >>
 * >> > <b> "Attem": </b>
 * >> > Number of attempted questions
 * >>
 * >> > <b> "Avail": </b> 
 * >> > Number of available questions
 * >>
 * > > 'q':
 * >>
 * >> > <b> "Q-type": </b>
 * >> > mc,c,m 
 * >>
 * >> > <b> "Q-title": </b> 
 * >> > Title string
 * >>
 * >> > <b> "Q-question": </b> 
 * >> > Question string 
 * >>
 * >> > <b> "Q-answers": </b>
 * >> > Number of total answers
 * >>
 * >> > <b> "Q-answers-values": </b> 
 * >> > Array of answer values 
 * >>
 * >> > <b> "Q-image": </b> 
 * >> > Image id number
 * >>
 * > > 'r':
 * >>
 * >> > <b> "Q-type": </b>
 * >> > m,mc,c
 * >> 
 * >> > <b> "Q-title": </b> 
 * >> > Title string
 * >>
 * >> > <b> "Q-question": </b> 
 * >> > Question string
 * >>
 * >> > <b> "Q-answers": </b> 
 * >> > Number of total answers
 * >>
 * >> > <b> "Q-answers-values": </b> 
 * >> > Array of answer values 
 * >>
 * >> > <b> "Q-image": </b> 
 * >> > Image id number
 * >>
 * >> > <b> "user_answer": </b> 
 * >> > User's submitted answer
 * >>
 * >> > <b> "user_score": </b> 
 * >> > User's score
 * >>
 * > > 'm':
 * >> > Current oldest active chapter
 * . 
 *
 * @note For "Q-answers-values", the data depends on the question type:
 * @note c: N/A
 * @note mc: array{'answer1' => ..., 'answer2' => ..., ...}
 * @note m [For text right hand side fields]: array{array{'L_fields1' => ..., 'L_fields2' => ..., ...}, array{'R_field1' => ...,'R_field2' => ..., ...}}
 * @note m [For image right hand side fields]: array{array{'L_fields1' => ..., 'L_fields2' => ..., ...}, array{'Rimage1' => ..., 'Rimage2' => ..., ...}, 1}
 *
 * >
 *
 * @note For matching Q-statistics NULL is essentially a zero, means student picked a answer choice that has no corresponding answer.
 *
 * The client makes AJAX requests to this script. This script calls the ITS_screen_mobile class with the
 * appropriate arguments and returns the data to the client in the JSON format.
 * 
 * A user session must first be created by supplying the user id. 
 * In all other AJAX calls the 'id' field should then be obmitted.
 * 
 * First AJAX call example:
 * @code 
 * $.get('ajax/ITS_ajax_mobile.php', {id: 1, mode: 'q'}, function(data){...})
 * @endcode
 * Subsquent AJAX call example:
 * @code
 * $.get('ajax/ITS_ajax_mobile.php', {mode: 'r', data: 1}, function(data){...})
 * @endcode
 * 
 * 
 * Error codes:
 *  - 1: No user session has been created. Please create user session.
 *  - 2: No more assignments for current chapter.
 *  - 3: Multiple records exist for this question.
 *  - 4: Trying to manipulate review array index before review array has been generated.
 *  - 5: No more review questions available.
 * .
 * 
 * @todo Formatting of documentation is good enough for now.
 * @todo Session ending / logging off?
 *
 * @warning The review index does not change if called too quickly successive times.
*/
?>