goog.provide("freecell.PlayEntry");

goog.require("freecell.LogEntry");

freecell.PlayEntry = function (code, from, to, card, num) {
	this.code = code;
	this.from = from;
	this.to = to;
	this.card = card;
	this.num = num;
	this.time = (new Date()).getTime();
};
goog.inherits(freecell.PlayEntry, freecell.LogEntry);

freecell.PlayEntry.prototype.toJson = function () {
	return { "code": this.code,
		"from": this.from.getName(),
		"card": this.card.toString(),
		"to": this.to.getName(),
		"num": this.num,
		"time": this.time};
};