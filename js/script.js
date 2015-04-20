function contrastImage(imageData, contrast) {

    var data = imageData.data;
    var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for(var i=0;i<data.length;i+=4)
    {
        data[i] = factor * (data[i] - 128) + 128;
        data[i+1] = factor * (data[i+1] - 128) + 128;
        data[i+2] = factor * (data[i+2] - 128) + 128;
		
		var grayscale = data[i  ] * .3 + data[i+1] * .59 + data[i+2] * .11;

		if (grayscale>192) { 
			data[i  ] = 255; 	// red
			data[i+1] = 255; 	// green
			data[i+2] = 255; 	// blue
		} else
		{
			data[i  ] = 0; 	// red
			data[i+1] = 0; 	// green
			data[i+2] = 0; 	// blue
		}
		
    }
	
    return imageData;
}

var workingImage;
var workingImageElem;
var pic_real_width, pic_real_height;


function LoadImage(xthis,xcontext,drawImage)
{
	workingImage = xthis; //document.getElementById("canvasSource");
	workingImageElem = $(xthis)[0]; // $(this).attr('src'); // Get my img elem
	
	$("<img/>") // Make in memory copy of image to avoid css issues
		.attr("src", $(workingImageElem).attr("src"))
		.load(function() {
			pic_real_width = this.width;   // Note: $(this).width() will not
			pic_real_height = this.height; // work for in memory images.


			$("#area").attr('width', pic_real_width);
			$("#area").attr('height', pic_real_height);
	
			if (drawImage) { xcontext.drawImage(workingImage, 0, 0); }
			
		});
		
}

$(document).ready( function() 
{

	var canvas = document.getElementById("area");
	var context = canvas.getContext("2d");

	var RotateValue = 0;
	

	$(".sheet-image").on('click', function ()
	{
		RotateValue = 0;
		LoadImage(this,context,true);
	});
	
	$("#RotatePlus").on('click', function ()
	{
//		LoadImage(workingImage);
		RotateValue += 0.1;
		context.save(); 
		context.rotate(RotateValue*(Math.PI/180));

		context.drawImage(workingImage, 0, 0);
		context.restore();
	});

	$("#RotateMinus").on('click', function ()
	{
//		LoadImage(workingImage);
		RotateValue += -0.1;
		context.save(); 
		context.rotate(RotateValue*(Math.PI/180));

		context.drawImage(workingImage, 0, 0);
		context.restore();
	});
	
		
	$("#MakeBWCon").on('click', function ()
	{
		var imgd = context.getImageData(0, 0, pic_real_width, pic_real_height);
		var pix = contrastImage(imgd,-30);
		context.putImageData(imgd, 0, 0);
	});
	
	$("#MakeBW").on('click', function ()
	{
		var imgd = context.getImageData(0, 0, pic_real_width, pic_real_height);
		var pix = imgd.data;
		for (var i = 0, n = pix.length; i < n; i += 4) {
			var grayscale = pix[i  ] * .3 + pix[i+1] * .59 + pix[i+2] * .11;
			
			if (grayscale>128) { 
				pix[i  ] = 255; 	// red
				pix[i+1] = 255; 	// green
				pix[i+2] = 255; 	// blue
			} else
			{
				pix[i  ] = 0; 	// red
				pix[i+1] = 0; 	// green
				pix[i+2] = 0; 	// blue
			}
		}
		context.putImageData(imgd, 0, 0);
	});
	
	$("#FindHorizontal").on('click', function ()
	{
		
		var imgd = context.getImageData(0, 0, pic_real_width, pic_real_height);
		var pix = imgd.data;
		
		var LineCounter = 10;
		var PixelCounter = 0;
		var BlackCounter = 0;
		
		var TotalValue = 0;
		var StartPixel = 0;
		var EndPixel   = 0;
		
		var WhitePixel = 0;
		
		var BlackLines = [];
		BlackLines.push(0);
		
		for (var i = (pic_real_width*LineCounter*4), n = pix.length-(pic_real_width*10*4); i < n; i += 4) 
		{
			PixelCounter++;
			
			if (PixelCounter>pic_real_width) { 
				
				TotalValue += BlackCounter;
				
				if  ( (BlackCounter>( (pic_real_width-StartPixel)*0.8)) && (BlackCounter>(pic_real_width*0.6)) )
				{
					
					EndPixel = pic_real_width;
					var xBlackPixel = 0;
					var xEndPixel = i;
					var xBeginLine = (i-(pic_real_width*LineCounter*4));
					
					while ( (xEndPixel>xBeginLine) && (xBlackPixel<3) ) {
						xEndPixel -= 4;
						EndPixel--;
						
						if ( (pix[xEndPixel]==0) || (pix[xEndPixel+(pic_real_width*4)]==0) || (pix[xEndPixel+(pic_real_width*4*2)]==0) || (pix[xEndPixel+(pic_real_width*4*3)]==0) )
						{
							xBlackPixel++;
						}
					}
					
					
					BlackLines.push( { "y" : LineCounter, "x1" : StartPixel, "x2" : EndPixel+xBlackPixel  } );

					context.beginPath();
					context.strokeStyle = "rgba(55,65,0,0.5)";
					context.fillStyle = "rgba(55,65,0,0.5)";
					context.lineWidth = 2;

					context.moveTo(StartPixel,LineCounter);
					context.lineTo(EndPixel+xBlackPixel,LineCounter);
					context.stroke();
/*
					context.beginPath();
					context.strokeStyle = "rgba(255,5,0,1)";
					context.fillStyle = "rgba(255,5,0,1)";
					context.lineWidth = 2;
					context.moveTo(StartPixel,LineCounter+2);
					context.lineTo(StartPixel,LineCounter+15);
					context.stroke();
					*/
				}
				
				var StartPixel = 0;
				var EndPixel   = 0;

				var WhitePixel = 0;
				
				PixelCounter=1;
				LineCounter++; 
				BlackCounter = 0;
			}
			
			if ( (pix[i]==0) || (pix[i+(pic_real_width*4)]==0) || (pix[i+(pic_real_width*4*2)]==0) || (pix[i+(pic_real_width*4*3)]==0) )
			{
				BlackCounter++;
				WhitePixel = 0;
				if (StartPixel==0) { StartPixel=PixelCounter; }
			} else
			{
				WhitePixel++;
				if ( ((WhitePixel>10) && (BlackCounter<50)) || (WhitePixel>20) && (BlackCounter<250)) { StartPixel=0; }
			}
		}
	});
	
	
	
	$("#ShowDensity").on('click', function ()
	{
		var imgd = context.getImageData(0, 0, pic_real_width, pic_real_height);
		var pix = imgd.data;
		var LineCounter = 0;
		var PixelCounter = 0;
		var BlackCounter = 0;
		
		var TotalValue = 0;
		
		for (var i = 0, n = pix.length; i < n; i += 4) 
		{
			PixelCounter++;
			
			if (PixelCounter>pic_real_width) { 
				
				TotalValue += BlackCounter;
				context.beginPath();
				context.strokeStyle = "rgba(255,165,0,0.5)";
				context.fillStyle = "rgba(255,165,0,0.5)";
				context.lineWidth = 1;
				
				context.moveTo(0,LineCounter);
				context.lineTo(BlackCounter,LineCounter);
				context.stroke();
				//console.log(BlackCounter);
				
				PixelCounter=1;
				LineCounter++; 
				BlackCounter = 0;
			}
			
			if (pix[i]==0)
			{
				BlackCounter++;
			}
		}
		TotalValue = TotalValue / pic_real_height;
		context.beginPath();
		context.strokeStyle = "rgba(155,65,0,0.5)";
		context.fillStyle = "rgba(155,65,0,0.5)";
		context.lineWidth = 2;
		
		context.moveTo(TotalValue,0);
		context.lineTo(TotalValue,pic_real_height);
		context.stroke();

		context.beginPath();
		context.strokeStyle = "rgba(55,5,0,0.5)";
		context.fillStyle = "rgba(55,5,0,0.5)";
		context.lineWidth = 2;
		
		context.moveTo(TotalValue/2,0);
		context.lineTo(TotalValue/2,pic_real_height);
		context.stroke();
		
	});

	
	
		
});