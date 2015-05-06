<?php
ob_start();
session_start();

set_time_limit(120);
error_reporting(E_ERROR);

function ImageToBlackAndWhite($im) 
{
	$imagewidth = imagesx($im);
	$imageheight = imagesy($im);
    for ($x = $imagewidth; $x--;) {
        for ($y = $imageheight; $y--;) {
            $rgb = imagecolorat($im, $x, $y);
			
            $r = ($rgb >> 16) & 0xFF;
            $g = ($rgb >> 8 ) & 0xFF;
            $b = $rgb & 0xFF;
			
            $gray = ($r + $g + $b) / 3;
            if ($gray < 0xFF) {
                imagesetpixel($im, $x, $y, 0xFFFFFF);
            }else
                imagesetpixel($im, $x, $y, 0x000000);
        }
    }
}


if ($_GET["op"]=="load")
{
	$_SESSION["currentImage"] = $_GET["img"];
	
	$fileType = strtolower(substr($_SESSION["currentImage"], strrpos($_SESSION["currentImage"], '.') + 1));
	
	if($fileType == 'png') {
		$source = imagecreatefrompng($_SESSION["currentImage"]);
		
		ImageToBlackAndWhite($source);

//		imagefilter($source, IMG_FILTER_GRAYSCALE); //first, convert to grayscale
//		imagefilter($source, IMG_FILTER_CONTRAST, -255); //then, apply a full contrast
	   
		header('Content-type: image/png');
		imagepng($source,NULL); //$rotateFilename);
	}

	if($fileType == 'jpg' || $fileType == 'jpeg'){
		$source = imagecreatefromjpeg($_SESSION["currentImage"]);

		ImageToBlackAndWhite($source);

//		imagefilter($source, IMG_FILTER_GRAYSCALE); //first, convert to grayscale
//		imagefilter($source, IMG_FILTER_CONTRAST, -255); //then, apply a full contrast
	   
		header('Content-type: image/jpeg');
		imagejpeg($source,NULL);// $rotateFilename);
	}

	// Free the memory
	imagedestroy($source);
	imagedestroy($rotate);	
}



if ($_GET["op"]=="rotate")
{
	$_SESSION["rotateValue"] = floatval( $_GET["value"] );
	
	$degrees = 90;
	$fileType = strtolower(substr($_SESSION["currentImage"], strrpos($_SESSION["currentImage"], '.') + 1));

	
	if($fileType == 'png') {
	   $source = imagecreatefrompng($_SESSION["currentImage"]);
	   $bgColor = imagecolorallocatealpha($source, 255, 255, 255, 127);

		imagefilter($source, IMG_FILTER_GRAYSCALE); //first, convert to grayscale
//		imagefilter($source, IMG_FILTER_CONTRAST, -255); //then, apply a full contrast
	   
		// Rotate
	   
	   $rotate = imagerotate($source, $_SESSION["rotateValue"], $bgColor);
	   imagesavealpha($rotate, true);
	   
	   header('Content-type: image/png');
	   imagepng($rotate,NULL); //$rotateFilename);

	}

	if($fileType == 'jpg' || $fileType == 'jpeg'){
	   $source = imagecreatefromjpeg($_SESSION["currentImage"]);

		imagefilter($source, IMG_FILTER_GRAYSCALE); //first, convert to grayscale
//		imagefilter($source, IMG_FILTER_CONTRAST, -255); //then, apply a full contrast
	   
		// Rotate
	   $rotate = imagerotate($source, $_SESSION["rotateValue"], 0);
	   
	   header('Content-type: image/jpeg');
	   imagejpeg($rotate,NULL);// $rotateFilename);
	}

	// Free the memory
	imagedestroy($source);
	imagedestroy($rotate);	
	
	
}

?>