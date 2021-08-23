(function($){
	$.fn.flexBackground = function(options){
	'use strict';

		/**------------------ SETTING PARAMETERS ------------------**/
		
		var height;
		var width;
		var birds = 5;
		var points = 5;
		var size = 15;
		var interval = 50;
		var color = "rgba(0, 0, 0, 1)"
		var velocity = 3;
		
		var config = {};
		if(options){
			$.extend(config, options);
		}
		
		
		
		
		/**------------------ BEGIN FUNCTION BODY ------------------**/
		
		
		
			var selector = $(this);
			var selectorCan = $(this).find("canvas");
			
			if(config.birds)
				points = parseInt(config.birds, 10);

			if(config.size)
				size = parseInt(config.size, 10);

			if(config.interval)
				interval = parseInt(config.interval, 10);

			if(config.velocity)
				velocity = parseInt(config.velocity, 10);

			if(config.color)
				color = config.color;

			
			
			/**------------------------------------------------  SETTING FUNCTIONS ------------------------------------------------- **/

			width = selector.width();
			height = selector.height();
			
			selectorCan.attr('height', height);
			selectorCan.attr('width', width);
			
			var canvas = selectorCan[0];
			var ctx = canvas.getContext("2d");

			var bird = new Array();
			
			function refresh(){
				width = selector.width();
				height = selector.height();
				
				selectorCan.attr('height', height);
				selectorCan.attr('width', width);

				for(var i = 0; i < points; i++){
					bird[i] = {posX:100, posY:100,wingUp : 0, wingStretch:1, size:15, speed :2, color:"rgba(0, 0, 0, 1)", rest:1};
					bird[i].posX = width*Math.random();
					bird[i].posY = (height - 50)*Math.random()/2 + 50;
					bird[i].size = size -(size/2)*Math.random();
					bird[i].speed = velocity - (1/3)*velocity*Math.random();
					bird[i].rest = 100*Math.random();
					bird[i].color = color;
				}

			}
			
			function createBird(birdId){
				
				var startX, startY, endX, endY;
							
				startX = bird[birdId].posX;
				startY = bird[birdId].posY;
				endX = startX + bird[birdId].size;
				endY = bird[birdId].posY;
				
				var wingStartX, wingStartY, wingEndX, wingEndY;
				var wingStartX2, wingStartY2, wingEndX2, wingEndY2;
				
				wingStartX = startX + (endX - startX)/2.5;
				wingStartY = startY;
				wingEndX = startX + (endX - startX)/1.5;
				wingEndY = startY - (endX - startX)*.8;

				wingStartX2 = startX + (endX - startX)/2.5;
				wingStartY2 = startY;
				wingEndX2 = startX + (endX - startX)/1.4;
				wingEndY2 = startY - (endX - startX)*.9;

				wingEndY = startY - ((endX - startX)*.8)*bird[birdId].wingStretch;
				wingEndY2 = startY - ((endX - startX)*.9)*bird[birdId].wingStretch;
				wingEndX = startX + (endX - startX)/1.5 - (endX - startX)*Math.abs(bird[birdId].wingStretch - 1)*.1;
				wingEndX2 = startX + (endX - startX)/1.4 + (endX - startX)*Math.abs(bird[birdId].wingStretch - 1)*.05;

				
				bird[birdId].rest++;

				if(bird[birdId].rest > 80){
					bird[birdId].wingStretch = .6;
					
					if(bird[birdId].rest > 100){
						bird[birdId].rest  = 1;
					}					
				}
				
				if(!bird[birdId].wingUp && bird[birdId].rest < 80){
					bird[birdId].wingStretch -= .4;
					if(bird[birdId].wingStretch <= -1){
						bird[birdId].wingUp = 1;
					}
				}		
				
				if(bird[birdId].wingUp && bird[birdId].rest < 80){
					bird[birdId].wingStretch += .4;
					if(bird[birdId].wingStretch >= 1){
						bird[birdId].wingUp = 0;
					}
				
				}
				
				ctx.fillStyle = bird[birdId].color;

				
				ctx.beginPath();
				
				ctx.moveTo(startX, startY);
				ctx.bezierCurveTo(startX + (endX-startX)/4 , startY + (endX-startX)/4, 
														startX + (endX-startX)/2, startY - (endX-startX)/3, 
														endX, endY);

				
				ctx.bezierCurveTo(endX - (endX - startX)/3, endY, 
													endX - (endX - startX)/2.4, startY + (endX - startX)/3, 
													startX + (endX-startX)/5, startY + (endX-startX)/7);

				
				ctx.bezierCurveTo(startX + (endX-startX)/5, startY + (endX-startX)/7 ,
														startX, startY + (endX-startX)/4 ,
														startX, startY);
				
				ctx.strokeStyle = "rgb(256, 256, 256)";

				ctx.closePath();
				ctx.fill();
				
				
				ctx.beginPath();
				
				ctx.moveTo(wingStartX, wingStartY);
				ctx.bezierCurveTo(wingStartX - (wingEndX - wingStartX), wingStartY - (wingStartY - wingEndY)/2,
														wingStartX + (wingEndX - wingStartX), wingStartY - (wingStartY - wingEndY)/1.5,
														wingStartX + (wingEndX - wingStartX)/2, wingEndY);
														
				ctx.bezierCurveTo(wingStartX + (wingEndX - wingStartX)*1.5, wingStartY - (wingStartY - wingEndY)/2,
														wingStartX + (wingEndX - wingStartX), wingStartY - (wingStartY - wingEndY)/1.5,
														wingEndX, wingStartY);
														
				ctx.lineTo(wingStartX, wingStartY);
														
				ctx.closePath();
				ctx.fill();

				
				ctx.beginPath();
				ctx.moveTo(wingStartX2, wingStartY2);
				ctx.bezierCurveTo(wingStartX2 - (wingEndX2 - wingStartX2), wingStartY2 - (wingStartY2 - wingEndY2)/2,
														wingStartX2 + (wingEndX2 - wingStartX2), wingStartY2 - (wingStartY2 - wingEndY2)/1.5,
														wingStartX2 + (wingEndX2 - wingStartX2)/2, wingEndY2);
														
				ctx.bezierCurveTo(wingStartX2 + (wingEndX2 - wingStartX2)*1.5, wingStartY2 - (wingStartY2 - wingEndY2)/2,
														wingStartX2 + (wingEndX2 - wingStartX2), wingStartY2 - (wingStartY2 - wingEndY2)/1.5,
														wingEndX2, wingStartY2);
														
				ctx.lineTo(wingStartX2, wingStartY2);										
				ctx.closePath();
				ctx.fill();
				
				bird[birdId].posX += bird[birdId].speed;
				
				if(bird[birdId].posX > width){
					bird[birdId].posX = 0;
				}
			
			}

						
			function setBackground(){
									
				ctx.clearRect(0, 0, width, height);
				
				for(var i = 0; i < points; i++)
					createBird(i);

			}
			refresh();
			setInterval(setBackground, interval);
		
			$(window).resize(function(){
				refresh();
			})
		
	}
})(jQuery)
