<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('magic_quotes_gpc', 'off');

$logging_directory = "log/";

$post = $_POST;

if(!isset($post['msg']) || !isset($post['usr']))
  die("ERROR:No message received!");

$filename = $logging_directory.$post['usr'].".solilog";
if (!file_exists($filename))
	$file = fopen($filename, 'w') or die("ERROR:Cannot open file");
else
	$file = fopen($filename, 'a') or die("ERROR:Cannot open file");
fwrite($file,stripslashes($post['msg'])."\n");
fclose($file);

?>
