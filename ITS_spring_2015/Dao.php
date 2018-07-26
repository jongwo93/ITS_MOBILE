<?php namespace Dao;
class Dao {
   function fetchData($userID){
	   $its_db = mysqli_connect('localhost','root','csip','its');
		if (mysqli_connect_errno()) {
		  echo "failed to connect to its" . mysqli_connect_error();
		}
		$sql = "SELECT 
					Q.question AS question, 
					Q.id AS question_id,
					Q.title AS title,
					Q.images_id AS image_id,
					Q.answers AS answers,
					C.name AS concept_name,
					I.tier AS tier,
					I.parent AS parent,
					I.score AS score 
				FROM intelligent_review_Spring_2014 AS I
				LEFT OUTER JOIN tags AS C ON C.id = I.concept
				LEFT OUTER JOIN questions AS Q ON Q.id = I.question
				where user = $userID ;";
		//echo $sql;
		$result = mysqli_query($its_db, $sql);
		if (!$result) {
			printf("Error: %s\n", mysqli_error($its_db));
			mysqli_close($its_db);
			exit();
		} else{
			mysqli_close($its_db);
			return $result;
		}
   }
}
?>
