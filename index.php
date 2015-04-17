<?php
ob_start();
session_start();

set_time_limit(120);
error_reporting(E_ERROR);
?><!DOCTYPE html>
<html lang="en">
	<head>
		<meta http-equiv="content-type" content="text/html; charset=UTF-8">
		<meta charset="utf-8">
		<title>Music Sheet</title>
		<meta name="generator" content="Bootply" />
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
		<link href="css/bootstrap.css" rel="stylesheet">
		<link href="css/style.css" rel="stylesheet">
		
		<script src="js/jquery-2.1.3.min.js"></script>
		<script src="js/bootstrap.min.js"></script>
		<script src="js/script.js"></script>
	</head>
<body>

 <nav class="navbar navbar-inverse navbar-fixed-top">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="#">Music Sheet and Audio Wizard</a>
        </div>
        <div id="navbar" class="collapse navbar-collapse">
          <ul class="nav navbar-nav">
            <li class="active"><a href="#">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div><!--/.nav-collapse -->
      </div>
    </nav>

    <div class="container">
	
	<div class="top-slider">
<?php
$handle = opendir(dirname(realpath(__FILE__)).'/music-sheet/');
        while($file = readdir($handle)){
            if($file !== '.' && $file !== '..'){
                echo '<div class="sheet-div"><img class="sheet-image" src="music-sheet/'.$file.'"  /></div> ';
            }
        }
?>
	</div>
		
	<button class="btn btn-primary" id="MakeBW"><i class="icon-user icon-white"></i>Make B/W</button>
	
	<button class="btn btn-primary" id="FindRows"><i class="icon-user icon-white"></i>Show Rows</button>

	<button class="btn btn-primary" id="ClearRows"><i class="icon-user icon-white"></i>Clear Rows</button>
	
<!-- HTML Code -->

<div style="width:1000px; height:500px; overflow:auto; border: 1px solid #555; margin-top:10px;">
	<canvas id="area" width="500" height="300">
	</canvas>
<div>
