//set main namespace
goog.provide('freecell');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Label');
goog.require('lime.GlossyButton');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');
goog.require('freecell.Stack');
goog.require('freecell.Card');
goog.require('freecell.Deck');
goog.require('freecell.Reserve');
goog.require('freecell.Foundation');
goog.require('freecell.LogEntry');
goog.require('freecell.PlayEntry');
goog.require('freecell.Textpanel');
goog.require('goog.net.XhrIo');
goog.require('goog.json');
goog.require('goog.events');
goog.require("goog.structs.Map");
goog.require("goog.Uri.QueryData");

freecell.WIDTH = 1280;
freecell.HEIGHT = 768;

freecell.MARGIN_LEFT = 20;

freecell.STACK_COUNT = 8;
freecell.STACK_COLOR = '#007000';
freecell.STACK_GAP = 30;

freecell.RESERVE_COUNT = 4;
freecell.RESERVE_COLOR = '#007000';

freecell.FOUNDATION_COUNT = 4;
freecell.FOUNDATION_COLOR = '#00b000';

freecell.CARD_WIDTH = 224;
freecell.CARD_HEIGHT = 313;

freecell.CARD_SUITS = {
		CLUBS 	: 	0,
		DIAMONDS:	1,
		HEARTS	:	2,
		SPADES	:	3
};

freecell.CARD_IMAGE = 'assets/cards2.png';

if (typeof __ !== 'function') __ = function(_){return _;};

freecell.running = false;
freecell.firstNewGame = true;

freecell.startTime = 0;

freecell.replayLog = null;
freecell.replayIndex = 0;

freecell.newGameButton = function(params) {
	console.log("freecell.newGameButton");
	if (freecell.firstNewGame) {
		freecell.firstNewGame = false;
		$('#fcellGameContent').empty();
		freecell.start(params);
	} else {
		freecell.newGame(params);
	}
};

freecell.pause = function() {
	if (freecell.running) {
		freecell.running = false;
		if (freecell.m3w) {
			freecell.timer.pauseTime();
		}
		// Show the paused panel
		freecell.layer.setChildIndex(freecell.pausepanel,freecell.layer.getNumberOfChildren()-1);
		var fade = new lime.animation.FadeTo(1).setDuration(1);
		freecell.pausepanel.runAction(fade);
	}
};

freecell.resume = function() {
	if (!freecell.running) {
		freecell.running = true;
		if (freecell.m3w) {
			freecell.timer.startTime();
		}
		// Hide the paused panel
		var fade = new lime.animation.FadeTo(0).setDuration(1);
		freecell.pausepanel.runAction(fade);
	}
};

freecell.log = new Array();
// entry point
freecell.start = function(params){
	console.log("freecell.start");
	// Running or stopped status
	freecell.running = true;
	
	// M3W
	var director;
	if (typeof m3w === 'object') {
		// Running in framework environment
		freecell.m3w = true;
		// Register callback methods for the framework buttons
		m3w.setCallback('pause', freecell.pause);
		m3w.setCallback('resume', freecell.resume);
		m3w.setCallback('exit', freecell.postLog);

		this.timer = params.get('timer', 'object');
		
		// Render to the M3W container
		director = new lime.Director(document.getElementById('fcellGameContent'), freecell.WIDTH, freecell.HEIGHT);
	} else {
		// Standalone version -- without framework
		freecell.m3w = false;
		director = new lime.Director(document.body, freecell.WIDTH, freecell.HEIGHT);
	}
	freecell.director = director;
	
	director.makeMobileWebAppCapable();
	// director.setDisplayFPS(false);
	
	// Create loading scene
	var loadingScene = new lime.Scene;
	var loadingLabel = new lime.Label().setSize(freecell.WIDTH, 80)
		.setText('Loading game...')
		.setFontSize(80)
		.setFontColor("#fff")
		.setAlign("center")
		.setPosition(freecell.WIDTH / 2, freecell.HEIGHT / 2);
	loadingScene.appendChild(loadingLabel);
	

	// Create game scene
	var gameScene = new lime.Scene;
	this.layer = new lime.Layer().setPosition(10, 0);
	gameScene.appendChild(this.layer);
	
	// Create background
	var background = new lime.Sprite().setAnchorPoint(0,0).setPosition(0,0)
		.setSize(freecell.WIDTH, freecell.HEIGHT).setFill('#008300');
	this.layer.appendChild(background);
	
	// Create the buttons
	if (!freecell.m3w) {
		this.btnNewGame = new lime.GlossyButton("Új játék").setSize(120, 40).setPosition(1180, 740);
		goog.events.listen(this.btnNewGame,'click',function(e){
		    freecell.newGame();
		});
		this.layer.appendChild(this.btnNewGame);
	}
	
	this.btnUndo = new lime.GlossyButton(__("Undo")).setSize(120, 40).setPosition(1040, 740);
	goog.events.listen(this.btnUndo,'click',function(e){
	    freecell.undo();
	});
	this.layer.appendChild(this.btnUndo);
	
	// Listen for keyboard events
	goog.events.listen(this.layer, goog.events.EventType.KEYUP, function(ev) {
		console.log("Key:" + ev.event.keyCode);
		var keyCode = ev.event.keyCode;
		if (keyCode == 82) {
			// Display textarea with lightbox
			var html = $('<div align="center">');
			html.append('<h1>' + __('Insert replay text:')+'</h1><hr />');
			html.append('<textarea id="replayText">');
			html.append('<input type="button" value="Replay!" onClick="freecell.newReplay()">');
			html.append('</div>');
			$.lightbox(html, {
				'width'       : 640,
				'height'      : 480,
				'autoresize'  : true,
				'onClose' : function() {}
			});
		} else if (keyCode == 74) {
			freecell.doNextReplayMove();
		}
	});

	// Create the stacks
	this.stacks = new Array();
	for (var i = 0; i < freecell.STACK_COUNT; i ++) {
		this.stacks[i] = new freecell.Stack(i, 120, 500, freecell.STACK_COLOR)
			.setPosition(freecell.MARGIN_LEFT + i * 150, 200);
		this.layer.appendChild(this.stacks[i]);
	}
	
	// Create the free cells
	this.reserves = new Array();
	for (var i = 0; i < freecell.RESERVE_COUNT; i ++) {
		this.reserves[i] = new freecell.Reserve(i, 120, 160, freecell.RESERVE_COLOR)
			.setPosition(freecell.MARGIN_LEFT + i*150, 10);
		this.layer.appendChild(this.reserves[i]);
	}
	
	// Create the foundations
	this.foundations = new Array();
	for (var i = 0; i < freecell.FOUNDATION_COUNT; i ++) {
		this.foundations[i] = new freecell.Foundation(i, 120, 160, freecell.FOUNDATION_COLOR)
			.setPosition(freecell.MARGIN_LEFT + (i+freecell.RESERVE_COUNT)*150, 10);
		this.layer.appendChild(this.foundations[i]);
	}

	// Create the "game won!" panel. (don't show it yet!).
	this.wonpanel = new freecell.Textpanel(800, 400, "Congratulations!")
		.setFill("#cecece")
		.setOpacity(0);
	this.layer.appendChild(this.wonpanel);
	
	// Create the "game over!" panel. (don't show it yet!).
	this.overpanel = new freecell.Textpanel(freecell.WIDTH, freecell.HEIGHT, "Game over!")
		.setFill("#cecece")
		.setOpacity(0);
	this.layer.appendChild(this.overpanel);

	// Create the "game over!" panel. (don't show it yet!).
	freecell.pausepanel = new freecell.Textpanel(freecell.WIDTH, freecell.HEIGHT, "Game paused.")
		.setFill("#cecece")
		.setOpacity(0);
	this.layer.appendChild(freecell.pausepanel);
	
	// Loading scene while loading image
	var img = new lime.fill.Image(freecell.CARD_IMAGE);
	if (! img.isLoaded) {
		director.replaceScene(loadingScene);
		goog.events.listen(img, goog.events.EventType.LOAD, function() {
			console.log("Image loaded.");
			director.replaceScene(gameScene);
		});
	} else {
		director.replaceScene(gameScene);
	}
	
	freecell.newGame(params);
};

/**
 * Is the game won? (Are all cards in the foundations?)
 * If game is won show the congratulations panel!
 */
freecell.isWon = function() {
	var won = true;
	for (var i = 0; i < freecell.STACK_COUNT; i++) {
		if (freecell.stacks[i].isEmpty()) {
			continue;
		}
		if (freecell.stacks[i].CanMove(freecell.stacks[i].cards[0])) {
			continue;
		}
		won = false;
		break;
	}
	return won;
};

/**
 * If game is won, display congratulations.
 */
freecell.checkWon = function() {
	if (!freecell.isWon()) {
		return false;
	}
	// Log this event
	var logEntry = new freecell.LogEntry(freecell.LogEntry.LogCode.GAME_WON, null);
	freecell.log.push(logEntry.toJson());

	// Get the length of the game
	var time = new Date().getTime() - freecell.startTime;
	if (freecell.m3w) {
		freecell.timer.pauseTime();	
		time = freecell.timer.getTime();
	}

	// Display congratulations with $.lightbox
	var html = $('<div align="center">');
	html.append('<h1>' + __('Congratulations!')+'</h1><hr />');
	// html.append('<h1>' + __('Your new coins:') +' '+ result['score'] + '<img src="./res/coin.png" height="40"/></h1>');
	// html.append('<h2>' + __('Your coins in TOTAL:') +' '+ result['total'] + '<img src="./res/coin.png" height="30" /></h2>');
	html.append('<h3>' + __('Number of moves:') +' '+ freecell.undoLog.length + '</h3>');
	html.append('<h3>' + __('Elapsed time:') +' '+ (time/1000).toFixed(2) +' '+__('seconds') + '</h3>');
	html.append('</div>');
	$.lightbox(html, {
		'width'       : 640,
		'height'      : 480,
		'autoresize'  : true,
		'onClose' : function() {freecell.newGame(null);}
	});

	return true;
}

/**
 * Do a move given in a JSON object
 */
freecell.doJsonMove = function (json) {
	var fromType = json.from.substring(0,1);
	var fromNum = json.from.substring(1,2);
	var toType = json.to.substring(0,1);
	var toNum = json.to.substring(1,2);
	var num = json.num;

	var from;
	if (fromType == 't') {
		from = freecell.stacks[fromNum];
	} else {
		from = freecell.reserves[fromNum];
	}
	var to;
	if (toType == 't') {
		to = freecell.stacks[toNum];
	} else if (toType == 'f') {
		to = freecell.foundations[toNum];
	} else {
		to = freecell.reserves[toNum];
	}

	// Remove from stack
	var card;
	if (fromType == 'r') {
		card = from.TopCard();
	} else {
		card = from.cards[from.cards.length - num];
	}
	var cards = from.SubStack(card);

	console.log("from: " + from.getName() + ", to: " + to.getName() + ", cards: " + cards);

	// Draw these cards on top
	for(var i = 0; i < cards.length; i ++) {
		// Draw the lowest card on top
		freecell.layer.setChildIndex(cards[i],freecell.layer.getNumberOfChildren()-1);
	}

	// Move to destination
	for (var i = 0; i < cards.length; i ++) {
		cards[i].MoveToStack(to);
	}

	// Check if game is won
	freecell.checkWon();
}
freecell.doNextReplayMove = function() {
	if (freecell.replayLog == null) {
		return;
	}
	var move = freecell.replayLog[freecell.replayIndex++];
	freecell.doJsonMove(move);
}

/**
 * Undo last move
 */
freecell.undo = function () {
	if (this.undoLog == null) 
		return;
	if (this.undoLog.length == 0)
		return;
	if (freecell.isWon())
		return;
	
	var lastMove = this.undoLog.pop();
	var cards = lastMove.to.SubStack(lastMove.card);
	
	// Move the cards!
	for (var i = 0; i < cards.length; i ++) {
		this.layer.setChildIndex(cards[i],this.layer.getNumberOfChildren()-1);
		cards[i].MoveToStack(lastMove.from);
	}
	
	freecell.log.push( (new freecell.LogEntry(
			freecell.LogEntry.LogCode.UNDO,
			null)).toJson()
	);
};

/**
 * Send the log to the server
 */
freecell.postLog = function () {
	// When not running in the M3W environment,
	// post the log to own server.
	console.log(goog.json.serialize(freecell.log));
	if (!freecell.m3w) {
		try {
			if ( freecell.log.length != 0 ) {
				var request = new goog.net.XhrIo();
				
				var data = goog.Uri.QueryData.createFromMap(new goog.structs.Map({
					usr: googleclientid,
					msg: goog.json.serialize(freecell.log)
					}));
				
				goog.events.listen(request, 'complete', function() {
					console.log(request.getResponse());
				});
				request.send('update.php', 'POST', data.toString());
			}
		} catch (err) {
			console.log("Error while uploading log: " + err.message);
		}
	}
	// When running in M3W, give the log to the framework
	else {
		// m3w.log?
	}
};

/**
 * Start new game.
 */
freecell.newGame = function (params) {
	console.log("freecell.newGame");
	freecell.running = true;

	// Save the start time
	freecell.startTime = new Date().getTime();

	if (freecell.m3w) {
		freecell.timer.stopTime();
		freecell.timer.startTime();
	}

	// Send log to the server
	freecell.postLog();
	
	// Hide the game won panel
	this.wonpanel.setOpacity(0);
	// Hide the game over panel
	this.overpanel.setOpacity(0);
	// Hide the game paused panel
	this.pausepanel.setOpacity(0);
	
	// Create the log
	this.undoLog = new Array();
	freecell.log = new Array();
	
	// Create the stacks
	for (var i = 0; i < freecell.STACK_COUNT; i ++) {
		this.stacks[i].cards = new Array();
	}
	
	// Create the free cells
	for (var i = 0; i < freecell.RESERVE_COUNT; i ++) {
		this.reserves[i].card = null;
	}
	
	// Create the foundations
	for (var i = 0; i < freecell.FOUNDATION_COUNT; i ++) {
		this.foundations[i].cards = new Array();
	}
	
	// If this isn't the first game, delete the previous cards.
	if (this.deck != null) {
		for (var i = 0; i < this.deck.cards.length; i ++) {
			this.layer.removeChild(this.deck.cards[i]);
		}
	}
	
	// Create, shuffle and deal the deck
	this.deck = new freecell.Deck(this);
	var seed = 7921427;
	this.deck.Shuffle(seed);

	this.deck.Deal();
	
	var board = [];
	for(var i = 0; i < freecell.stacks.length; i ++ ) {
		var arr = [];
		for (var j = 0; j < freecell.stacks[i].cards.length; j ++) {
			arr.push(freecell.stacks[i].cards[j].toString());
		}
		board.push(arr);
	}

	freecell.log.push( (new freecell.LogEntry(
			freecell.LogEntry.LogCode.NEW_GAME,
			{"seed": seed, "board": board})).toJson()
			);
	console.log("New game. Seed: "+seed+".");
};

/**
 * Start new replay.
 * Gets the log from a textarea.
 * JSON format:
 * {"init": BOARDSTATE, "moves": [MOVE1, MOVE2, ...]}
 * where every MOVEn is a move in JSON format (see freecell.doJsonMove),
 * and BOARDSTATE is the initial state of the board (array of 8 arrays)
 */
freecell.newReplay = function () {
	console.log("freecell.newReplay");

	var json = $("#replayText").val();
	json = goog.json.parse(json);
	var initState = json.init;
	var moves = json.moves;
	
	// Create the stacks
	for (var i = 0; i < freecell.STACK_COUNT; i ++) {
		this.stacks[i].cards = new Array();
	}
	
	// Create the free cells
	for (var i = 0; i < freecell.RESERVE_COUNT; i ++) {
		this.reserves[i].card = null;
	}
	
	// Create the foundations
	for (var i = 0; i < freecell.FOUNDATION_COUNT; i ++) {
		this.foundations[i].cards = new Array();
	}
	
	// If this isn't the first game, delete the previous cards.
	if (this.deck != null) {
		for (var i = 0; i < this.deck.cards.length; i ++) {
			this.layer.removeChild(this.deck.cards[i]);
		}
	}
	
	// Create, shuffle and deal the deck
	this.deck = new freecell.Deck(this);

	// Custom deal:
	this.deck.customDeal(initState);

	freecell.replayLog = moves;
	freecell.replayIndex = 0;
};



//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('freecell.start', freecell.start);
goog.exportSymbol('freecell.newReplay', freecell.newReplay);
