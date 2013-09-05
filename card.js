goog.provide('freecell.Card');

goog.require('lime.Sprite');
goog.require('lime.fill.Frame');
goog.require("freecell.LogEntry");

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
};

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
 * This function is called when there was a double click
 * (or now actually a single click) on a card. This moves the card to
 * the foundations or to the reserves if poissible.
 */
freecell.Card.prototype.playDoubleClick = function() {
	// Create an array from the card, so we can call stack.IsValid()
	var  card = this;

	if (card.stack instanceof freecell.Foundation) {
		// TODO: log this event!
		console.log("from found");
		return;
	}

	var fromReserve = false;
	if (card.stack instanceof freecell.Reserve) {
		fromReserve = true;
		code = freecell.LogEntry.LogCode.VALID_PLAY_DOUBLE_RES;
	}

	var cards = [card];
	if (card.stack.TopCard() != card) {
		// Click was not on top card
		console.log("not top card");
		return;
	}

	// Can it be moved?
	var target = null;
	for (var i = 0; i < freecell.RESERVE_COUNT; i ++) {
		if (freecell.reserves[i].IsValid(cards) == 0) {
			target = freecell.reserves[i];
			break;
		}
	}

	for (var i = 0; i < freecell.FOUNDATION_COUNT; i ++) {
		if (freecell.foundations[i].IsValid(cards) == 0) {
			target = freecell.foundations[i];
			break;
		}
	}
	if (target == null) {
		// Can't be moved, so do nothing
		// TODO: log this event!
		return;
	}

	// TODO: LOGGING AND UNDO, DONT LET MOVE FROM RESERVE OR FOUNDATION
	if (fromReserve && target instanceof freecell.Reserve) {
		// todo: log this event!
		console.log("to reserve");
		return;
	}

	var code = freecell.LogEntry.LogCode.VALID_PLAY_DOUBLE_RES;
	if (target instanceof freecell.Foundation) {
		code = freecell.LogEntry.LogCode.VALID_PLAY_DOUBLE_FOUND;
	}

	var logEntry = new freecell.PlayEntry( code,
		card.stack,
		target,
		card);
	freecell.log.push(logEntry.toJson());
	freecell.undoLog.push(logEntry);

	// Remove from stack
	cards = card.stack.SubStack(card);

	// Draw this card on top
	freecell.layer.setChildIndex(card,freecell.layer.getNumberOfChildren()-1);

	// Move to destination
	cards[0].MoveToStack(target);
}

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
		var moved = false;
		e.swallow(['mousemove', 'touchmove'], function(e) {
			// Start dragging the first time it is moved
			if (!moved) {
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
					
					// Is the move valid or not?
					var valid = dropTarget.IsValid(draggedCards);
					if (valid > 0) {
						// Invalid move
						var logEntry = new freecell.PlayEntry( valid,
								draggedCards[0].stack,
								dropTarget,
								draggedCards[0]);
						freecell.log.push(logEntry.toJson());
		//				console.log("Invalid ("+dropTarget.IsValid(draggedCards)+")!");
						dropTarget = draggedCards[0].stack;
						console.log(freecell.log);
					} else {
						// Valid move
						var code = freecell.LogEntry.LogCode.VALID_PLAY_TO_TABLEAU;
						if (dropTarget instanceof freecell.Reserve) {
							code = freecell.LogEntry.LogCode.VALID_PLAY_TO_RESERVE;
						}
						if (dropTarget instanceof freecell.Foundation) {
							code = freecell.LogEntry.LogCode.VALID_PLAY_TO_FOUNDATIONS;
						}
						var logEntry = new freecell.PlayEntry( code,
								draggedCards[0].stack,
								dropTarget,
								draggedCards[0]);
						freecell.log.push(logEntry.toJson());
						freecell.undoLog.push(logEntry);
		//				console.log("Valid: "+draggedCards[0].stack.getName()+", "+draggedCards[0].toString()+" > "+dropTarget.getName());
					}
					
					// Move the cards!
					for (var i = 0; i < draggedCards.length; i ++) {
						draggedCards[i].MoveToStack(dropTarget);
					}
					
					// Check if game is won
					if (freecell.isWon()) {
						// Display congratulations
						// Show the game won panel
						var fade = new lime.animation.FadeTo(1).setDuration(1);
						freecell.wonpanel.runAction(fade);
						
						var logEntry = new freecell.LogEntry(freecell.LogEntry.LogCode.GAME_WON, null);
						freecell.log.push(logEntry.toJson());
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
			}
			moved = true;
		});
		e.swallow(['mouseup', 'touchend'], function(e) {
			if (!moved) {
				card.playDoubleClick();
			}
		});

	});

	return card;
};
