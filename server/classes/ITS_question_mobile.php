<?php

/*!@file ITS_question_mobile.php
 * @brief Fetches ITS question data
 * */

/*!
 * @class ITS_question_mobile
 * @brief Returns ITS question data
 * @date April 16, 2014
 * @author Ricky Liou
 * @author Greg Krudysz
 * @author Gordon Sulc
 * 
 * 
 * @todo Capablity to generate randomized decimal numbers for calculated questions
 * 
 * Example constructor:
 * @code
 * $Q = new ITS_question_mobile(1, $mysqli); 
 * @endcode
 * 
 * Example of fetching question data for question mode:
 * @code
 * $Q_data = $Q->render_QUESTION(1, 'q');
 * @endcode
 * 
 * Types: m | c | mc - | matching | calculated | multiple choice
 * 
 * 
 * */

class ITS_question_mobile
{
	private $id;								//!<ITS student ID
	private $mysqli;							//!<Mysqli object that has MYSQL database connection
	private $mode;								//!<Either question or review mode
	
	public $tb_name;							//!<MYSQL table name of where the question info are stored
	public $Q_type;					 			//!<Question type can take: |m|c|mc|
	public $Q_num;								//!<Question ID number
	public $Q_title;							//!<Question title
	public $Q_question;							//!<Question string
	public $Q_image;							//!<Question image number, if applicable
	public $Q_answers;							//!<Number of total answers for a question
	public $Q_category;							//!<Question category
	public $Q_permutation;						//!<For matching, is the randomized order of right hand values. For calculated, are the randomized numbers.
	public $Q_answers_values = array();			//!<Question answer choices
	
	/*!
	 * @brief ITS_question_mobile class constructor
	 * 
	 * @param[in] $student_id User id number
     * @param[in] $tb_name MYSQL table name of where the question info are stored
     * @param[in] $mysqli mysqli object that contains the MYSQL database connection
	 * 
	 * */
	
	function __construct($student_id, $tb_name, mysqli $mysqli){	
		$this->id = $student_id;
		$this->tb_name = $tb_name;
		$this->mysqli = $mysqli;
	}
	
	/*!
	 * @brief Returns question data based on question id number and mode.
	 * @param $q_num Question id number
	 * @param $mode 'q' for question, 'r' for review
	 * @return $Q_num, $Q_type, $Q_title, $Q_question, $Q_image, $Q_answers, $Q_answers_values, $Q_category
	 * 
	 * */
	
	public function render_QUESTION($q_num, $mode){
		
		$this->mode = $mode;
		
		$this->load_DATA_from_DB($q_num);
		
		if($this->Q_type == 'c'){
			$this->calculated_STR_randomize();
		}
		if(!empty($this->Q_image)){
			$this->image_TO_path();
		}
	
		$this->get_ANSWERS_data_from_DB();

		return array(
			'Q-num' => $this->Q_num, 
			'Q-type' => $this->Q_type, 
			'Q-title' => $this->Q_title,
			'Q-question' => $this->Q_question, 
			'Q-image' => $this->Q_image, 
			'Q-answers' => $this->Q_answers, 
			'Q-answers-values' => $this->Q_answers_values, 
			'Q-category' => $this->Q_category
			);
	} 
	
	/*!
	 * @brief Loads question data from the database into the class variables.
	 * @param $q_num Question id number 
	 * */
	
	public function load_DATA_from_DB($q_num){
		$query = 'SELECT id,qtype,title,question,images_id,answers,category FROM ' . $this->tb_name . ' WHERE id=' . $q_num;
		$res = $this->mysqli->query($query);
		$data = $res->fetch_array(MYSQLI_NUM);
		$res->free();
		
	    $this->Q_num = $data[0];				
		$this->Q_type = strtolower($data[1]);
		$this->Q_title = $data[2];
		$this->Q_question = $data[3];
		$this->Q_image = $data[4];
		$this->Q_answers = $data[5];
		$this->Q_category = $data[6];
		// var_dump($this);
	}
	
	/*!
	 * @brief For calculated questions replaces formula stored in $Q_question with the randomized numbers.
	 * 
	 * For calculated questions replaces formula stored in $Q_question with the randomized numbers.
	 * */
	
	private function calculated_STR_randomize(){
		$query = 'SELECT vals from ' . $this->tb_name . '_' . $this->Q_type . ' WHERE ' . $this->tb_name . '_' . 'id=' . $this->Q_num;
		$res = $this->mysqli->query($query);
		$vals = $res->fetch_array(MYSQLI_NUM);
		$res->free();
		
	 	$fields = 'val1,min_val1,max_val1';
	 	for ($i=2;$i<=$vals[0];$i++){
	 			$fields = $fields . ',val' . $i . ',min_val' . $i . ',max_val' . $i;
	 	}
	
	 	$query = 'SELECT ' . $fields . ' from ' . $this->tb_name . '_' . $this->Q_type . ' WHERE ' . $this->tb_name . '_' . 'id=' . $this->Q_num;
	 	$res = $this->mysqli->query($query);
	 	$vdata = $res->fetch_array(MYSQLI_ASSOC);
	 	$res->free();
	 	
	 	$rnv = array();
	 	if($this->mode == 'q'){		//Replaces all variable names with randomized values if in question mode.
			for($i = 1; $i <= $vals[0]; $i++){
				$rnv[($i - 1)] = rand($vdata['min_val' . $i], $vdata['max_val' . $i]); //Can add capability for decimal numbers
				$this->Q_question = str_replace($vdata['val' . $i], $rnv[($i - 1)], $this->Q_question);
				$this->Q_permutation[$i] = $rnv[($i - 1)];							 		 
			}
		}
		else if($this->mode == 'r'){	//In review mode, retrieves randomized numbers from the database.		
			$query = 'SELECT comment FROM stats_' . $this->id . ' WHERE question_id=' . $this->Q_num;
			$res = $this->mysqli->query($query);
			$perm_str = $res->fetch_array(MYSQLI_NUM);
			$res->free();
			$perm_str = array_map('intval', explode(',', $perm_str[0]));
			for ($i = 1; $i <= $vals[0]; $i++){
				$this->Q_question = str_replace($vdata['val' . $i], $perm_str[($i - 1)], $this->Q_question);
			}
		}
	}

	/*!
	 * @brief If question contains image, turn $Q_image into the appropriate file path name.
	 * 
	 * If question contains image, turn $Q_image into the appropriate file path name.
	 * */

	private function image_TO_path(){ 
		$query = 'SELECT dir,name FROM images WHERE id=' . $this->Q_image;
        $res = $this->mysqli->query($query);
        $row = $res->fetch_array(MYSQLI_ASSOC);
        $res->free();
        $src =  $row['dir'] . '/' . $row['name'];	 
        //echo($row['dir']); echo('<br><br>' . $row['name']); echo($row['name']);
		$this->Q_image = $src;
	}
	
	/*!
	 * @brief Loads question answer choices into $Q_answers_values.
	 * 
	 * Loads question answer choices into $Q_answers_values.
	 * */
	
	private function get_ANSWERS_data_from_DB(){
		switch ($this->Q_type){

			case 'mc':
				$Q_answers_fields = 'answer1';
				for($i = 2; $i <= $this->Q_answers; $i++){
					$Q_answers_fields = $Q_answers_fields . ',answer' . $i;
				}
				$query = 'SELECT ' . $Q_answers_fields . ' from ' . $this->tb_name . '_' . $this->Q_type . ' WHERE ' . $this->tb_name . '_' . 'id=' . $this->Q_num;
				// var_dump($query);
				$res = $this->mysqli->query($query);
				$this->Q_answers_values = $res->fetch_array(MYSQLI_NUM);
				// var_dump($this->Q_answers_values);
				// var_dump(empty($this->Q_answers_values[0]) && $this->Q_answers_values[0] != 0);
				// var_dump($this->Q_answers_values[0] != 0);

				// var_dump($this->Q_answers_values[0]);
				$res->free();
				//Test to see if there's text in the answer values
				if ($this->Q_answers_values[0] == "") {
					//Get the image values instead!
					$Q_answers_fields = 'image1';
					for($i = 2; $i <= $this->Q_answers; $i++){
						$Q_answers_fields = $Q_answers_fields . ',image' . $i;
					}
					$query = 'SELECT ' . $Q_answers_fields . ' from ' . $this->tb_name . '_' . $this->Q_type . ' WHERE ' . $this->tb_name . '_' . 'id=' . $this->Q_num;
					$res = $this->mysqli->query($query);
					$mc_img_vals = $res->fetch_array(MYSQLI_NUM);
					// var_dump($mc_img_vals);
					for($i = 0, $k = count($mc_img_vals); $i < $k; $i++){
						$query = 'SELECT dir,name FROM images WHERE id=' . $mc_img_vals[$i];
						$res = $this->mysqli->query($query);
						$row = $res->fetch_array(MYSQLI_ASSOC);
						$res->free();
						
						$this->Q_answers_values[$i] = $row['dir'] . '/' . $row['name'];
					}	
					//Set flag saying that the data are images
					$this->Q_answers_values = array($this->Q_answers_values,"IFlag" => 1);
				}			
			break;
			
			case 'm':
				$L_fields = 'L1';
				$R_fields = 'R1';
				$R_image_fields = 'Rimage1';
				for ($i = 2; $i <= $this->Q_answers; $i++){
					 $L_fields = $L_fields . ',L' . $i;
					 $R_fields = $R_fields . ',R' . $i;
					 $R_image_fields = $R_image_fields . ',Rimage' . $i;
				}
				$Lquery = 'SELECT ' . $L_fields . ' from ' . $this->tb_name . '_' . $this->Q_type . ' WHERE ' . $this->tb_name . '_' . 'id=' . $this->Q_num;
				$Rquery = 'SELECT ' . $R_fields . ' from ' . $this->tb_name . '_' . $this->Q_type . ' WHERE ' . $this->tb_name . '_' . 'id=' . $this->Q_num; 
								
				$res = $this->mysqli->query($Lquery);
				$L_answers = $res->fetch_array(MYSQLI_NUM);
				$res->free();
				
				$res = $this->mysqli->query($Rquery);
				$R_answers = $res->fetch_array(MYSQLI_NUM);
				$res->free();
		
				if($R_answers[0]){ 	//If the right side values are just text
					$this->Q_answers_values = array($L_answers, $R_answers);
				}
				else{			 	//If the right side values are images
					$Rimagequery = 'SELECT ' . $R_image_fields . ' from ' . $this->tb_name . '_' . $this->Q_type . ' WHERE ' . $this->tb_name . '_' . 'id=' . $this->Q_num;
					$res = $this->mysqli->query($Rimagequery);
					$R_image_answers = $res->fetch_array(MYSQLI_NUM);
					$res->free();
					
					for($i = 0, $k = count($R_image_answers); $i < $k; $i++){
						$query = 'SELECT dir,name FROM images WHERE id=' . $R_image_answers[$i];
						$res = $this->mysqli->query($query);
						$row = $res->fetch_array(MYSQLI_ASSOC);
						$res->free();
						
						$src = $row['dir'] . '/' . $row['name'];
						$R_image_src[$i] = $src; 
					}	
					$this->Q_answers_values = array($L_answers, $R_image_src, 1);		
				}
				$this->randomize_MATCHING();	
			break;
		}
	}
	
	/*!
	 * @brief For matching questions randomizes $Q_answers_values[1] (right hand answer choices)
	 * 
	 * For matching questions randomizes $Q_answers_values[1] (right hand answer choices)
	 * */

	private function randomize_MATCHING(){
		$L_answers = $this->Q_answers_values[0];
		$R_answers = $this->Q_answers_values[1];

		if($this->mode == 'q'){
			$this->Q_permutation = range(1, $this->Q_answers);
			for($l = array_search('NULL', $L_answers) - 1; $l < $this->Q_answers; $l++){
				$this->Q_permutation[$l] = -$this->Q_permutation[$l]; //Negative numbers mean right hand side values with no corresponding left side answer
			}
			shuffle($this->Q_permutation);
		}
		else if($this->mode == 'r'){
			$query = 'SELECT comment FROM stats_' . $this->id . ' WHERE question_id=' . $this->Q_num;
			$res = $this->mysqli->query($query);
			$perm_str = $res->fetch_array(MYSQLI_NUM);
			$res->free();
			$this->Q_permutation = array_map('intval', explode(',', $perm_str[0]));
		}
		 
		foreach ($this->Q_permutation as $k){
			$k = abs($k) - 1;
			$randomized_R[] = $R_answers[$k];
		}
		
		$this->Q_answers_values[1] = $randomized_R;
	}
} //eo:class
?>

