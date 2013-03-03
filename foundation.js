goog.provide('freecell.Foundation');

goog.require('lime.Sprite');

/**
 * Creates a new Foundation.
 * @param width 
 * @param height
 * @param color The color of the stack element in #00aaff format.
 * @returns {freecell.Foundation}
 */
freecell.Foundation = function(number, width, height, color) {
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
goog.inherits(freecell.Foundation, lime.Sprite);

/**
 * Is it valid to put the given card on the stack?
 * @param card
 * @returns {Boolean}
 */
freecell.Foundation.prototype.IsValid = function(cards) {
	if (cards.length > 1)
		return false;
	var card = cards[0];
	
	// If foundation is empty
	if (this.cards.length == 0) {
		if (card.value == 0)
			return true;
	} else {
	// If not empty
		var top = this.TopCard();
		if (top.suit == card.suit && top.value == card.value - 1)
			return true;
	}
	return false;
};

freecell.Foundation.prototype.CanMove = function(card) {
	return false;
};

/**
 * Get name of this stack.
 * @returns {String} 
 */
freecell.Foundation.prototype.getName = function() {
	return "f"+this.number;
};

/**
 * Return the top card of the stack. This doesn't remove the top card.
 * @returns {freecell.Card}
 */
freecell.Foundation.prototype.TopCard = function() {
	return this.cards[this.cards.length-1];
};

/**
 * Add card to the stack.
 * @param {freecell.Card} card
 */
freecell.Foundation.prototype.AddCard = function(card) {
	this.cards[this.cards.length] = card;
};

/**
 * Removes a given cards from the stack;
 * @param {freecell.Card} card
 */
freecell.Foundation.prototype.RemoveCard = function(card) {
	return;
};

/**
 * Return the size of the stack (the number of cards in the stack).
 * @returns
 */
freecell.Foundation.prototype.Size = function() {
	return 0;
};

freecell.Foundation.prototype.SubStack = function(card) {
	return new Array(this.cards.pop());
};