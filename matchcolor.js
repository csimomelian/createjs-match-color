
var canvas;
var stage;
var shapes;
var margin;
var slots;
var slotSize;
var puzzleContainer;
var score = 0;
var colors = ["#FF0000","#FF7F00","#0000FF","#8F00FF"];//Primary color used on the 4 shapes.


	const  INIT_GAME_MESSAGE = "Please match the paired colors by dragging the puzzle pieces";
	const  INIT_GAME_SUB_MESSAGE = "Click anywhere to begin";
	const  END_GAME_MESSAGE  = "Well done!";
	const TITLE_FONTSIZE = "2em";
	const LINE_HEIGHT = 36;
	const SECONDARY_FONTSIZE = "1.5em";




function init () {

		// body...
		canvas = document.getElementById('canvas');
		
		//Set canvas meassures 
		canvas.width = document.body.clientWidth || 550;
		canvas.height = document.body.clientHeight || 500;

		console.log('%c##### canvas width : ' + canvas.width , "color:red;");
		puzzleContainer = new createjs.Container();
		stage = new createjs.Stage(canvas);
		createjs.Ticker.setInterval(25);
		createjs.Ticker.setFPS(30);

		stage.snapToPixelEnabled = true;
		stage.snapToPixel = true;
		
		//Enable mouse over and touch event at the stage,  by default is disabled.
		stage.enableMouseOver(30);
		createjs.Touch.enable(stage);

		start();

		buildShapes();
		buildSlots();
		displayStartMsg();
}



function buildShapes () {

		var shape,slot;
		slots = new Array();
		shapes = new Array();

		slotSize  = Math.sqrt(Math.pow(stage.canvas.height, 2) + Math.pow(stage.canvas.width, 2))/16;
		margin = 15;
		
		var initX = Math.floor((stage.canvas.width/2)  - ( (slotSize+margin) * colors.length)/2 ) + margin/2;
		var initY = Math.floor((stage.canvas.height/2) - ( (slotSize+margin) * colors.length)/2 ) + margin/2;

		var startPosition = [{"positions": { "x" :initX ,"y" :initY}}]; 

		for (var i = 0; i < colors.length; i++) {
				
			shape = new createjs.Shape();
			shape.name = colors[i];
			shape.colour = colors[i];
			shape.keyindex = i;
			shape.graphics.beginFill(colors[i]);
			shape.graphics.drawRect(0,0,slotSize,slotSize);
			shape.homeX = startPosition[0].positions.x + ( i * ( slotSize + margin));
			shape.homeY = startPosition[0].positions.y
			shape.x = shape.homeX;
			shape.y = shape.homeY;
			// shape.regX = slotSize/2;
			// shape.regY = slotSize/2;
			shape.on('mousedown', handlerMouseDown);

			shape.addEventListener('pressup', handlerPressup);
			shape.on('pressmove', handlerPressMove);
			shapes.push( shape );
			puzzleContainer.addChild(shape);
			
			shape.cache(0,0,slotSize,slotSize);

			///slots 
			slot = new createjs.Shape();
			slot.name = colors[i];
			slot.colour = colors[i];
			slot.keyindex = i ;
			slot.graphics.beginStroke(colors[i]);
			slot.graphics.setStrokeStyle(5);
			slot.graphics.drawRect(0,0,slotSize,slotSize);
			// slot.regX = slotSize/2;
			// slot.regY = slotSize/2;
			slots.push(slot);
			console.log(slots);

			//puzzleContainer.addChild(slot);

		};

	score = slots.length;

}



function buildSlots () {

	var initX = Math.floor((stage.canvas.width/2)  - ( (slotSize+margin) * colors.length)/2 ) + margin/2;
	var initY =  Math.floor( (stage.canvas.height/2) - ( (slotSize+margin) * colors.length)/2 ) + margin/2;

	var startPosition = [{"positions": { "x" :initX ,"y" :initY}}];  
		var temp_slots = slots.slice(0);
		var r ;
		for (var i = 0; i < colors.length; i++) {
			r = Math.floor(Math.random() * temp_slots.length);
			temp_slots[r].homeX = startPosition[0].positions.x + ( i * ( slotSize + margin));
			temp_slots[r].x = temp_slots[r].homeX;
			temp_slots[r].y = stage.canvas.height -initY ;
			puzzleContainer.addChild(temp_slots[r]);
			temp_slots[r].cache(0,0,slotSize,slotSize);
			temp_slots.splice(r,1);

		};
		stage.addChild(puzzleContainer);
		
}


function handlerMouseDown(event) {

	event.currentTarget.offset = {x: event.currentTarget.x - event.stageX, y: event.currentTarget.y - event.stageY};
}

function handlerPressMove(event) {

	puzzleContainer.setChildIndex(event.currentTarget, puzzleContainer.getNumChildren() - 1); // lo usamos para poner siempre la posicion z del shape al seleccionarlo y siempre esté por encima del resto.
			
	event.currentTarget.x = event.stageX + event.currentTarget.offset.x;
	event.currentTarget.y = event.stageY + event.currentTarget.offset.y;

}



function handlerPressup(event){

	console.log("Pressup");

	event.currentTarget.x = event.stageX + event.currentTarget.offset.x;
	event.currentTarget.y = event.stageY + event.currentTarget.offset.x;

	var currentPosition = [{"x":event.currentTarget.x,"y": event.currentTarget.y}];
	var shape = event.target;

	var slot  = slots[shape.keyindex];
	var slot_color = slots[shape.keyindex].colour;

	console.log(slotSize);

	if ( Math.floor(currentPosition[0].x + slotSize ) >  Math.floor(slot.x)  
		&& Math.floor(currentPosition[0].x) <=  (Math.floor(slot.x + slotSize) )  
		&& Math.floor(currentPosition[0].y + slotSize ) >  Math.floor(slot.y )  
		&& Math.floor(currentPosition[0].y) <=  (Math.floor(slot.y + slotSize) )) {

		//console.log('X -Y DENTRO DEL CUADRANTE DEL SIZE DEL SLOT/4');
		console.log("MATCH COLOR");
		animateShape( slot , shape , true );
		score--;
		console.log("score " + score)
		if (score == 0 ) {
			displayEndGameMsg();
		}
	}

	else{

		animateShape( slot , shape , false );
	}

}

function animateShape( _slot, _shape , _status ){

	(true === _status) ? ( endPosition = [{"x" : _slot.x ,"y" : _slot.y }] , _shape.removeAllEventListeners() ) : (endPosition = [{"x" : _shape.homeX , "y" : _shape.homeY}], _shape.mouseEnabled = false )

	createjs.Tween.get(_shape, {loop: false , override :false}).to({alpha: 0.5 ,x : endPosition[0].x, y : endPosition[0].y }, 1750, createjs.Ease.elasticOut).to({alpha: 1 }).call(function(){ if (!_status){_shape.mouseEnabled=true} });

}

function start () {

	createjs.Ticker.addEventListener("tick",stage);
	createjs.Ticker.addEventListener("tick", function(e){ stage.update();}); 

}

function displayStartMsg () {

	puzzleContainer.filters = [new createjs.BlurFilter(25, 25, 5), new createjs.ColorMatrixFilter(new createjs.ColorMatrix(60))];
	puzzleContainer.cache(0,0,stage.canvas.width,stage.canvas.height);
	//An a container is created that contains 

	var container = new createjs.Container();
	container.name = "displayStartMsgContainer";

	///draw a black square with opacity 
	var fadingRect = new createjs.Shape();
	fadingRect.graphics.beginFill("black").drawRect(0, 0, canvas.width, canvas.height);
	fadingRect.alpha = 0.81;

	//Text 1
	var startTaskText = new createjs.Text(INIT_GAME_MESSAGE, TITLE_FONTSIZE + " Arial", "white");
	startTaskText.lineWidth = document.body.clientWidth*(9/10);
	///set position text1
	startTaskText.lineHeight = LINE_HEIGHT;
	startTaskText.textAlign = "center";
	startTaskText.x = canvas.width/2;
	startTaskText.y = canvas.height/2 - startTaskText.getMeasuredHeight();

	//Text 2
	var nextText = new createjs.Text(INIT_GAME_SUB_MESSAGE, SECONDARY_FONTSIZE + " Arial", "white");
	nextText.lineWidth = document.body.clientWidth*(9/10);
	nextText.lineHeight = LINE_HEIGHT;
	nextText.textAlign = "center";
	nextText.x = canvas.width/2;
	nextText.y = canvas.height/2 + startTaskText.getMeasuredHeight()/2 + LINE_HEIGHT;

	//add display objects to the stage
	container.addChild(fadingRect,startTaskText,nextText);
	stage.addChild(container);

	fadingRect.addEventListener('click', function(evt) { 

		console.log(evt.target.name+" : "+evt.eventPhase+" : "+evt.currentTarget.name)
		stage.removeChild(container);///remove the curtain from the stage
		puzzleContainer.uncache(); //clean the blur effect of the circle container. 
			

	}, null, false, null, false);
		
}	

function displayEndGameMsg () {

	var container = new createjs.Container();
	//container.mouseChildren = false;
	container.name = "displayEndGameMsgContainer";
	
	var fadingRect = new createjs.Shape();
	fadingRect.name ="faddingrect";
	fadingRect.graphics.beginFill("black").drawRect(0, 0, canvas.width, canvas.height);
	fadingRect.alpha = 0.9;

	var completedText = new createjs.Text(END_GAME_MESSAGE, TITLE_FONTSIZE + " Arial", "white");
	completedText.name ="completedText";
	completedText.lineWidth = document.body.clientWidth*(9/10);
	completedText.textAlign = "center";
	completedText.lineHeight = LINE_HEIGHT;
	completedText.x = canvas.width/2;
	completedText.y = canvas.height/2 -completedText.getMeasuredHeight();
	
	var advanceText = new createjs.Text("RETRY", SECONDARY_FONTSIZE + " Arial", "white");
	advanceText.name ="advanceText";
	advanceText.lineWidth = document.body.clientWidth*(9/10);
	advanceText.textAlign = "center";
	//advanceText.textBaseline = "middle";
	advanceText.lineHeight = advanceText.getMeasuredHeight()*2;
	advanceText.x = canvas.width/2 ;
	advanceText.y = canvas.height/2 - advanceText.getMeasuredHeight()/2 + advanceText.getMeasuredLineHeight()*3;
	advanceText.regY = advanceText.getMeasuredHeight()/2;

	var nextRect = new createjs.Shape();
	nextRect.name ="nextRect";

	nextRect.graphics.beginStroke("white").beginFill("black").drawRect(advanceText.x - advanceText.getMeasuredWidth() * 2 , advanceText.y - advanceText.regY -3 , advanceText.getMeasuredWidth() *4  , advanceText.getMeasuredHeight());
	nextRect.alpha = 0.9;

	nextRect.addEventListener('click', function(evt) { 

		evt.stopPropagation();
		console.log("click");
		puzzleContainer.uncache();
		cleanStage();
		buildShapes();
		buildSlots();

		
	 },false);

	puzzleContainer.filters = [new createjs.BlurFilter(25, 25, 5), new createjs.ColorMatrixFilter(new createjs.ColorMatrix(60))];
	puzzleContainer.cache(0,0,stage.canvas.width,stage.canvas.height);
	container.addChild(fadingRect,completedText,nextRect,advanceText);
	stage.addChild(container);
	
}




function cleanStage ( ) {

	puzzleContainer.removeAllChildren();
	for (var i = stage.getNumChildren() - 1; i >= 0; i--) {
		
			stage.removeChildAt(i);
		
	};
}

window.onresize = function(){

	//reset canvas , radius circles meassures 
	canvas.width = document.body.clientWidth;
	canvas.height = document.body.clientHeight;

	console.log('resize');
	//Removing puzzle by child of the stage, except fpslabel.
	puzzleContainer.uncache()
	cleanStage();
	buildShapes();
	buildSlots();
	displayStartMsg();
}
