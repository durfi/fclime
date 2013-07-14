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
goog.require('freecell.Wonpanel');

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

freecell.callNewGame = function() {
	freecell.newGame();
};

freecell.log = new Array();

// entry point
freecell.start = function(){
	// M3W
	var director;
	if (typeof m3w === 'object') {
		// Running in framework environment
		freecell.m3w = true;
		m3w.events.setCallback('start',freecell.callNewGame);
		director = new lime.Director(m3w.container, freecell.WIDTH, freecell.HEIGHT);
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
	}
	this.layer.appendChild(this.btnNewGame);
	this.btnUndo = new lime.GlossyButton("Visszavonás").setSize(120, 40).setPosition(1040, 740);
	goog.events.listen(this.btnUndo,'click',function(e){
	    freecell.undo();
	});
	this.layer.appendChild(this.btnUndo);
	
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
	this.wonpanel = new freecell.Wonpanel(800, 400, "Congratulations!")
		.setFill("#cecece")
		.setOpacity(0);
	this.layer.appendChild(this.wonpanel);
	
	// Start a new game
	freecell.newGame();
	
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

};

/**
 * Is the game won? (Are all cards in the foundations?)
 * If game is won show the congratulations panel!
 */
freecell.isWon = function() {
	for (var i = 0; i < freecell.FOUNDATION_COUNT; i++) {
		if (freecell.foundations[i].cards.length < 13) {
			console.log(i+" "+freecell.foundations[i].cards.length);
			return false;
		}
	}
	
	// Show the game won panel
	var fade = new lime.animation.FadeTo(1).setDuration(1);
	this.wonpanel.runAction(fade);
	
	// freecell.director.setPaused(true);
	
	return true;
};

/**
 * Undo last move
 */
freecell.undo = function () {
	if (this.undoLog == null) 
		return;
	if (this.undoLog.length == 0)
		return;
	
	var lastMove = this.undoLog.pop();
	var cards = lastMove.to.SubStack(lastMove.card);
	
	// Move the cards!
	for (var i = 0; i < cards.length; i ++) {
		this.layer.setChildIndex(cards[i],this.layer.getNumberOfChildren()-1);
		cards[i].MoveToStack(lastMove.from);
	}
};

/**
 * Start new game.
 */
freecell.newGame = function () {
	// Hide the game won panel
	this.wonpanel.setOpacity(0);
	
	// Create the log
	this.undoLog = new Array();
	
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
	this.deck.Shuffle();
	this.deck.Deal();
};

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('freecell.start', freecell.start);
