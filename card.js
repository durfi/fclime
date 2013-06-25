goog.provide('freecell.Card');

goog.require('lime.Sprite');
goog.require('lime.fill.Frame');

freecell.Card = function(image, width, height, suit, value) {
	goog.base(this);
	this.setAnchorPoint(0, 0);
	this.setSize(width, height);
	this.suit = suit;
	this.value = value;
	
	// Create sprite from image
	var frame = new lime.fill.Frame(
			image, 
			value * (freecell.CARD_WIDTH-1),
			suit * freecell.CARD_HEIGHT, 
			freecell.CARD_WIDTH, freecell.CARD_HEIGHT);
	this.setFill(frame);
};
goog.inherits(freecell.Card, lime.Sprite);

freecell.Card.suits = new Array("C","H","S","D");
freecell.Card.values = new Array("A", "2", "3", "4", "5", "6", "7",
		"8", "9", "10", "J", "Q", "K");

freecell.Card.prototype.toString = function() {
	return freecell.Card.suits[this.suit] + freecell.Card.values[this.value];
}

freecell.Card.prototype.SetStack = function(stack) {
	this.stack = stack;
};

/**
 * Move the card to a given stack with animation.
 * @param {freecell.Stack} stack The stack to move to.
 */
freecell.Card.prototype.MoveToStack = function(stack) {
	// Calculate new place and move
	this.runAction(new lime.animation
		.MoveTo(goog.math.Coordinate.sum(
				stack.getPosition(),
				new goog.math.Coordinate(10, 10 + stack.Size() * freecell.STACK_GAP)
			)
		)
		.setDuration(0.3));

	// Store the relation
	stack.AddCard(this);
	this.SetStack(stack);
};

/**
 * Return a new card.
 * @param suit Suit of the card.
 * @param value Value of the card.
 * @returns {freecell.Card}
 */
freecell.Card.MakeCard = function(suit, value) {
	var card = new freecell.Card(
			freecell.CARD_IMAGE,
			100,
			140, 
			suit,
			value);
	goog.events.listen(card, ['mousedown','touchstart'], function(e){
		e.event.stopPropagation();
		
		// Is substack valid solitaire stack?
		if (!card.stack.CanMove(card)) {
			console.log("Cant move substack!");
			return;
		}
		
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
			// Draw the lowest card on top
			freecell.layer.setChildIndex(draggedCards[i],freecell.layer.getNumberOfChildren()-1);
		}

		// Every stack is a target:
		for (var i = 0; i < freecell.STACK_COUNT; i ++) {
			drags[0].addDropTarget(freecell.stacks[i]);
		}
		for (var i = 0; i < freecell.RESERVE_COUNT; i ++) {
			drags[0].addDropTarget(freecell.reserves[i]);
		}
		for (var i = 0; i < freecell.FOUNDATION_COUNT; i ++) {
			drags[0].addDropTarget(freecell.foundations[i]);
		}

		// Drop into target stack
		goog.events.listen(drags[0], lime.events.Drag.Event.DROP, function(e){
			// Disable default move animation
			e.stopPropagation();
			
			// Get the target stack
			var dropTarget = e.activeDropTarget;
			
			if (! dropTarget.IsValid(draggedCards)) {
				console.log("Invalid!");
				dropTarget = draggedCards[0].stack;
				console.log(freecell.log);
			} else {
				freecell.log.push(
					new freecell.LogEntry(draggedCards[0].stack,
						dropTarget,
						draggedCards[0])
				);
				freecell.undoLog.push(
					new freecell.LogEntry(draggedCards[0].stack,
						dropTarget,
						draggedCards[0])
				);
				console.log("Valid: "+draggedCards[0].stack.getName()+", "+draggedCards[0].toString()+" > "+dropTarget.getName());
			}
			
			// Move the cards!
			for (var i = 0; i < draggedCards.length; i ++) {
				draggedCards[i].MoveToStack(dropTarget);
			}
			
		}); // End of dropping to target stack
		
		// If not over stack
		goog.events.listen(drags[0], lime.events.Drag.Event.CANCEL, function(e){
			// Disable default move animation
			e.stopPropagation();
			
			if (draggedCards[0].stack == null)
				return;
			
			// Target is the old stack
			var dropTarget = draggedCards[0].stack;
			
			// Calculate old place and move
			for (var i = 0; i < draggedCards.length; i ++) {
				draggedCards[i].MoveToStack(dropTarget);
			}
		});
	});

	return card;
};
