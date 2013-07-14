goog.provide('freecell.Wonpanel');

goog.require('lime.Sprite');
goog.require('lime.Label');

/**
 * Creates the panel displaying congratulations.
 * @param width 
 * @param height
 * @param congrats {String} The text to display.
 * @returns {freecell.wonpanel}
 */
freecell.Wonpanel = function(width, height, congrats) {
	goog.base(this);
	this.setAnchorPoint(0, 0);
	this.setSize(width, height);
	this.setPosition((freecell.WIDTH-width)/2, (freecell.HEIGHT-height)/2);
	var label = new lime.Label().setSize(width, 80)
		.setText(congrats)
		.setFontSize(80)
		.setFontColor("#fff")
		.setAlign("center")
		.setPosition(width/2, height/2);
	this.appendChild(label);
};
goog.inherits(freecell.Wonpanel, lime.Sprite);