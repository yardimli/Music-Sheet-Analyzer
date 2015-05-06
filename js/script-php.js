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
var BlackLines = [];

var LineSpacings = [];

var HorizontalBars = [];

var RotateValue = 0;

$(document).ready( function() 
{
	$(".sheet-image").on('click', function ()
	{
		RotateValue = 0;
		console.log($(this).prop("src"));

		$("#CurrentImage").attr("src","functions.php?op=load&img="+$(this).prop("src"));
/*		
		$.get("functions.php?op=load&img="+$(this).prop("src"), function(data){
			console.log(data);
			$("#CurrentImage").attr("src",data);
		});
		*/
	});
	
	$("#RotatePlus").on('click', function ()
	{
		RotateValue += 0.1;
		$("#CurrentImage").attr("src","functions.php?op=rotate&value="+RotateValue);
		

	});

	$("#RotateMinus").on('click', function ()
	{
		RotateValue += -0.1;
		$("#CurrentImage").attr("src","functions.php?op=rotate&value="+RotateValue);
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
						
						if ( (pix[xEndPixel]==0) || (pix[xEndPixel+(pic_real_width*4)]==0) || (pix[xEndPixel+(pic_real_width*4*2)]==0) || (pix[xEndPixel+(pic_real_width*4*3)]==0) )
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

		//add one line at endo of document
		BlackLines.push( { y : pic_real_height, x1 : 0, x2 : pic_real_width, ignoreLine:true  } );
		
		//console.log(BlackLines);
	});
	
	$("#ReduceHorizontal").on('click', function ()
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
	});
	
	
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
	
	
	$("#GroupHorizontal").on('click', function ()
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
		
	});
	
	$("#FindVertical").on('click', function ()
	{
		
		var imgd = context.getImageData(0, 0, pic_real_width, pic_real_height);
		var pix = imgd.data;

		//b/w first
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
				if ( (BlackDots>HorizontalBars[i].HeightX*0.9 ) )
				{
					if (1==2)
					{
						context.beginPath();
						context.strokeStyle = "rgba(0,65,0,0.5)";
						context.fillStyle = "rgba(0,65,0,0.5)";
						context.lineWidth = 1;

						context.moveTo(j,HorizontalBars[i].TopPos-50);
						context.lineTo(j,HorizontalBars[i].TopPos+HorizontalBars[i].HeightX+50);
						context.stroke();
					}
					
					//look behind if white then mark it
					
					var BlackDots2 = 0;
					var WhiteDots2 = 0;
					var BlackLinesArray = [];
					BlackLinesArray.length = 0;

					for (var k=HorizontalBars[i].TopPos; k< HorizontalBars[i].TopPos+HorizontalBars[i].HeightX; k++)
					{
						var rpix = pix[ (k*4*pic_real_width) + ((j-1)*4)  + 0 ];
						var gpix = pix[ (k*4*pic_real_width) + ((j-1)*4)  + 1 ];
						var bpix = pix[ (k*4*pic_real_width) + ((j-1)*4)  + 2 ];

						if ( (rpix==0) && (gpix==0) && (bpix==0) ) { 
							BlackDots2++; 
							BlackLinesArray.push(1);
						} else { 
							WhiteDots2++; 
							BlackLinesArray.push(0);
						}
					}
					
					
				
					//look forward till no black lines
					var StillBlackLines=3;
					var TempXPlus = 0;
					while ( (StillBlackLines>0) && (TempXPlus<4) )
					{
						var BlackDots3 = 0;
						var WhiteDots3 = 0;
						TempXPlus++;

						for (var k=HorizontalBars[i].TopPos; k< HorizontalBars[i].TopPos+HorizontalBars[i].HeightX; k++)
						{
							var rpix = pix[ (k*4*pic_real_width) + ((j+TempXPlus)*4)  + 0 ];
							var gpix = pix[ (k*4*pic_real_width) + ((j+TempXPlus)*4)  + 1 ];
							var bpix = pix[ (k*4*pic_real_width) + ((j+TempXPlus)*4)  + 2 ];

							if ( (rpix==0) && (gpix==0) && (bpix==0) ) { BlackDots3++; } else { WhiteDots3++; }
						}
						if (WhiteDots3>HorizontalBars[i].HeightX*0.7) { StillBlackLines--; }
					}
					
					//now see if the black and white pixels match the one before the black line
					var MissMatch = 0;
					var ArrayPos = 0;
					for (var k=HorizontalBars[i].TopPos; k< HorizontalBars[i].TopPos+HorizontalBars[i].HeightX; k++)
					{
						var rpix = pix[ (k*4*pic_real_width) + ((j+TempXPlus)*4)  + 0 ];
						var gpix = pix[ (k*4*pic_real_width) + ((j+TempXPlus)*4)  + 1 ];
						var bpix = pix[ (k*4*pic_real_width) + ((j+TempXPlus)*4)  + 2 ];

						if ( (rpix==0) && (gpix==0) && (bpix==0) ) { 
							if (BlackLinesArray[ArrayPos]!=1) { MissMatch++; }
						} else { 
							if (BlackLinesArray[ArrayPos]!=0) { MissMatch++; }
						}
						ArrayPos++;
					}
					
					
					//now look for major white at end
					
					if ( (WhiteDots2>HorizontalBars[i].HeightX*0.7 ) && (WhiteDots3>HorizontalBars[i].HeightX*0.7 ) && (StillBlackLines==0) && 
							( MissMatch<10) ) { 
						
						
						context.fillText(MissMatch, j,HorizontalBars[i].TopPos-20);

						context.beginPath();
						context.strokeStyle = "rgba(0,65,0,0.5)";
						context.fillStyle = "rgba(0,65,0,0.5)";
						context.lineWidth = 1;

						context.moveTo(j-1,HorizontalBars[i].TopPos-20);
						context.lineTo(j-1,HorizontalBars[i].TopPos+HorizontalBars[i].HeightX+20);
						context.stroke();
						
						context.beginPath();
						context.strokeStyle = "rgba(0,65,0,0.5)";
						context.fillStyle = "rgba(0,65,0,0.5)";
						context.lineWidth = 1;

						context.moveTo(j+TempXPlus,HorizontalBars[i].TopPos-20);
						context.lineTo(j+TempXPlus,HorizontalBars[i].TopPos+HorizontalBars[i].HeightX+20);
						context.stroke();
						
					}
					//------------------

					
				} else
				
				{
					PrevFound = 0;
					
				}
				
			}
		}
		
//		context.putImageData(imgd, 0, 0);
		
		
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