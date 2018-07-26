<?php
/*!
 * @file config_mobile.php
 * @author Ricky Liou (rliou92@gmail.com)
 * @date February 20, 2014
 * 
 * @brief File that stores all ITS mobile API configuration
 * 
 * This file stores global variables to provide easier maintenence of the API.
 * 
 * @todo Combine all variables into $GLOBAL array 
 */
 $TERM = 'Spring_2015';//!<Current semester in format 'Fall_xxxx' or 'Spring_xxxx'
 $MIN_CHAPTER_NUM = 1;//!<Default user chapter number upon login
 $MAX_CHAPTER_NUM = 8;
 
 $DB_DSN = 'localhost';//!<Database data source name
 $DB_NAME = 'its';//!<MYSQL database name
 $DB_USER = 'root';//!<MYSQL username
 $DB_PASS = 'csip';//!<MYSQL password
 
 $TB_NAME = 'questions';//!<MYSQL table name of where the question info are stored
 $TB_USER = 'stats_';//!<Prefix of individual user tables
 
 global $TERM, $MAX_CHAPTER_NUM, $MIN_CHAPTER_NUM, $DB_DSN, $DB_USER, $DB_PASS, $DB_NAME, $TB_NAME, $TB_USER;
?>
