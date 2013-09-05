goog.provide("freecell.LogEntry");

freecell.LogEntry = function (code, descr) {
	this.code = code;
	this.descr = descr;
	this.time = (new Date()).getTime();
};

freecell.LogEntry.prototype.toJson = function () {
	return { code: this.code,
		descr: this.descr,
		time: this.time};
};

freecell.LogEntry.LogCode = {
	VALID_PLAY_TO_TABLEAU			: 201,
	VALID_PLAY_TO_RESERVE			: 202,
	VALID_PLAY_TO_FOUNDATIONS		: 203,
	VALID_PLAY_DOUBLE_RES     		: 205,
    VALID_PLAY_DOUBLE_FOUND			: 206,
	
	NEW_GAME						: 301,
	CLOSING_GAME					: 0,
	GAME_WON						: 306,
	UNDO							: 307,
	
	INVALID_PLAY					: 401,
	INVALID_PLAY_NOT_ON_CARD		: 0,
	INVALID_PLAY_SAME_PLACE			: 0,
	INVALID_PLAY_NOT_ENOUGH_FREE	: 408,
	
	INVALID_CLICK_NOT_ON_CARD		: 0,
	INVALID_PLAY_FROM_EMTPY_RES		: 0,
	INVALID_PLAY_FROM_FOUNDATIONS	: 0,
	INVALID_PLAY_INVALID_BELOW		: 0,
	INVALID_PLAY_DOUBLE_ON_FOUND	: 0

};