//set main namespace
goog.provide('freecell');


//get requirements
goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Label');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');
goog.require('freecell.Stack');
goog.require('freecell.Card');
goog.require('freecell.Deck');
goog.require('freecell.Reserve');
goog.require('freecell.Foundation');

freecell.WIDTH = 1280;
freecell.HEIGHT = 768;

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

// entry point
freecell.start = function(){

	var director = new lime.Director(document.body, freecell.WIDTH, freecell.HEIGHT);
	director.makeMobileWebAppCapable();
	// director.setDisplayFPS(false);
	

	// Create game scene
	var gameScene = new lime.Scene;
	this.layer = new lime.Layer().setPosition(10, 0);
	gameScene.appendChild(this.layer);
	
	// Create the stacks
	this.stacks = new Array();
	for (var i = 0; i < freecell.STACK_COUNT; i ++) {
		this.stacks[i] = new freecell.Stack(120, 500, freecell.STACK_COLOR).setPosition(i * 150, 200);
		this.layer.appendChild(this.stacks[i]);
	}
	
	// Create the free cells
	this.reserves = new Array();
	for (var i = 0; i < freecell.RESERVE_COUNT; i ++) {
		this.reserves[i] = new freecell.Reserve(120, 160, freecell.RESERVE_COLOR).setPosition(i*150, 10);
		this.layer.appendChild(this.reserves[i]);
	}
	
	// Create the foundations
	this.foundations = new Array();
	for (var i = 0; i < freecell.FOUNDATION_COUNT; i ++) {
		this.foundations[i] = new freecell.Foundation(120, 160, freecell.FOUNDATION_COLOR)
			.setPosition((i+freecell.RESERVE_COUNT)*150, 10);
		this.layer.appendChild(this.foundations[i]);
	}
	
	// Create, shuffle and deal the deck
	this.deck = new freecell.Deck(this);
	this.deck.Shuffle();
	this.deck.Deal();

	// Set active scene
	director.replaceScene(gameScene);

};



//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('freecell.start', freecell.start);
