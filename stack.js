goog.provide('freecell.Stack');

goog.require('lime.Sprite');

freecell.Stack = function(size_x, size_y, color) {
	goog.base(this);
	this.setAnchorPoint(0, 0);
	this.setSize(size_x, size_y);
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

freecell.Stack.prototype.AddCard = function(card) {
	this.cards[this.cards.length] = card;
};

freecell.Stack.prototype.Size = function() {
	return this.cards.length;
};

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
