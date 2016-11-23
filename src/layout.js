var core = require('./core');

/**
 * Figures out the CSS to apply for a layout
 * @class
 * @param {object} settings
 * @param {[string=reflowable]} settings.layout
 * @param {[string]} settings.spread
 * @param {[int=800]} settings.minSpreadWidth
 * @param {[boolean=false]} settings.evenSpreads
 */
function Layout(settings){
	this.name = settings.layout || "reflowable";
	this._spread = (settings.spread === "none") ? false : true;
	this._minSpreadWidth = settings.minSpreadWidth || 800;
	this._evenSpreads = settings.evenSpreads || false;

	if (settings.flow === "scrolled-continuous" ||
			settings.flow === "scrolled-doc") {
		this._flow = "scrolled";
	} else {
		this._flow = "paginated";
	}


	this.width = 0;
	this.height = 0;
	this.spreadWidth = 0;
	this.delta = 0;

	this.columnWidth = 0;
	this.gap = 0;
	this.divisor = 1;
};

/**
 * Switch the flow between paginated and scrolled
 * @param  {string} flow paginated | scrolled
 */
Layout.prototype.flow = function(flow) {
	this._flow = (flow === "paginated") ? "paginated" : "scrolled";
}

/**
 * Switch between using spreads or not, and set the
 * width at which they switch to single.
 * @param  {string} spread true | false
 * @param  {boolean} min integer in pixels
 */
Layout.prototype.spread = function(spread, min) {

	this._spread = (spread === "none") ? false : true;

	if (min >= 0) {
		this._minSpreadWidth = min;
	}
}

/**
 * Calculate the dimensions of the pagination
 * @param  {number} _width  [description]
 * @param  {number} _height [description]
 * @param  {number} _gap    [description]
 */
Layout.prototype.calculate = function(_width, _height, _gap){

	var divisor = 1;
	var gap = _gap || 0;

	//-- Check the width and create even width columns
	var fullWidth = Math.floor(_width);
	var width = _width;

	var section = Math.floor(width / 8);

	var colWidth;
	var spreadWidth;
	var delta;

	if (this._spread && width >= this._minSpreadWidth) {
		divisor = 2;
	} else {
		divisor = 1;
	}

	if (this.name === "reflowable" && this._flow === "paginated" && !(_gap >= 0)) {
		gap = ((section % 2 === 0) ? section : section - 1);
	}

	if (this.name === "pre-paginated" ) {
		gap = 0;
	}

	//-- Double Page
	if(divisor > 1) {
		colWidth = (width - gap) / divisor;
	} else {
		colWidth = width;
	}

	if (this.name === "pre-paginated" && divisor > 1) {
		width = colWidth;
	}

	spreadWidth = colWidth * divisor;

	delta = (colWidth + gap) * divisor;

	this.width = width;
	this.height = _height;
	this.spreadWidth = spreadWidth;
	this.delta = delta;

	this.columnWidth = colWidth;
	this.gap = gap;
	this.divisor = divisor;
};

/**
 * Apply Css to a Document
 * @param  {Contents} contents
 * @return {[Promise]}
 */
Layout.prototype.format = function(contents){
	var formating;

	if (this.name === "pre-paginated") {
		formating = contents.fit(this.columnWidth, this.height);
	} else if (this._flow === "paginated") {
		formating = contents.columns(this.width, this.height, this.columnWidth, this.gap);
	} else { // scrolled
		formating = contents.size(this.width, null);
	}

	return formating; // might be a promise in some View Managers
};

/**
 * Count number of pages
 * @param  {number} totalWidth
 * @return {number} spreads
 * @return {number} pages
 */
Layout.prototype.count = function(totalWidth) {
	// var totalWidth = contents.scrollWidth();
	var spreads = Math.ceil( totalWidth / this.spreadWidth);

	return {
		spreads : spreads,
		pages : spreads * this.divisor
	};
};

module.exports = Layout;
