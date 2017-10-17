/**
 * Figures out the CSS to apply for a layout
 * @class
 * @param {object} settings
 * @param {[string=reflowable]} settings.layout
 * @param {[string]} settings.spread
 * @param {[int=800]} settings.minSpreadWidth
 * @param {[boolean=false]} settings.evenSpreads
 */
class Layout {
	constructor(settings) {
		this.settings = settings;
		this.name = settings.layout || "reflowable";
		this._spread = (settings.spread === "none") ? false : true;
		this._minSpreadWidth = settings.minSpreadWidth || 800;
		this._evenSpreads = settings.evenSpreads || false;

		if (settings.flow === "scrolled" ||
				settings.flow === "scrolled-continuous" ||
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

		this.props = {
			name: this.name,
			spread: this._spread,
			flow: this._flow,
			width: 0,
			height: 0,
			spreadWidth: 0,
			delta: 0,
			columnWidth: 0,
			gap: 0,
			divisor: 1
		};

	}

	/**
	 * Switch the flow between paginated and scrolled
	 * @param  {string} flow paginated | scrolled
	 */
	flow(flow) {
		if (typeof(flow) != "undefined") {
			if (flow === "scrolled" ||
					flow === "scrolled-continuous" ||
					flow === "scrolled-doc") {
				this._flow = "scrolled";
			} else {
				this._flow = "paginated";
			}
			this.props.flow = this._flow;
		}
		return this._flow;
	}

	/**
	 * Switch between using spreads or not, and set the
	 * width at which they switch to single.
	 * @param  {string} spread true | false
	 * @param  {boolean} min integer in pixels
	 */
	spread(spread, min) {

		if (spread) {
			this._spread = (spread === "none") ? false : true;
			this.props.spread = this._spread;
		}

		if (min >= 0) {
			this._minSpreadWidth = min;
		}

		return this._spread;
	}

	/**
	 * Calculate the dimensions of the pagination
	 * @param  {number} _width  [description]
	 * @param  {number} _height [description]
	 * @param  {number} _gap    [description]
	 */
	calculate(_width, _height, _gap){

		var divisor = 1;
		var gap = _gap || 0;

		//-- Check the width and create even width columns
		// var fullWidth = Math.floor(_width);
		var width = _width;

		var section = Math.floor(width / 12);

		var colWidth;
		var spreadWidth;
		var pageWidth;
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
			// width = width - gap;
			// colWidth = (width - gap) / divisor;
			// gap = gap / divisor;
			colWidth = (width / divisor) - gap;
			pageWidth = colWidth + gap;
		} else {
			colWidth = width;
			pageWidth = width;
		}

		if (this.name === "pre-paginated" && divisor > 1) {
			width = colWidth;
		}

		spreadWidth = (colWidth * divisor) + gap;

		delta = width;

		this.width = width;
		this.height = _height;
		this.spreadWidth = spreadWidth;
		this.pageWidth = pageWidth;
		this.delta = delta;

		this.columnWidth = colWidth;
		this.gap = gap;
		this.divisor = divisor;

		this.props.width = width;
		this.props.height = _height;
		this.props.spreadWidth = spreadWidth;
		this.props.pageWidth = pageWidth;
		this.props.delta = delta;

		this.props.columnWidth = colWidth;
		this.props.gap = gap;
		this.props.divisor = divisor;
	}

	/**
	 * Apply Css to a Document
	 * @param  {Contents} contents
	 * @return {[Promise]}
	 */
	format(contents){
		var formating;

		if (this.name === "pre-paginated") {
			formating = contents.fit(this.columnWidth, this.height);
		} else if (this._flow === "paginated") {
			formating = contents.columns(this.width, this.height, this.columnWidth, this.gap);
		} else { // scrolled
			formating = contents.size(this.width, null);
		}

		return formating; // might be a promise in some View Managers
	}

	/**
	 * Count number of pages
	 * @param  {number} totalWidth
	 * @return {number} spreads
	 * @return {number} pages
	 */
	count(totalLength, pageLength) {
		// var totalWidth = contents.scrollWidth();
		let spreads, pages;

		if (this.name === "pre-paginated") {
			spreads = 1;
			pages = 1;
		} else if (this._flow === "paginated") {
			pageLength = pageLength || this.delta;
			spreads = Math.ceil( totalLength / pageLength);
			pages = spreads * this.divisor;
		} else { // scrolled
			pageLength = pageLength || this.height;
			spreads = Math.ceil( totalLength / pageLength);
			pages = spreads;
		}

		return {
			spreads,
			pages
		};

	}
}

export default Layout;
