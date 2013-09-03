goog.provide('freecell.Textpanel');

goog.require('lime.Sprite');
goog.require('lime.Label');

/**
 * Creates the panel displaying a text message.
 * @param width 
 * @param height
 * @param text {String} The text to display.
 * @returns {freecell.Textpanel}
 */
freecell.Textpanel = function(width, height, text) {
	goog.base(this);
	this.setAnchorPoint(0, 0);
	this.setSize(width, height);
	this.setPosition((freecell.WIDTH-width)/2, (freecell.HEIGHT-height)/2);
	var label = new lime.Label().setSize(width, 80)
		.setText(text)
		.setFontSize(80)
		.setFontColor("#fff")
		.setAlign("center")
		.setPosition(width/2, height/2);
	this.appendChild(label);
	// Can't click through
	goog.events.listen(this, ['mousedown','touchstart'], function(e){
		e.event.stopPropagation();
	});
};
goog.inherits(freecell.Textpanel, lime.Sprite);