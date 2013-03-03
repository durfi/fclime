goog.provide('freecell.Reserve');

goog.require('lime.Sprite');

/**
 * Creates a new reserve.
 * @param width 
 * @param height
 * @param color The color of the stack element in #00aaff format.
 * @returns {freecell.Reserve}
 */
freecell.Reserve = function(number, width, height, color) {
	goog.base(this);
	this.setAnchorPoint(0, 0);
	this.setSize(width, height);
	this.setFill(color);
	this.number = number;
	this.card = null;
	
	this.showDropHighlight = function(){
		this.runAction(new lime.animation.FadeTo(.2).setDuration(.3));
	};
	this.hideDropHighlight = function(){
		this.runAction(new lime.animation.FadeTo(1).setDuration(.1));
	};
		  
};
goog.inherits(freecell.Reserve, lime.Sprite);

/**
 * Get name of this stack.
 * @returns {String} 
 */
freecell.Reserve.prototype.getName = function() {
	return "r"+this.number;
};

/**
 * Is it valid to put the given card on the stack?
 * @param card
 * @returns {Boolean}
 */
freecell.Reserve.prototype.IsValid = function(cards) {
	if (this.card == null && cards.length == 1)
		return true;
	
	return false;
};

freecell.Reserve.prototype.CanMove = function(card) {
	return true;
};

/**
 * Return the top card of the stack. This doesn't remove the top card.
 * @returns {freecell.Card}
 */
freecell.Reserve.prototype.TopCard = function() {
	return this.card;
};

/**
 * Add card to the stack.
 * @param {freecell.Card} card
 */
freecell.Reserve.prototype.AddCard = function(card) {
	this.card = card;
};

/**
 * Removes a given cards from the stack;
 * @param {freecell.Card} card
 */
freecell.Reserve.prototype.RemoveCard = function(card) {
	if (this.card != card)
		return;
	
	this.card = null;
};

/**
 * Return the size of the stack (the number of cards in the stack).
 * @returns
 */
freecell.Reserve.prototype.Size = function() {
	return 0;
};

freecell.Reserve.prototype.SubStack = function(card) {
	if (this.card == card) {
		var arr = new Array();
		arr[0] = this.card;
		this.card = null;
		return arr;
	}
	return null;
};