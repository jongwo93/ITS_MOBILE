<?php namespace Model;

/*
Author: Sen Lin
The model component of the MVC.
This class takes Dao object and do all the logics

*/
include 'Dao.php';
use \Dao\Dao as Dao;



class Model{
	
	function writeToJson($userID){
		$result = Dao::fetchData($userID);
		//This will read result row by row
		$branchIndex = 0;
		$index = 1;
		$i = 0;
		$counter = 0;
		while($row = mysqli_fetch_assoc($result)) {
			$counter++; $i++;
			if($counter <= 240){
				$branch[$branchIndex][] = $row['question_id'];
			}
			if($i == $index) {
				$branchIndex++;
				$i = 0;
				if($branchIndex == 16){
					$branchIndex = 0;
				}
			}
			if ($counter == 16 || $counter == 48 || $counter == 112) {
				$index = $index*2;
				$i = 0;
			}
			//question_id as key
			$question_id = $row['question_id']; 
			$question[$question_id]['question']  = $row['question'];
			$question[$question_id]['title']  = $row['title'];
			$question[$question_id]['image_id']  = $row['image_id'];
			$question[$question_id]['answers']  = $row['answers'];
			$question[$question_id]['score']  = $row['score'];
			$question[$question_id]['parent']  = $row['parent'];
			$question[$question_id]['concept_name']  = $row['concept_name'];
			
		}
		//echo $counter;
		//print_r($branch);
		//print_r($question);
		$data['branch'] = $branch;
		$data['question'] = $question;
		$json_string = json_encode($data);
		$file = 'file.json';
		file_put_contents($file, $json_string);
		//return $data
   }
}
?>
