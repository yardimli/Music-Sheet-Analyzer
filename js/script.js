$(document).ready( function() 
{
	var pic_real_width, pic_real_height;
	var canvas = document.getElementById("area");
	var context = canvas.getContext("2d");

	$(".sheet-image").on('click', function ()
	{
		var image = this; //document.getElementById("canvasSource");
		var img = $(this)[0]; // $(this).attr('src'); // Get my img elem
		$("<img/>") // Make in memory copy of image to avoid css issues
			.attr("src", $(img).attr("src"))
			.load(function() {
				pic_real_width = this.width;   // Note: $(this).width() will not
				pic_real_height = this.height; // work for in memory images.


				$("#area").attr('width', pic_real_width);
				$("#area").attr('height', pic_real_height);

				context.drawImage(image, 0, 0);
			});
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
			/*
			pix[i  ] = grayscale; 	// red
			pix[i+1] = grayscale; 	// green
			pix[i+2] = grayscale; 	// blue
			*/
			// alpha
		}
		context.putImageData(imgd, 0, 0);
	});
	
	$("#FindRows").on('click', function ()
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