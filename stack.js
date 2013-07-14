goog.provide('freecell.Stack');

goog.require('lime.Sprite');

/**
 * Creates a new stack.
 * @param number The number of this stack
 * @param width 
 * @param height
 * @param color The color of the stack element in #00aaff format.
 * @returns {freecell.Stack}
 */
freecell.Stack = function(number, width, height, color) {
	goog.base(this);
	this.setAnchorPoint(0, 0);
	this.setSize(width, height);
	this.setFill(color);
	this.number = number;
	this.cards = new Array();
	
	this.showDropHighlight = function(){
		this.runAction(new lime.animation.FadeTo(.2).setDuration(.3));
	};
	this.hideDropHighlight = function(){
		this.runAction(new lime.animation.FadeTo(1).setDuration(.1));
	};
		  
};
goog.inherits(freecell.Stack, lime.Sprite);

/**
 * Get name of this stack.
 * @returns {String} 
 */
freecell.Stack.prototype.getName = function() {
	return "t"+this.number;
};

/**
 * Is it valid to put the given card on the stack?
 * @param card
 * @returns {Boolean}
 */
freecell.Stack.prototype.IsValid = function(cards) {
	// Can't be moved if there aren't enough free places
	var numberOfMovedCards = cards.length;
	var emptyFreeCells = 0;
	for (var i = 0; i < freecell.reserves.length; i ++) {
		if (freecell.reserves[i].isEmpty()) {
			emptyFreeCells ++;
		}
	}
	var emptyStacks = 0;
	for (var i = 0; i < freecell.stacks.length; i ++) {
		if (freecell.stacks[i].isEmpty()) {
			emptyStacks ++;
		}
	}
	// Current stack doesn't count as an empty stack!
	if (this.cards.length == 0)
		emptyStacks --;
	// Stack the cards are dragged from doesn't count as an empty stack!
	console.log("ennyi maradt: "+cards[0].stack.cards.length);
	if (cards[0].stack.isEmpty())
		emptyStacks --;
	// (number of movable cards <= (1 + number of empty freecells) * 2 ^ (number of empty columns)
	if (numberOfMovedCards > (1+emptyFreeCells)*(Math.pow(2,emptyStacks)))
		return false;
	
	// Valid if the stack is empty
	if (this.cards.length == 0)
		return true;
	
	// Valid if the color is different and the value is one less
	var card = cards[0];
	var top = this.TopCard();
	if ((top.suit % 2) != (card.suit % 2)
			&& top.value == card.value + 1) {
		return true;
	}
	
	// Otherwise its invalid
	return false; 
};

/**
 * Can the given card and it's substack be moved from the stack?
 * @param card
 * @returns {Boolean}
 */
freecell.Stack.prototype.CanMove = function(card) {
	var index = this.cards.indexOf(card);
	if (index < 0)
		return false;
	
	// Can't be moved if it's substack isn't correct
	while (index < this.cards.length - 1) {
		if (this.cards[index + 1].suit % 2 == this.cards[index].suit % 2
				|| this.cards[index + 1].value != this.cards[index].value - 1) {
			return false;
		}
		index ++;
	}
	
	// Otherwise it can be moved
	return true;
};

/**
 * Return the top card of the stack. This doesn't remove the top card.
 * @returns {freecell.Card}
 */
freecell.Stack.prototype.TopCard = function() {
	return this.cards[this.cards.length-1];
};

/**
 * Add card to the stack.
 * @param {freecell.Card} card
 */
freecell.Stack.prototype.AddCard = function(card) {
	this.cards[this.cards.length] = card;
};

/**
 * Return the size of the stack (the number of cards in the stack).
 * @returns
 */
freecell.Stack.prototype.Size = function() {
	return this.cards.length;
};

/**
 * Removes a given cards from the stack;
 * @param {freecell.Card} card
 */
freecell.Stack.prototype.RemoveCard = function(card) {
	if (this.cards.indexOf(card) < 0)
		return;
	
	this.cards.splice(this.cards.indexOf(card), 1);
};

/**
 * Returns (and removes) the substack starting with the given card.
 *
 * @param {freecell.Card} card The first card of the substack;
 * @return {Array.<freecell.Card>} The substack. Null if card was not found in the
 * stack.
 */
freecell.Stack.prototype.SubStack = function(card) {
	var index = this.cards.indexOf(card);
	if (index < 0)
		return null;
	
	return this.cards.splice(index, this.cards.length - index);
};

freecell.Stack.prototype.isEmpty = function() {
	if (this.cards.length == 0) {
		return true;
	}
	return false;
};