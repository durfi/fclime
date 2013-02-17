goog.provide('freecell.Card');

goog.require('lime.Circle');

freecell.Card = function(size_x, size_y, color) {
	goog.base(this);
	this.setAnchorPoint(0, 0);
	this.setSize(size_x, size_y);
	this.setFill(color);

}
goog.inherits(freecell.Card, lime.Circle);

freecell.Card.prototype.SetStack = function(stack) {
	this.stack = stack;
}
