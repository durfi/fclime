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

freecell.STACK_COUNT = 3;
freecell.STACK_COLOR = '#0fe384';

freecell.CARD_COLOR = '#1651fa';
freecell.CARD_SIZE = 100;

// entry point
freecell.start = function(){

	var director = new lime.Director(document.body, 1000, 1000);
	director.makeMobileWebAppCapable();
	// director.setDisplayFPS(false);
	

	// Create game scene
	var gameScene = new lime.Scene;
	var layer = new lime.Layer().setPosition(100, 100);
	gameScene.appendChild(layer);
	
	// Create the stacks
	this.stacks = new Array();
	for (var i = 0; i < freecell.STACK_COUNT; i ++) {
		this.stacks[i] = new freecell.Stack(120, 500, freecell.STACK_COLOR).setPosition(i * 200, 0);
		layer.appendChild(this.stacks[i]);
	}
	
	// Create cards
	var card1 = makeCard().setAnchorPoint(0, 0).setPosition(0, 600);
	var card2 = makeCard().setAnchorPoint(0, 0).setPosition(150, 600);
	layer.appendChild(card1);
	layer.appendChild(card2);


	// Set active scene
	director.replaceScene(gameScene);

};

function makeCard() {
	var card = new freecell.Card(freecell.CARD_SIZE, freecell.CARD_SIZE, freecell.CARD_COLOR);
	goog.events.listen(card, 'mousedown', function(e){
		
		// Get dragged cards
		var draggedCards = new Array();
		if (card.stack != null) {
			draggedCards = card.stack.SubStack(card);
		} else {
			draggedCards[0] = card;
		}

		// Start dragging them
		var drags = new Array();
		for(var i = 0; i < draggedCards.length; i ++) {
			drags[i] = e.startDrag(false, null, draggedCards[i]);
		}

		// Add targets:
		for (var i = 0; i < freecell.STACK_COUNT; i ++) {
			drags[0].addDropTarget(freecell.stacks[i]);
		}

		e.event.stopPropagation();

		// Drop into target stack
		goog.events.listen(drags[0], lime.events.Drag.Event.DROP, function(e){
			// Disable default move animation
			e.stopPropagation();
			
			// Get the target stack
			var dropTarget = e.activeDropTarget;
			var targetSize = dropTarget.Size();
			
			console.log("dropped!");

			// Remove from previous and add to new stack
			for (var i = 0; i < draggedCards.length; i ++) {
				dropTarget.AddCard(draggedCards[i]);
				draggedCards[i].SetStack(dropTarget);
				
				// Calculate new place and move
				draggedCards[i].runAction(new lime.animation
					.MoveTo(goog.math.Coordinate.sum(
							dropTarget.getPosition(),
							new goog.math.Coordinate(10, 10 + (targetSize) * freecell.CARD_SIZE + i * freecell.CARD_SIZE)
						)
					)
					.setDuration(0.3));
			}
			

		});
	});

	return card;
};

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('freecell.start', freecell.start);
