

//--------------------------------------------------------------------------------

var workingImage;
var workingImageElem;
var pic_real_width, pic_real_height;
var BlackLines = [];

var LineSpacings = [];

var HorizontalBars = [];
var RotateValue = 0;
var canvas;
var context;


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

function refreshImage(xcontext,callback)
{
	
	$("<img/>") // Make in memory copy of image to avoid css issues
		.attr("src", $(workingImageElem).attr("src"))
		.load(function() {
			pic_real_width = this.width;   // Note: $(this).width() will not
			pic_real_height = this.height; // work for in memory images.


			$("#area").attr('width', pic_real_width);
			$("#area").attr('height', pic_real_height);
	
			xcontext.drawImage(workingImage, 0, 0);
			
			xcontext.save(); 
			xcontext.rotate(RotateValue*(Math.PI/180));

			xcontext.drawImage(workingImage, 0, 0);
			xcontext.restore();
			
			callback();
			
		});
}


function standardDeviation(values){
  var avg = average(values);

  var squareDiffs = values.map(function(value){
	var diff = value - avg;
	var sqrDiff = diff * diff;
	return sqrDiff;
  });

  var avgSquareDiff = average(squareDiffs);

  var stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}

function average(data){
  var sum = data.reduce(function(sum, value){
	return sum + value;
  }, 0);

  var avg = sum / data.length;
  return avg;
}	


//------------------------------
function FindHorizontal()
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

	BlackLines.length = 0;
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

					if ( (pix[xEndPixel]==0) || (pix[xEndPixel+(pic_real_width*4)]==0) )
					{
						xBlackPixel++;
					}
				}


				BlackLines.push( { y : LineCounter, x1 : StartPixel, x2 : EndPixel+xBlackPixel, ignoreLine:false  } );

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

		if ( (pix[i]==0) || (pix[i+(pic_real_width*4)]==0)  )
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

	//add one line at endo of document
	BlackLines.push( { y : pic_real_height, x1 : 0, x2 : pic_real_width, ignoreLine:true  } );

	//console.log(BlackLines);
	
}

//-------------------------------
function ReduceHorizontal()
{
	context.save(); 
	context.rotate(RotateValue*(Math.PI/180));

	context.drawImage(workingImage, 0, 0);
	context.restore();

	//BlackLines.push( { "y" : LineCounter, "x1" : StartPixel, "x2" : EndPixel+xBlackPixel, "ignore":0  } );


	var StartGroup = -1;
	var EndGroup = -1;
	for (var i=0; i<BlackLines.length-1; i++)
	{
		if (BlackLines[i].y == BlackLines[i+1].y-1)
		{
			if (StartGroup==-1) { 
				StartGroup = i; 
//					console.log("Start Group:"+i); 
			}

			if (StartGroup>=0) { 
				EndGroup = i; 
			//	console.log("End Group:"+i); 
			}
		} else
		{
			if (StartGroup>=0)
			{
				EndGroup = i; 
//					console.log("End Group:"+i);

				for (var j=0; j<(EndGroup-StartGroup+1); j++)
				{
					BlackLines[(StartGroup+j)].ignoreLine = true;
				//	console.log("ignore:"+(StartGroup+j)+" "+BlackLines[StartGroup+j].y);
				}

				if (EndGroup>StartGroup) {
					MiddleY = Math.floor( (EndGroup-StartGroup+1) / 2);
				} else
				{
					MiddleY = 0;
				}

//					console.log("middle:"+(StartGroup+ MiddleY)+" "+BlackLines[StartGroup+ MiddleY].y);

				BlackLines[ (StartGroup+ MiddleY) ].ignoreLine = false;

				var StartGroup = -1;
				var EndGroup = -1;
			}

		}
	}

	for (var i=1; i<BlackLines.length; i++)
	{
		if (!BlackLines[i].ignoreLine)
		{
			context.beginPath();
			context.strokeStyle = "rgba(55,65,0,0.5)";
			context.fillStyle = "rgba(55,65,0,0.5)";
			context.lineWidth = 1;

			context.moveTo(BlackLines[i].x1,BlackLines[i].y);
			context.lineTo(BlackLines[i].x2+20,BlackLines[i].y);
			context.stroke();

			context.fillText(BlackLines[i].y, BlackLines[i].x1-20,BlackLines[i].y);
//				console.log("draw line:"+i+" "+BlackLines[i].y);
		}
	}
}


//----------------------------
function GroupHorizontal()
{
	context.save(); 
	context.rotate(RotateValue*(Math.PI/180));

	context.drawImage(workingImage, 0, 0);
	context.restore();

	//BlackLines.push( { "y" : LineCounter, "x1" : StartPixel, "x2" : EndPixel+xBlackPixel, "ignore":0  } );


	var StartGroup = -1;
	var EndGroup = -1;

	var LastSpaceing = 0;
	var NumLines = 0;
	var LastArrayPos = 0;

	LineSpacings.length = 0;

	for (var i=1; i<BlackLines.length-1; i++)
	{
		if (!BlackLines[i].ignoreLine)
		{

			if (LastArrayPos==0) {
				LastArrayPos = i;
			} else
			{
				LineSpacings.push( (BlackLines[i].y-BlackLines[LastArrayPos].y)  );

				console.log("draw line:"+i+" "+BlackLines[i].y+" "+(BlackLines[i].y-BlackLines[LastArrayPos].y));

				LastArrayPos = i;
			}
		}
	}


	var xDeviation = standardDeviation(LineSpacings);

	console.log("standardDeviation: "+xDeviation);

	LastArrayPos = 0;
	var NewSetTop = 0;

	var NewSetBottom = 0;

	HorizontalBars.length =0;

	for (var i=1; i<BlackLines.length-1; i++)
	{
		if (!BlackLines[i].ignoreLine)
		{

			if (LastArrayPos==0) {
				LastArrayPos = i;
				NewSetTop = i;
			} else
			{
				var spaceingY = (BlackLines[i].y-BlackLines[LastArrayPos].y);

				if (spaceingY>xDeviation) {

					//save old set box

					var MinX = pic_real_width;
					var MaxX = 0;
					var XNumLines = 0;
					for (var i2 = NewSetTop; i2<NewSetBottom; i2++)
					{
						if (BlackLines[i2].x1<MinX) { MinX = BlackLines[i2].x1; }
						if (BlackLines[i2].x2>MaxX) { MaxX = BlackLines[i2].x2; }
						XNumLines++;
					}

					if (XNumLines>2) //save if more than 2 lines normally it should be 5 but 2 could work too if some were not detected
					{
						HorizontalBars.push({ SetTop : NewSetTop, SetBottom : NewSetBottom, 
											TopPos: BlackLines[NewSetTop].y, LeftPos : MinX, HeightX : BlackLines[NewSetBottom].y-BlackLines[NewSetTop].y, WidthX : MaxX-MinX });
					}


					console.log("NEW SET");
					NewSetTop = i;
				} else
				{
					NewSetBottom = i;
				}

				console.log("draw line:"+i+" "+BlackLines[i].y+" "+(BlackLines[i].y-BlackLines[LastArrayPos].y));

				LastArrayPos = i;
			}
		}
	}

	//save last set


	var MinX = pic_real_width;
	var MaxX = 0;
	var XNumLines = 0;
	for (var i2 = NewSetTop; i2<NewSetBottom; i2++)
	{
		if (BlackLines[i2].x1<MinX) { MinX = BlackLines[i2].x1; }
		if (BlackLines[i2].x2>MaxX) { MaxX = BlackLines[i2].x2; }
		XNumLines++;
	}

	if (XNumLines>2) //save if more than 2 lines normally it should be 5 but 2 could work too if some were not detected
	{
		HorizontalBars.push({ SetTop : NewSetTop, SetBottom : NewSetBottom, 
							TopPos: BlackLines[NewSetTop].y, LeftPos : MinX, HeightX : BlackLines[NewSetBottom].y-BlackLines[NewSetTop].y, WidthX : MaxX-MinX });
	}

	for (var i=0; i<HorizontalBars.length; i++)
	{
		context.beginPath();
		context.rect(HorizontalBars[i].LeftPos, HorizontalBars[i].TopPos, HorizontalBars[i].WidthX, HorizontalBars[i].HeightX  );

		context.strokeStyle = "rgba(55,65,0,0.6)";
		context.fillStyle = "rgba(255,165,0,0.3)";
		context.lineWidth = 1;

		context.fill();
		context.stroke();
	}
	
}


///--------------------
function SobelHorizontal(callback)
{
	refreshImage(context, function() {

		var grayscale = Filters.filterImage(Filters.grayscale, canvas);

		var vertical = Filters.convolveFloat32(grayscale,
		  [ -1, 0, 1,
			-2, 0, 2,
			-1, 0, 1 ]);
		var horizontal = Filters.convolveFloat32(grayscale,
		  [ -1, -2, -1,
			 0,  0,  0,
			 1,  2,  1 ]);

		// Note that ImageData values are clamped between 0 and 255, so we need
		// to use a Float32Array for the gradient values because they
		// range between -255 and 255.

		var final_image = Filters.createImageData(vertical.width, vertical.height);

		for (var i=0; i<final_image.data.length; i+=4) {
			// make the vertical gradient red
			var v = Math.abs(vertical.data[i]);
			var h = Math.abs(horizontal.data[i]);

			final_image.data[i] = h; //v;
			final_image.data[i+1] = h; //v;
			final_image.data[i+2] = h; //v;
			final_image.data[i+3] = 255; //v;
		}

		context.putImageData(final_image, 0, 0);		

		var invert = Filters.filterImage(Filters.invert, canvas);
		context.putImageData(invert, 0, 0);		

		var invert = Filters.filterImage(Filters.threshold, canvas, 128);
		context.putImageData(invert, 0, 0);		
		
		callback();

	});
}


$(document).ready( function() 
{
	canvas = document.getElementById("area");
	context = canvas.getContext("2d");


	//----------------------------------------
	$(".sheet-image").on('click', function ()
	{
		RotateValue = 0;
		LoadImage(this,context,true);
	});

	
	//----------------------------------------
	$("#RotatePlus").on('click', function ()
	{
//		LoadImage(workingImage);
		RotateValue += 0.1;
		context.save(); 
		context.rotate(RotateValue*(Math.PI/180));

		context.drawImage(workingImage, 0, 0);
		context.restore();
	});


	//----------------------------------------
	$("#RotateMinus").on('click', function ()
	{
//		LoadImage(workingImage);
		RotateValue += -0.1;
		context.save(); 
		context.rotate(RotateValue*(Math.PI/180));

		context.drawImage(workingImage, 0, 0);
		context.restore();
	});
	
		
	//----------------------------------------
	$("#FindHorizontal").on('click', function ()
	{
		FindHorizontal();
	});

	
	//----------------------------------------
	$("#ReduceHorizontal").on('click', function ()
	{
		ReduceHorizontal();
	});
	
	
	//----------------------------------------
	$("#GroupHorizontal").on('click', function ()
	{
		GroupHorizontal();
	});
	


	
	
	
	//----------------------------------------
	$("#SobelHorizontal").on('click', function ()
	{
		SobelHorizontal();
	});
	   
	   
	//----------------------------------------
	$("#ColorHorizontal").on('click', function ()
	{
		SobelHorizontal( function(){
			FindHorizontal();
			ReduceHorizontal();
			GroupHorizontal();
			
		});
	});

		
	   
//---------------------------------------------------------------------------------------------------------------------------------

	//----------------------------------------
	$("#ColorVertical").on('click', function ()
	{
		refreshImage(context, function() {

			var grayscale = Filters.filterImage(Filters.grayscale, canvas);
			
			var vertical = Filters.convolveFloat32(grayscale,
			  [ -1, 0, 1,
				-2, 0, 2,
				-1, 0, 1 ]);
			var horizontal = Filters.convolveFloat32(grayscale,
			  [ -1, -2, -1,
				 0,  0,  0,
				 1,  2,  1 ]);

	//		var imgd = context.getImageData(0, 0, pic_real_width, pic_real_height);


			var final_image = Filters.createImageData(vertical.width, vertical.height);

			for (var i=0; i<final_image.data.length; i+=4) {
				var v = Math.abs(vertical.data[i]);
				var h = Math.abs(horizontal.data[i]);

				final_image.data[i] = v;
				final_image.data[i+1] = v;
				final_image.data[i+2] = v;
				final_image.data[i+3] = 255;
			}

			context.putImageData(final_image, 0, 0);		

			var invert = Filters.filterImage(Filters.invert, canvas);
			context.putImageData(invert, 0, 0);		

			var invert = Filters.filterImage(Filters.threshold, canvas, 128);
			context.putImageData(invert, 0, 0);		
			
			
			
			
			var imgd = context.getImageData(0, 0, pic_real_width, pic_real_height);
			var pix = imgd.data;
			
			for (var i=0; i<HorizontalBars.length; i++)
			{

				for (var j=HorizontalBars[i].LeftPos-10; j< HorizontalBars[i].LeftPos+HorizontalBars[i].WidthX+10; j++)
				{

					var BlackDots = 0;
					var WhiteDots = 0;

					for (var k=HorizontalBars[i].TopPos; k< HorizontalBars[i].TopPos+HorizontalBars[i].HeightX; k++)
					{
						var rpix = pix[ (k*4*pic_real_width) + (j*4)  + 0 ];
						var gpix = pix[ (k*4*pic_real_width) + (j*4)  + 1 ];
						var bpix = pix[ (k*4*pic_real_width) + (j*4)  + 2 ];

						if ( (rpix==0) && (gpix==0) && (bpix==0) ) { BlackDots++; } else { WhiteDots++; }
					}

					//found black line
					if ( (BlackDots>HorizontalBars[i].HeightX*0.95 ) )
					{

					} else
					{
						context.beginPath();
//						context.globalCompositeOperation = "destination-out";
//						context.globalAlpha = 1;
						context.strokeStyle = "rgba(255,255,255,0.7)";
						context.lineWidth = 1;
						
						context.moveTo(j+0.5, HorizontalBars[i].TopPos);
						context.lineTo(j+0.5, HorizontalBars[i].TopPos+HorizontalBars[i].HeightX);
						
						context.closePath();

						context.stroke();

					}
				}
			}
			
			for (var i=0; i<HorizontalBars.length; i++)
			{
				context.beginPath();
				context.rect(HorizontalBars[i].LeftPos, HorizontalBars[i].TopPos, HorizontalBars[i].WidthX, HorizontalBars[i].HeightX  );

				context.strokeStyle = "rgba(55,65,0,0.6)";
				context.fillStyle = "rgba(255,165,0,0.3)";
				context.lineWidth = 1;

				context.fill();
				context.stroke();
			}
			
			
		});
		

	});
	

	
});