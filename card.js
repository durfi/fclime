goog.provide('freecell.Card');

goog.require('lime.Sprite');
goog.require('lime.fill.Frame');

freecell.Card = function(image, width, height, suit, value) {
	goog.base(this);
	this.setAnchorPoint(0, 0);
	this.setSize(width, height);
	
	// Create sprite from image
	var frame = new lime.fill.Frame(
			image, 
			value * freecell.CARD_WIDTH,
			suit * freecell.CARD_HEIGHT, 
			freecell.CARD_WIDTH, freecell.CARD_HEIGHT);
	this.setFill(frame);
}
goog.inherits(freecell.Card, lime.Sprite);

freecell.Card.prototype.SetStack = function(stack) {
	this.stack = stack;
}
