goog.provide('freecell.Deck');

goog.require('seedrandom');

/**
 * Create and init the deck.
 * @param {freecel} fc The FreeCell object that creates the deck.
 * @returns {freecell.Deck}
 */
freecell.Deck = function(fc) {
	this.fc = fc;
	this.cards = new Array();
	
	this.CreateCards();
};

/**
 * Create the cards. This method doesn't draw anything
 */
freecell.Deck.prototype.CreateCards = function() {
	var i = 0;
	for (var suit = 0; suit < 4; suit ++) {
		for (var value = 0; value < 13; value ++) {
			this.cards[i++] = new freecell.Card.MakeCard(suit, value);
		}
	}
};

/**
 * Find a card by its string representation
 */
freecell.Deck.prototype.getCard = function(str) {
	for (var i = 0; i < this.cards.length; i ++) {
		var card = this.cards[i];
		if (card.toString() == str) {
			return card;
		}
	}
	console.log("Unable to find card: "+str);
	return null;
}

/**
 * Shuffle the deck with the given random seed;
 * @param seed
 */
freecell.Deck.prototype.Shuffle = function(seed) {
	if (seed != null) {
		Math.seedrandom(seed);
	} else {
		Math.seedrandom();
		seed = Math.floor((Math.random()*10000000)+1);
		Math.seedrandom(seed);
	}
	this.cards = shuffle(this.cards);
	Math.seedrandom();
	return seed;
};

/**
 * Deal the cards to the table stacks.
 */
freecell.Deck.prototype.Deal = function() {
	for (var i = 0; i < this.cards.length; i ++) {
		this.cards[i].setPosition(10, 10);
		this.fc.layer.appendChild(this.cards[i]);
		
		this.cards[i].MoveToStack(this.fc.stacks[i%this.fc.stacks.length]);
	}
};

/**
 * Deal the cards to the table stacks in the order given by
 * the 'board' attribute.
 */
freecell.Deck.prototype.customDeal = function(board) {
	console.log(board);
	for (var i = 0; i < board.length; i ++) {
		var stack = board[i];
		for (var j = 0; j < stack.length; j ++) {
			var cardStr = board[i][j];
			card = this.getCard(cardStr);
			card.setPosition(10, 10);
			this.fc.layer.appendChild(card);
			card.MoveToStack(this.fc.stacks[i]);
		}
	}
}

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
  for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x){};
  return o;
};