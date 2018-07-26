<?php
/*!@file ITS_screen_mobile.php
 * @brief Keeps track of the ITS screen state
 * */
//=====================================================================//
/*!
 * @class ITS_screen_mobile
 * @brief Keeps track of the ITS screen state
 * @date February 26, 2014
 * @author Ricky Liou
 * @author Greg Krudysz
 *
 * @todo Split into another class, such as ITS_submit_mobile class
 * 
 * */

class ITS_screen_mobile
{
    public $mysqli; //!<MYSQL database connection object
    public $id; //!<User id
    public $term; //!<Current ITS term
    public $chapter; //!<Current chapter number
    public $review_index = 0; //!<Index of current position in review array
    public $review_length = 0; //!<Maximum index of review array
    public $tb_name; //!<MYSQL table name of where the question info are stored
    public $tb_user; //!<Prefix of individual user tables
    public $time = 0; //!<Time that user first sees questions
    
    public $qNum; //!<Current question number
    public $mc_answer_num; //!<Number of multiple choice answers
    public $m_L_field_num; //!<Number of left side values for matching questions
    
    /*!
     * @brief ITS_screen_mobile class construct
     * 
     * @param[in] $id User id
     * @param[in] $term Current ITS term
     * @param[in] $chapter_num Current chapter number
     * @param[in] $tb_name MYSQL table name of where the question info are stored
     * @param[in] $tb_user Prefix of individual user tables
     * @param[in] $mysqli MYSQL database connection object
     * 
     * */
    //=====================================================================// 
    function __construct($id, $term, $chapter_num, $tb_name, $tb_user, mysqli $mysqli)
    {
        $this->id      = $id;
        $this->term    = $term;
        $this->chapter = $chapter_num;
        $this->tb_name = $tb_name;
        $this->tb_user = $tb_user;
        $this->mysqli  = $mysqli;
    }
    //=====================================================================//
    /*!
     * @brief Increments, decrements, or resets the review index array.
     * 
     * If the index tries to go out of bounds, the index will remain the same.
     * 
     * @param[in] $del_index 1 to increment index, -1 to in decrement index, 0 to set index to 0
     * @returns Array of current review index (starting at 0) and review index length
     * 
     * 
     * */
    public function set_IDR($del_index)
    {
        if ($this->review_length != 0) {
            if ($del_index > 0) {
                $this->review_index++;
                
                if ($this->review_index > ($this->review_length - 1)) { //must offset review length by one because indexing starts from 0
                    $this->review_index = $this->review_length - 1;
                }
            } else if ($del_index == 0) {
                $this->review_index = 0;
            } else if ($del_index < 0) {
                $this->review_index--;
                
                if ($this->review_index < 0) {
                    $this->review_index = 0;
                }
            }
        }
    }
    //=====================================================================//
    /*!
     * @brief Returns JSON array of the screen content based on the provided mode
     * 
     * @param[in] $mode 's' for score, 'q' for question, 'r' for review
     * @return JSON array of content, see ITS_ajax_mobile.php
     * 
     * */
    public function get_SCREEN($mode)
    {
        switch ($mode) {
            /*-------------------------------*/
            case 's':
                for ($chapterNum = 1; $chapterNum < 14; $chapterNum++) {
                    $category = $this->get_CATEGORY($chapterNum);
                    $query    = 'SELECT count(id) FROM questions WHERE ' . $category;
                    $res      = $this->mysqli->query($query);
                    $q_avail  = $res->fetch_array(MYSQLI_NUM);
                    $res->free();
                    
                    $total_score = 0;
                    
                    $query = 'SELECT score FROM stats_' . $this->id . ' WHERE current_chapter =' . $chapterNum . ' and score IS NOT NULL';
                    
                    $res = $this->mysqli->query($query);
                    for ($i = 0; $ques_score = $res->fetch_array(MYSQLI_NUM); $i++) {
                        $total_score += $ques_score[0];
                    }
                    $res->free();
                    
                    $JSON_array['Avail'][]      = $q_avail[0];
                    $JSON_array['Module'][]     = $chapterNum;
                    $JSON_array['Scores'][]     = $total_score;
                    $JSON_array['Percentage'][] = round($total_score / $i);
                    $JSON_array['Attem'][]      = $i;
                }
                break;
            /*-------------------------------*/
            case 'q':
                $this->time = time();
                $this->qNum = $this->random_QNUM_from_CHAPTER();
                //$this->qNum = 1055;
                if (!is_int($this->qNum)) {
                    $JSON_array['error'] = 2;
                } else {
                    $Q          = new ITS_question_mobile($this->id, $this->tb_name, $this->mysqli);
                    $JSON_array = $Q->render_QUESTION($this->qNum, 'q');
                    
                    if ($JSON_array['Q-type'] == 'mc') {
                        $this->mc_answer_num = $JSON_array['Q-answers'];
                    } else {
                        $this->Q_permutation = $Q->Q_permutation;
                    }
                    
                    if ($JSON_array['Q-type'] == 'm') {
                        $this->m_L_field_num = count(array_filter($JSON_array['Q-answers-values'][0]));
                    }
                }
                break;
            /*-------------------------------*/
            case 'r':
                $query               = 'SELECT score,answered,question_id FROM stats_' . $this->id . ' WHERE score IS NOT NULL AND current_chapter=' . $this->chapter;
                //var_dump($query);
                $res                 = $this->mysqli->query($query);
                //var_dump($res);
                $this->review_length = 0;
                while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
                    $review_arr['score'][]       = $row['score'];
                    $review_arr['answered'][]    = $row['answered'];
                    $review_arr['question_id'][] = $row['question_id'];
                    $this->review_length++;
                }
                $res->free();
                
                if (!isset($review_arr)) {
                    $JSON_array['error'] = 5;
                } else {
                    //echo 'before question class';
                    $Q                         = new ITS_question_mobile($this->id, $this->tb_name, $this->mysqli);
                    // var_dump($review_arr['question_id'][$this->review_index]);
                    //echo 'after question class';
                    //var_dump($review_arr['question_id']); echo ' ';
                    //var_dump($this->review_index);
                    $JSON_array                = $Q->render_QUESTION($review_arr['question_id'][$this->review_index], 'r');
                    $JSON_array['user_answer'] = $review_arr['answered'][$this->review_index];
                    $JSON_array['user_score']  = $review_arr['score'][$this->review_index];
                    //var_dump($JSON_array);
                }
                //echo 'yo';
                break;
            /*-------------------------------*/
            case 'p':
                /* Purpose:       
                For USER ID
                - For every Chapter 
                -TAG in that Chapter
                -Question in that TAG
                -Score of that Question
                -AVG of that SCORE
                */
                //QUERY call for each chapter
                for ($assign = 1; $assign <= 8; $assign++) {
                    $query = 'SELECT questions.title, questions.id, tags.name , tags.id, score, assignments.name FROM stats_' . $this->id;
                    $query .= ' INNER JOIN assignments ON assignments.questions_id = stats_' . $this->id . '.question_id ';
                    $query .= ' INNER JOIN questions_tags ON assignments.questions_id = questions_tags.questions_id';
                    $query .= ' INNER JOIN questions ON questions_tags.questions_id = questions.id';
                    $query .= ' INNER JOIN tags ON questions_tags.tags_id = tags.id';
                    $query .= ' WHERE score IS NOT NULL and assignments.name = ' . $assign;
                    $query .= ' ORDER BY questions.id, tags.name';
                    $res = $this->mysqli->query($query);
                    //get each qname, qid, tname, tid, score into array
                    while ($row = $res->fetch_array(MYSQLI_NUM)) {
                        $JSON_array['Question Name'][] = $row[0];
                        $JSON_array['Question id'][]   = $row[1];
                        $JSON_array['Tag Name'][]      = $row[2];
                        $JSON_array['Tag id'][]        = $row[3];
                        $JSON_array['Score'][]         = $row[4];
                        $JSON_array['assignment'][]    = $row[5];
                    }
                    $res->free();
                    
                    if (!isset($JSON_array)) {
                        $JSON_array['error'] = "json array not filled";
                    }
                }        
                break;        
        }
        return $JSON_array;
    }
    //=====================================================================//
    /*!
     * @brief Returns random question id number from current chapter
     * 
     * @return Random question id number from current chapter
     * 
     * */
    private function random_QNUM_from_CHAPTER()
    {
        $category = $this->get_CATEGORY($this->chapter);
        
        $query = 'SELECT id FROM ' . $this->tb_name . ' WHERE ' . $category;
        $res   = $this->mysqli->query($query);
        while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
            $qarr[] = $row['id'];
        }
        $res->free();
        
        if (empty($qarr)) {
            $qid = '';
        } else {
            $ques_list = implode(",", $qarr);
            $query     = 'SELECT id,qtype FROM ' . $this->tb_name . ' WHERE id IN (' . $ques_list . ') AND id NOT IN (SELECT question_id FROM stats_' . $this->id . ' WHERE score IS NOT NULL AND current_chapter=' . $this->chapter . ')  AND qtype IN ("M","MC","C")';
            $res       = $this->mysqli->query($query);
            
            for ($i = 0; $row = $res->fetch_array(MYSQLI_ASSOC); $i++) {
                $qAvailable[$i][0] = $row['id'];
                $qAvailable[$i][1] = $row['qtype'];
            }
            $res->free();
            
            if ($i) {
                $ques_arr_rand_key = array_rand($qAvailable, 1);
                $qid               = intval($qAvailable[$ques_arr_rand_key][0]);
            }
        }
        return $qid;
    }
    //=====================================================================//
    /*!
     * @brief Constructs the WHERE clause partial query that is used to query information about questions in a desired chapter 
     * 
     * @param[in] $ch Chapter number
     * @return The WHERE clause partial query that is used to query information about questions in a desired chapter 
     * 
     * */
    private function get_CATEGORY($ch)
    {
        if ($ch == 1) {
            $other = '|Complex$';
        } else if ($ch == 13) {
            $other = '|PEZ$|chapter7DM$';
        } else {
            $other = '';
        }
        
        if ($ch == 8) {
            $match = array();
            for ($chr = 1; $chr <= 6; $chr++) {
                if ($chr == 1) {
                    $other = '|Complex$';
                } else {
                    $other = '';
                }
                array_push($match, 'SPEN' . $chr . '$|PreLab0' . $chr . '$|Lab' . $chr . '$|Chapter' . $chr . '$|-Mod' . $chr . '$' . $other);
            }
            $category = implode("|", $match);
            $query    = 'category REGEXP "(' . $category . ')" AND questions.qtype IN ("MC","M","C")';
        } else {
            $query = 'category REGEXP "(SPEN' . $ch . '$|PreLab0' . $ch . '$|Lab' . $ch . '$|Chapter' . $ch . '$|-Mod' . $ch . '$' . $other . ')" AND questions.qtype IN ("MC","M","C")';
        }
        return $query;
    }
    //=====================================================================//
    /*!
     * @brief Writes query to record user answer and permutation 
     * 
     * 
     * @param[in] $qid Question id number
     * @param[in] $qtype Question type
     * @param[in] $answered User answer to question
     * @param[in] $event 1 = user submitted score, 0 = user skip
     * 
     * */
    public function record_QUESTION($qid, $qtype, $answered, $event)
    {
        //echo 'submitting question';
        //var_dump($qid);		var_dump($qtype);		var_dump($answered);		var_dump($event);
        $answered = $this->mysqli->real_escape_string($answered);
        $dur      = time() - $this->time;
        
        $query = 'SELECT * FROM ' . $this->tb_user . $this->id . ' WHERE score IS NOT NULL AND question_id=' . $qid;
        
        if ($this->mysqli->query($query)->num_rows) {
            $JSON_array['error'] = 3;
        } else if ($event == 1) {
            //echo 'getting score';
            $scoreArr = $this->get_QUESTION_score($qid, $qtype, $answered);
            //var_dump($scoreArr);
            switch (strtolower($qtype)) {
                case 'm':
                    $score                      = strval($scoreArr[0]);
                    $JSON_array['Q-statistics'] = $scoreArr[1];
                    break;
                case 'c':
                    $score                      = array_sum($scoreArr[0]);
                    $JSON_array['Q-statistics'] = array(
                        $scoreArr[1][0],
                        $scoreArr[1][1]
                    );
                    break;
                default:
                    $score                      = $scoreArr[0];
                    //$JSON_array['Q-statistics'] = $this->get_MC_statistics($qid);
                    $JSON_array['Q-statistics'] = 'dummy';
                    //var_dump($JSON_array);
            }
            $query = 'INSERT IGNORE INTO ' . $this->tb_user . $this->id . '(question_id,current_chapter,answered,score,comment,epochtime,duration,event) 
			VALUES
			(' . $qid . ',' . $this->chapter . ',"' . $answered . '",' . $score . ',"' . implode(',', $this->Q_permutation) . '",' . intval($this->time) . ',' . $dur . ',\'Mchapter\'' . ')';
            
            $JSON_array['score'] = $score;
            
        } else {
            $query = 'INSERT IGNORE INTO ' . $this->tb_user . $this->id . '(question_id,current_chapter,epochtime,duration,event) 
			VALUES
			(' . $qid . ',' . $this->chapter . ',' . intval($this->time) . ',' . $dur . ',\'Mskip\'' . ')';
        }
        
        $this->mysqli->query($query);
        return $JSON_array;
    }
    //=====================================================================//
    /*!
     * @brief Calculates question score 
     * 
     * 
     * @param[in] $qid Question id number
     * @param[in] $qtype Question type
     * @param[in] $qanswer User answer to question
     * 
     * */
    private function get_QUESTION_score($qid, $qtype, $qanswer)
    {
        $qtype = strtolower($qtype);
        
        switch ($qtype) {
            /*-------------------------------*/
            case 'mc':
                if (empty($qanswer)) {
                    $score = array(
                        0
                    );
                } else {
                    $query  = 'SELECT weight' . (ord($qanswer) - 64) . ' FROM ' . $this->tb_name . '_' . $qtype . ' WHERE ' . $this->tb_name . '_id=' . $qid;
                    $res    = $this->mysqli->query($query);
                    $result = $res->fetch_array(MYSQLI_NUM);
                    $res->free();
                    $result = intval($result[0]);
                    $score  = array(
                        $result,
                        (ord($qanswer) - 64)
                    );
                }
                break;
            /*-------------------------------*/
            case 'm':
                $score_arr = array();
                $answered  = explode(',', $qanswer);
                $idx       = array();
                for ($i = 0, $l = count($this->Q_permutation); $i < $l; $i++) {
                    $idx[abs($this->Q_permutation[$i]) - 1] = $this->Q_permutation[$i];
                }
                
                $N = 0;
                for ($cc = 0; $cc < $this->m_L_field_num; $cc++) {
                    if ($this->Q_permutation[$cc] > 0) {
                        $N++;
                    }
                }
                
                for ($v = 0, $l = count($answered); $v < $l; $v++) {
                    if (empty($idx)) {
                        $score_arr[$v] = NULL;
                    } elseif ($idx[$v] < 0) {
                        $score_arr[$v] = NULL;
                    } else {
                        if (empty($answered[$v])) {
                            $score_arr[$v] = 0;
                        } else {
                            $index         = (abs($this->Q_permutation[ord($answered[$v]) - 65])) - 1;
                            $score_arr[$v] = 100 * ((int) ($v == $index) / $N);
                        }
                    }
                }
                
                $scr   = array_sum($score_arr);
                $score = array(
                    $scr,
                    $score_arr
                );
                break;
            /*-------------------------------*/
            case 'c':
                $toll_lim = 0.02;
                $toll_eps = $toll_lim * pow(10, -3);
                $answer   = explode(',', $qanswer);
                $query    = 'SELECT * FROM ' . $this->tb_name . '_' . $qtype . ' WHERE ' . $this->tb_name . '_id=' . $qid;
                
                $res = $this->mysqli->query($query);
                //var_dump($this->Q_permutation);die();
                $row = $res->fetch_array(MYSQLI_ASSOC);
                //var_dump($row);die();
                $res->free();
                $Nvals = intval($row['vals']);
                for ($i = 0, $l = count($answer); $i < $l; $i++) {
                    $formula[$i] = $row['formula' . ($i + 1)];
                    $weight[$i]  = $row['weight' . ($i + 1)];
                }
                for ($i = 0; $i < $Nvals; $i++) {
                    $result_val['val' . ($i + 1)] = $row['val' . ($i + 1)];
                }
                
                for ($i = 0, $l = count($answer); $i < $l; $i++) {
                    for ($v = 0; $v <= ($Nvals - 1); $v++) {
                        $col         = 'val' . ($v + 1);
                        $formula[$i] = str_replace($result_val[$col], $this->Q_permutation[$v + 1], $formula[$i]);
                    }
                }
                $scoreArr    = array();
                $scoreArr[0] = 0;
                
                for ($i = 0, $l = count($answer); $i < $l; $i++) {
                    $pattern     = '/([\d.]+)\*\*[\(]([\d\+\-\*\/]+)[\)]/';
                    $replacement = 'pow($1,$2)';
                    
                    $equation = preg_replace($pattern, $replacement, $formula[$i]);
                    eval("\$solution=" . $equation . ";");
                    
                    
                    if (empty($formula[$i])) {
                        $solution = 'NO SOLUTION EXISTS';
                    }
                    if ($solution == 0) {
                        $solution = 0;
                    } elseif (empty($solution)) {
                        $solution = NULL;
                    }
                    $ansCLEAN = preg_replace('/\s/', '', trim($answer[$i]));
                    $chunks   = preg_split("/[,=]+/", $ansCLEAN);
                    
                    
                    for ($a = 0; $a <= count($chunks) - 1; $a++) {
                        if (is_numeric($chunks[$a])) {
                            if (abs($solution - $chunks[$a]) < $toll_lim) {
                                $toll_array[$a] = $toll_lim;
                            } else {
                                $toll_array[$a] = abs(1 - ($chunks[$a] / $solution));
                            }
                        } else {
                            $tmp = '';
                            eval('$tmp="' . $chunks[$a] . '";');
                            if (is_numeric($tmp)) {
                                $toll_array[$a] = abs(1 - ($tmp / $solution));
                            } else {
                                eval("\$tmp=\"$chunks[$a]\";");
                                $toll_array[$a] = abs(1 - ($chunks[$a] / $solution));
                            }
                        }
                    }
                    
                    sort($toll_array);
                    $toll = $toll_array[0];
                    $k    = $i + 1;
                    if ($toll <= $toll_lim) {
                        if ($weight[$i] == '') {
                            $scr[$k] = round(100 / $answer_count);
                        } else {
                            $scr[$k] = $weight[$i];
                        }
                        
                    } else {
                        $scr[$k] = 0;
                    }
                }
                
                if (abs($solution) < $toll_lim) {
                    $sol = sprintf("%1.4f", $solution);
                    $div = trim(sprintf("%1.4f", $toll_lim));
                } else if ($solution < 1) {
                    $sol = sprintf("%1.4f", $solution);
                    $div = trim(sprintf("%1.4f", $solution * $toll_lim));
                } else {
                    $sol = sprintf("%1.2f", $solution);
                    $div = sprintf("%1.2f", $solution * $toll_lim);
                }
                
                $score = array(
                    $scr,
                    array(
                        $sol,
                        $div
                    )
                );
                break;
        }
        return $score;
    }
    //=====================================================================//
    /*!
     * @brief Fetches array of percentages of all current term student answers for each answer in order
     * 
     * 
     * @param[in] $qid Question id number
     * @return array of percentages of all current term student answers for each answer in order
     * 
     * */
       
    private function get_MC_statistics($qid)
    {
        $answered_array = array();
        
        $query = "SELECT id FROM users WHERE status='" . $this->term . "'";
        
        $res = $this->mysqli->query($query);
        while ($row = $res->fetch_array(MYSQLI_ASSOC)) {
            $student_array[] = $row['id'];
        }
        $res->free();
        
        foreach ($student_array as $student) {
            $query = 'SELECT answered FROM stats_' . $student . ' WHERE question_id=' . $qid;
            $res   = $this->mysqli->query($query);
            if ($res->num_rows) {
                $row = $res->fetch_array(MYSQLI_ASSOC);
                if (!is_null($row['answered'])) {
                    $answered_array[] = $row['answered'];
                }
            }
            $res->free();
        }
        
        $answered_array = array_count_values($answered_array);
        $total_answered = 0;
        for ($i = 0; $i < $this->mc_answer_num; $i++) {
            if (empty($answered_array[chr(65 + $i)])) {
                $answered_array[chr(65 + $i)] = 0;
            }
            $total_answered += $answered_array[chr(65 + $i)];
        }
              
        if ($total_answered) { //must check if any questions have been answered to prevent dividing by zero
            foreach ($answered_array as $k => $answer_count) {
                $answered_array[$k] = ($answered_array[$k] * 100) / $total_answered;
            }
        }
        
        return $answered_array;
    }
    //=====================================================================//
} //e.o. class
?>
