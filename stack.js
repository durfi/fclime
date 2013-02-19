goog.provide('freecell.Stack');

goog.require('lime.Sprite');

/**
 * Creates a new stack.
 * @param width 
 * @param height
 * @param color The color of the stack element in #00aaff format.
 * @returns {freecell.Stack}
 */
freecell.Stack = function(width, height, color) {
	goog.base(this);
	this.setAnchorPoint(0, 0);
	this.setSize(width, height);
	this.setFill(color);

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
 * Is it valid to put the given card on the stack?
 * @param card
 * @returns {Boolean}
 */
freecell.Stack.prototype.IsValid = function(card) {
	var top = this.TopCard();
	if ((top.suit % 2) != (card.suit % 2) 		// If the color is different
			&& top.value == card.value + 1) {	// and the value is one less
		return true;							// Then it's valid!
	}
	// Otherwise its invalid
	return false; 
};

freecell.Stack.prototype.CanMove = function(card) {
	var index = this.cards.indexOf(card);
	if (index < 0)
		return false;
	
	while (index < this.cards.length - 1) {
		if (this.cards[index + 1].suit % 2 == this.cards[index].suit % 2
				|| this.cards[index + 1].value != this.cards[index].value - 1) {
			return false;
		}
		index ++;
	}
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
 * @return {freecell.Stack} The substack. Null if card was not found in the
 * stack.
 */
freecell.Stack.prototype.SubStack = function(card) {
	var index = this.cards.indexOf(card);
	if (index < 0)
		return null;
	
	return this.cards.splice(index, this.cards.length - index);
};
