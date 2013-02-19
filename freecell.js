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

freecell.WIDTH = 1280;
freecell.HEIGHT = 768;

freecell.STACK_COUNT = 8;
freecell.STACK_COLOR = '#007000';
freecell.STACK_GAP = 30;

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
	
	// Create the deck
	this.deck = new freecell.Deck(this);
	this.deck.Shuffle();
	this.deck.Deal();
	
	// Create cards
	// var card1 = freecell.Card.makeCard(freecell.CARD_SUITS.CLUBS, 0).setAnchorPoint(0, 0).setPosition(0, 600);
	// var card2 = freecell.Card.makeCard(freecell.CARD_SUITS.HEARTS, 10).setAnchorPoint(0, 0).setPosition(150, 600);
	// layer.appendChild(card1);
	// layer.appendChild(card2);


	// Set active scene
	director.replaceScene(gameScene);

};



//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('freecell.start', freecell.start);
