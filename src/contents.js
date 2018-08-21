import EventEmitter from "event-emitter";
import {isNumber, prefixed, borders, defaults} from "./utils/core";
import EpubCFI from "./epubcfi";
import Mapping from "./mapping";
import {replaceLinks} from "./utils/replacements";
import { EPUBJS_VERSION, EVENTS, DOM_EVENTS } from "./utils/constants";

const hasNavigator = typeof (navigator) !== "undefined";

const isChrome = hasNavigator && /Chrome/.test(navigator.userAgent);
const isWebkit = hasNavigator && !isChrome && /AppleWebKit/.test(navigator.userAgent);

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

/**
	* Handles DOM manipulation, queries and events for View contents
	* @class
	* @param {document} doc Document
	* @param {element} content Parent Element (typically Body)
	* @param {string} cfiBase Section component of CFIs
	* @param {number} sectionIndex Index in Spine of Conntent's Section
	*/
class Contents {
	constructor(doc, content, cfiBase, sectionIndex) {
		// Blank Cfi for Parsing
		this.epubcfi = new EpubCFI();

		this.document = doc;
		this.documentElement =  this.document.documentElement;
		this.content = content || this.document.body;
		this.window = this.document.defaultView;

		this._size = {
			width: 0,
			height: 0
		};

		this.sectionIndex = sectionIndex || 0;
		this.cfiBase = cfiBase || "";

		this.epubReadingSystem("epub.js", EPUBJS_VERSION);

		this.listeners();
	}

	/**
		* Get DOM events that are listened for and passed along
		*/
	static get listenedEvents() {
		return DOM_EVENTS;
	}

	/**
		* Get or Set width
		* @param {number} [w]
		* @returns {number} width
		*/
	width(w) {
		// var frame = this.documentElement;
		var frame = this.content;

		if (w && isNumber(w)) {
			w = w + "px";
		}

		if (w) {
			frame.style.width = w;
			// this.content.style.width = w;
		}

		return this.window.getComputedStyle(frame)["width"];


	}

	/**
		* Get or Set height
		* @param {number} [h]
		* @returns {number} height
		*/
	height(h) {
		// var frame = this.documentElement;
		var frame = this.content;

		if (h && isNumber(h)) {
			h = h + "px";
		}

		if (h) {
			frame.style.height = h;
			// this.content.style.height = h;
		}

		return this.window.getComputedStyle(frame)["height"];

	}

	/**
		* Get or Set width of the contents
		* @param {number} [w]
		* @returns {number} width
		*/
	contentWidth(w) {

		var content = this.content || this.document.body;

		if (w && isNumber(w)) {
			w = w + "px";
		}

		if (w) {
			content.style.width = w;
		}

		return this.window.getComputedStyle(content)["width"];


	}

	/**
		* Get or Set height of the contents
		* @param {number} [h]
		* @returns {number} height
		*/
	contentHeight(h) {

		var content = this.content || this.document.body;

		if (h && isNumber(h)) {
			h = h + "px";
		}

		if (h) {
			content.style.height = h;
		}

		return this.window.getComputedStyle(content)["height"];

	}

	/**
		* Get the width of the text using Range
		* @returns {number} width
		*/
	textWidth() {
		let width;
		let range = this.document.createRange();
		let content = this.content || this.document.body;
		let border = borders(content);

		// Select the contents of frame
		range.selectNodeContents(content);

		// get the width of the text content
		width = range.getBoundingClientRect().width;

		if (border && border.width) {
			width += border.width;
		}

		return Math.round(width);
	}

	/**
		* Get the height of the text using Range
		* @returns {number} height
		*/
	textHeight() {
		let height;
		let range = this.document.createRange();
		let content = this.content || this.document.body;
		let border = borders(content);

		range.selectNodeContents(content);

		height = range.getBoundingClientRect().height;

		if (height && border.height) {
			height += border.height;
		}

		return Math.round(height);
	}

	/**
		* Get documentElement scrollWidth
		* @returns {number} width
		*/
	scrollWidth() {
		var width = this.documentElement.scrollWidth;

		return width;
	}

	/**
		* Get documentElement scrollHeight
		* @returns {number} height
		*/
	scrollHeight() {
		var height = this.documentElement.scrollHeight;

		return height;
	}

	/**
		* Set overflow css style of the contents
		* @param {string} [overflow]
		*/
	overflow(overflow) {

		if (overflow) {
			this.documentElement.style.overflow = overflow;
		}

		return this.window.getComputedStyle(this.documentElement)["overflow"];
	}

	/**
		* Set overflowX css style of the documentElement
		* @param {string} [overflow]
		*/
	overflowX(overflow) {

		if (overflow) {
			this.documentElement.style.overflowX = overflow;
		}

		return this.window.getComputedStyle(this.documentElement)["overflowX"];
	}

	/**
		* Set overflowY css style of the documentElement
		* @param {string} [overflow]
		*/
	overflowY(overflow) {

		if (overflow) {
			this.documentElement.style.overflowY = overflow;
		}

		return this.window.getComputedStyle(this.documentElement)["overflowY"];
	}

	/**
		* Set Css styles on the contents element (typically Body)
		* @param {string} property
		* @param {string} value
		* @param {boolean} [priority] set as "important"
		*/
	css(property, value, priority) {
		var content = this.content || this.document.body;

		if (value) {
			content.style.setProperty(property, value, priority ? "important" : "");
		}

		return this.window.getComputedStyle(content)[property];
	}

	/**
		* Get or Set the viewport element
		* @param {object} [options]
		* @param {string} [options.width]
		* @param {string} [options.height]
		* @param {string} [options.scale]
		* @param {string} [options.minimum]
		* @param {string} [options.maximum]
		* @param {string} [options.scalable]
		*/
	viewport(options) {
		var _width, _height, _scale, _minimum, _maximum, _scalable;
		// var width, height, scale, minimum, maximum, scalable;
		var $viewport = this.document.querySelector("meta[name='viewport']");
		var parsed = {
			"width": undefined,
			"height": undefined,
			"scale": undefined,
			"minimum": undefined,
			"maximum": undefined,
			"scalable": undefined
		};
		var newContent = [];
		var settings = {};

		/*
		* check for the viewport size
		* <meta name="viewport" content="width=1024,height=697" />
		*/
		if($viewport && $viewport.hasAttribute("content")) {
			let content = $viewport.getAttribute("content");
			let _width = content.match(/width\s*=\s*([^,]*)/);
			let _height = content.match(/height\s*=\s*([^,]*)/);
			let _scale = content.match(/initial-scale\s*=\s*([^,]*)/);
			let _minimum = content.match(/minimum-scale\s*=\s*([^,]*)/);
			let _maximum = content.match(/maximum-scale\s*=\s*([^,]*)/);
			let _scalable = content.match(/user-scalable\s*=\s*([^,]*)/);

			if(_width && _width.length && typeof _width[1] !== "undefined"){
				parsed.width = _width[1];
			}
			if(_height && _height.length && typeof _height[1] !== "undefined"){
				parsed.height = _height[1];
			}
			if(_scale && _scale.length && typeof _scale[1] !== "undefined"){
				parsed.scale = _scale[1];
			}
			if(_minimum && _minimum.length && typeof _minimum[1] !== "undefined"){
				parsed.minimum = _minimum[1];
			}
			if(_maximum && _maximum.length && typeof _maximum[1] !== "undefined"){
				parsed.maximum = _maximum[1];
			}
			if(_scalable && _scalable.length && typeof _scalable[1] !== "undefined"){
				parsed.scalable = _scalable[1];
			}
		}

		settings = defaults(options || {}, parsed);

		if (options) {
			if (settings.width) {
				newContent.push("width=" + settings.width);
			}

			if (settings.height) {
				newContent.push("height=" + settings.height);
			}

			if (settings.scale) {
				newContent.push("initial-scale=" + settings.scale);
			}

			if (settings.scalable === "no") {
				newContent.push("minimum-scale=" + settings.scale);
				newContent.push("maximum-scale=" + settings.scale);
				newContent.push("user-scalable=" + settings.scalable);
			} else {

				if (settings.scalable) {
					newContent.push("user-scalable=" + settings.scalable);
				}

				if (settings.minimum) {
					newContent.push("minimum-scale=" + settings.minimum);
				}

				if (settings.maximum) {
					newContent.push("minimum-scale=" + settings.maximum);
				}
			}

			if (!$viewport) {
				$viewport = this.document.createElement("meta");
				$viewport.setAttribute("name", "viewport");
				this.document.querySelector("head").appendChild($viewport);
			}

			$viewport.setAttribute("content", newContent.join(", "));

			this.window.scrollTo(0, 0);
		}


		return settings;
	}

	/**
	 * Event emitter for when the contents has expanded
	 * @private
	 */
	expand() {
		this.emit(EVENTS.CONTENTS.EXPAND);
	}

	/**
	 * Add DOM listeners
	 * @private
	 */
	listeners() {

		this.imageLoadListeners();

		this.mediaQueryListeners();

		// this.fontLoadListeners();

		this.addEventListeners();

		this.addSelectionListeners();

		// this.transitionListeners();

		this.resizeListeners();

		// this.resizeObservers();

		this.linksHandler();
	}

	/**
	 * Remove DOM listeners
	 * @private
	 */
	removeListeners() {

		this.removeEventListeners();

		this.removeSelectionListeners();

		clearTimeout(this.expanding);
	}

	/**
	 * Check if size of contents has changed and
	 * emit 'resize' event if it has.
	 * @private
	 */
	resizeCheck() {
		let width = this.textWidth();
		let height = this.textHeight();

		if (width != this._size.width || height != this._size.height) {

			this._size = {
				width: width,
				height: height
			};

			this.onResize && this.onResize(this._size);
			this.emit(EVENTS.CONTENTS.RESIZE, this._size);
		}
	}

	/**
	 * Poll for resize detection
	 * @private
	 */
	resizeListeners() {
		var width, height;
		// Test size again
		clearTimeout(this.expanding);

		requestAnimationFrame(this.resizeCheck.bind(this));

		this.expanding = setTimeout(this.resizeListeners.bind(this), 350);
	}

	/**
	 * Use css transitions to detect resize
	 * @private
	 */
	transitionListeners() {
		let body = this.content;

		body.style['transitionProperty'] = "font, font-size, font-size-adjust, font-stretch, font-variation-settings, font-weight, width, height";
		body.style['transitionDuration'] = "0.001ms";
		body.style['transitionTimingFunction'] = "linear";
		body.style['transitionDelay'] = "0";

		this.document.addEventListener('transitionend', this.resizeCheck.bind(this));
	}

	/**
	 * Listen for media query changes and emit 'expand' event
	 * Adapted from: https://github.com/tylergaw/media-query-events/blob/master/js/mq-events.js
	 * @private
	 */
	mediaQueryListeners() {
		var sheets = this.document.styleSheets;
		var mediaChangeHandler = function(m){
			if(m.matches && !this._expanding) {
				setTimeout(this.expand.bind(this), 1);
			}
		}.bind(this);

		for (var i = 0; i < sheets.length; i += 1) {
			var rules;
			// Firefox errors if we access cssRules cross-domain
			try {
				rules = sheets[i].cssRules;
			} catch (e) {
				return;
			}
			if(!rules) return; // Stylesheets changed
			for (var j = 0; j < rules.length; j += 1) {
				//if (rules[j].constructor === CSSMediaRule) {
				if(rules[j].media){
					var mql = this.window.matchMedia(rules[j].media.mediaText);
					mql.addListener(mediaChangeHandler);
					//mql.onchange = mediaChangeHandler;
				}
			}
		}
	}

	/**
	 * Use MutationObserver to listen for changes in the DOM and check for resize
	 * @private
	 */
	resizeObservers() {
		// create an observer instance
		this.observer = new MutationObserver((mutations) => {
			this.resizeCheck();
		});

		// configuration of the observer:
		let config = { attributes: true, childList: true, characterData: true, subtree: true };

		// pass in the target node, as well as the observer options
		this.observer.observe(this.document, config);
	}

	/**
	 * Test if images are loaded or add listener for when they load
	 * @private
	 */
	imageLoadListeners() {
		var images = this.document.querySelectorAll("img");
		var img;
		for (var i = 0; i < images.length; i++) {
			img = images[i];

			if (typeof img.naturalWidth !== "undefined" &&
					img.naturalWidth === 0) {
				img.onload = this.expand.bind(this);
			}
		}
	}

	/**
	 * Listen for font load and check for resize when loaded
	 * @private
	 */
	fontLoadListeners() {
		if (!this.document || !this.document.fonts) {
			return;
		}

		this.document.fonts.ready.then(function () {
			this.resizeCheck();
		}.bind(this));

	}

	/**
	 * Get the documentElement
	 * @returns {element} documentElement
	 */
	root() {
		if(!this.document) return null;
		return this.document.documentElement;
	}

	/**
	 * Get the location offset of a EpubCFI or an #id
	 * @param {string | EpubCFI} target
	 * @param {string} [ignoreClass] for the cfi
	 * @returns { {left: Number, top: Number }
	 */
	locationOf(target, ignoreClass) {
		var position;
		var targetPos = {"left": 0, "top": 0};

		if(!this.document) return targetPos;

		if(this.epubcfi.isCfiString(target)) {
			let range = new EpubCFI(target).toRange(this.document, ignoreClass);

			if(range) {
				if (range.startContainer.nodeType === Node.ELEMENT_NODE) {
					position = range.startContainer.getBoundingClientRect();
					targetPos.left = position.left;
					targetPos.top = position.top;
				} else {
					// Webkit does not handle collapsed range bounds correctly
					// https://bugs.webkit.org/show_bug.cgi?id=138949

					// Construct a new non-collapsed range
					if (isWebkit) {
						let container = range.startContainer;
						let newRange = new Range();
						try {
							if (container.nodeType === ELEMENT_NODE) {
								position = container.getBoundingClientRect();
							} else if (range.startOffset + 2 < container.length) {
								newRange.setStart(container, range.startOffset);
								newRange.setEnd(container, range.startOffset + 2);
								position = newRange.getBoundingClientRect();
							} else if (range.startOffset - 2 > 0) {
								newRange.setStart(container, range.startOffset - 2);
								newRange.setEnd(container, range.startOffset);
								position = newRange.getBoundingClientRect();
							} else { // empty, return the parent element
								position = container.parentNode.getBoundingClientRect();
							}
						} catch (e) {
							console.error(e, e.stack);
						}
					} else {
						position = range.getBoundingClientRect();
					}
				}
			}

		} else if(typeof target === "string" &&
			target.indexOf("#") > -1) {

			let id = target.substring(target.indexOf("#")+1);
			let el = this.document.getElementById(id);

			if(el) {
				position = el.getBoundingClientRect();
			}
		}

		if (position) {
			targetPos.left = position.left;
			targetPos.top = position.top;
		}

		return targetPos;
	}

	/**
	 * Append a stylesheet link to the document head
	 * @param {string} src url
	 */
	addStylesheet(src) {
		return new Promise(function(resolve, reject){
			var $stylesheet;
			var ready = false;

			if(!this.document) {
				resolve(false);
				return;
			}

			// Check if link already exists
			$stylesheet = this.document.querySelector("link[href='"+src+"']");
			if ($stylesheet) {
				resolve(true);
				return; // already present
			}

			$stylesheet = this.document.createElement("link");
			$stylesheet.type = "text/css";
			$stylesheet.rel = "stylesheet";
			$stylesheet.href = src;
			$stylesheet.onload = $stylesheet.onreadystatechange = function() {
				if ( !ready && (!this.readyState || this.readyState == "complete") ) {
					ready = true;
					// Let apply
					setTimeout(() => {
						resolve(true);
					}, 1);
				}
			};

			this.document.head.appendChild($stylesheet);

		}.bind(this));
	}

	/**
	 * Append stylesheet rules to a generate stylesheet
	 * Array: https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule
	 * Object: https://github.com/desirable-objects/json-to-css
	 * @param {array | object} rules
	 */
	addStylesheetRules(rules) {
		var styleEl;
		var styleSheet;
		var key = "epubjs-inserted-css";

		if(!this.document || !rules || rules.length === 0) return;

		// Check if link already exists
		styleEl = this.document.getElementById("#"+key);
		if (!styleEl) {
			styleEl = this.document.createElement("style");
			styleEl.id = key;
		}

		// Append style element to head
		this.document.head.appendChild(styleEl);

		// Grab style sheet
		styleSheet = styleEl.sheet;

		if (Object.prototype.toString.call(rules) === "[object Array]") {
			for (var i = 0, rl = rules.length; i < rl; i++) {
				var j = 1, rule = rules[i], selector = rules[i][0], propStr = "";
				// If the second argument of a rule is an array of arrays, correct our variables.
				if (Object.prototype.toString.call(rule[1][0]) === "[object Array]") {
					rule = rule[1];
					j = 0;
				}

				for (var pl = rule.length; j < pl; j++) {
					var prop = rule[j];
					propStr += prop[0] + ":" + prop[1] + (prop[2] ? " !important" : "") + ";\n";
				}

				// Insert CSS Rule
				styleSheet.insertRule(selector + "{" + propStr + "}", styleSheet.cssRules.length);
			}
		} else {
			const selectors = Object.keys(rules);
			selectors.forEach((selector) => {
				const definition = rules[selector];
				if (Array.isArray(definition)) {
					definition.forEach((item) => {
						const _rules = Object.keys(item);
						const result = _rules.map((rule) => {
							return `${rule}:${item[rule]}`;
						}).join(';');
						styleSheet.insertRule(`${selector}{${result}}`, styleSheet.cssRules.length);
					});
				} else {
					const _rules = Object.keys(definition);
					const result = _rules.map((rule) => {
						return `${rule}:${definition[rule]}`;
					}).join(';');
					styleSheet.insertRule(`${selector}{${result}}`, styleSheet.cssRules.length);
				}
			});
		}
	}

	/**
	 * Append a script tag to the document head
	 * @param {string} src url
	 * @returns {Promise} loaded
	 */
	addScript(src) {

		return new Promise(function(resolve, reject){
			var $script;
			var ready = false;

			if(!this.document) {
				resolve(false);
				return;
			}

			$script = this.document.createElement("script");
			$script.type = "text/javascript";
			$script.async = true;
			$script.src = src;
			$script.onload = $script.onreadystatechange = function() {
				if ( !ready && (!this.readyState || this.readyState == "complete") ) {
					ready = true;
					setTimeout(function(){
						resolve(true);
					}, 1);
				}
			};

			this.document.head.appendChild($script);

		}.bind(this));
	}

	/**
	 * Add a class to the contents container
	 * @param {string} className
	 */
	addClass(className) {
		var content;

		if(!this.document) return;

		content = this.content || this.document.body;

		if (content) {
			content.classList.add(className);
		}

	}

	/**
	 * Remove a class from the contents container
	 * @param {string} removeClass
	 */
	removeClass(className) {
		var content;

		if(!this.document) return;

		content = this.content || this.document.body;

		if (content) {
			content.classList.remove(className);
		}

	}

	/**
	 * Add DOM event listeners
	 * @private
	 */
	addEventListeners(){
		if(!this.document) {
			return;
		}

		DOM_EVENTS.forEach(function(eventName){
			this.document.addEventListener(eventName, this.triggerEvent.bind(this), false);
		}, this);

	}

	/**
	 * Remove DOM event listeners
	 * @private
	 */
	removeEventListeners(){
		if(!this.document) {
			return;
		}
		DOM_EVENTS.forEach(function(eventName){
			this.document.removeEventListener(eventName, this.triggerEvent, false);
		}, this);

	}

	/**
	 * Emit passed browser events
	 * @private
	 */
	triggerEvent(e){
		this.emit(e.type, e);
	}

	/**
	 * Add listener for text selection
	 * @private
	 */
	addSelectionListeners(){
		if(!this.document) {
			return;
		}
		this.document.addEventListener("selectionchange", this.onSelectionChange.bind(this), false);
	}

	/**
	 * Remove listener for text selection
	 * @private
	 */
	removeSelectionListeners(){
		if(!this.document) {
			return;
		}
		this.document.removeEventListener("selectionchange", this.onSelectionChange, false);
	}

	/**
	 * Handle getting text on selection
	 * @private
	 */
	onSelectionChange(e){
		if (this.selectionEndTimeout) {
			clearTimeout(this.selectionEndTimeout);
		}
		this.selectionEndTimeout = setTimeout(function() {
			var selection = this.window.getSelection();
			this.triggerSelectedEvent(selection);
		}.bind(this), 250);
	}

	/**
	 * Emit event on text selection
	 * @private
	 */
	triggerSelectedEvent(selection){
		var range, cfirange;

		if (selection && selection.rangeCount > 0) {
			range = selection.getRangeAt(0);
			if(!range.collapsed) {
				// cfirange = this.section.cfiFromRange(range);
				cfirange = new EpubCFI(range, this.cfiBase).toString();
				this.emit(EVENTS.CONTENTS.SELECTED, cfirange);
				this.emit(EVENTS.CONTENTS.SELECTED_RANGE, range);
			}
		}
	}

	/**
	 * Get a Dom Range from EpubCFI
	 * @param {EpubCFI} _cfi
	 * @param {string} [ignoreClass]
	 * @returns {Range} range
	 */
	range(_cfi, ignoreClass){
		var cfi = new EpubCFI(_cfi);
		return cfi.toRange(this.document, ignoreClass);
	}

	/**
	 * Get an EpubCFI from a Dom Range
	 * @param {Range} range
	 * @param {string} [ignoreClass]
	 * @returns {EpubCFI} cfi
	 */
	cfiFromRange(range, ignoreClass){
		return new EpubCFI(range, this.cfiBase, ignoreClass).toString();
	}

	/**
	 * Get an EpubCFI from a Dom node
	 * @param {node} node
	 * @param {string} [ignoreClass]
	 * @returns {EpubCFI} cfi
	 */
	cfiFromNode(node, ignoreClass){
		return new EpubCFI(node, this.cfiBase, ignoreClass).toString();
	}

	// TODO: find where this is used - remove?
	map(layout){
		var map = new Mapping(layout);
		return map.section();
	}

	/**
	 * Size the contents to a given width and height
	 * @param {number} [width]
	 * @param {number} [height]
	 */
	size(width, height){
		var viewport = { scale: 1.0, scalable: "no" };

		this.layoutStyle("scrolling");

		if (width >= 0) {
			this.width(width);
			viewport.width = width;
			this.css("padding", "0 "+(width/12)+"px");
		}

		if (height >= 0) {
			this.height(height);
			viewport.height = height;
		}

		this.css("margin", "0");
		this.css("box-sizing", "border-box");


		this.viewport(viewport);
	}

	/**
	 * Apply columns to the contents for pagination
	 * @param {number} width
	 * @param {number} height
	 * @param {number} columnWidth
	 * @param {number} gap
	 */
	columns(width, height, columnWidth, gap){
		let COLUMN_AXIS = prefixed("column-axis");
		let COLUMN_GAP = prefixed("column-gap");
		let COLUMN_WIDTH = prefixed("column-width");
		let COLUMN_FILL = prefixed("column-fill");

		let writingMode = this.writingMode();
		let axis = (writingMode.indexOf("vertical") === 0) ? "vertical" : "horizontal";

		this.layoutStyle("paginated");

		// Fix body width issues if rtl is only set on body element
		if (this.content.dir === "rtl") {
			this.direction("rtl");
		}

		this.width(width);
		this.height(height);

		// Deal with Mobile trying to scale to viewport
		this.viewport({ width: width, height: height, scale: 1.0, scalable: "no" });

		// TODO: inline-block needs more testing
		// Fixes Safari column cut offs, but causes RTL issues
		// this.css("display", "inline-block");

		this.css("overflow-y", "hidden");
		this.css("margin", "0", true);

		if (axis === "vertical") {
			this.css("padding-top", (gap / 2) + "px", true);
			this.css("padding-bottom", (gap / 2) + "px", true);
			this.css("padding-left", "20px");
			this.css("padding-right", "20px");
		} else {
			this.css("padding-top", "20px");
			this.css("padding-bottom", "20px");
			this.css("padding-left", (gap / 2) + "px", true);
			this.css("padding-right", (gap / 2) + "px", true);
		}

		this.css("box-sizing", "border-box");
		this.css("max-width", "inherit");

		this.css(COLUMN_AXIS, "horizontal");
		this.css(COLUMN_FILL, "auto");

		this.css(COLUMN_GAP, gap+"px");
		this.css(COLUMN_WIDTH, columnWidth+"px");
	}

	/**
	 * Scale contents from center
	 * @param {number} scale
	 * @param {number} offsetX
	 * @param {number} offsetY
	 */
	scaler(scale, offsetX, offsetY){
		var scaleStr = "scale(" + scale + ")";
		var translateStr = "";
		// this.css("position", "absolute"));
		this.css("transform-origin", "top left");

		if (offsetX >= 0 || offsetY >= 0) {
			translateStr = " translate(" + (offsetX || 0 )+ "px, " + (offsetY || 0 )+ "px )";
		}

		this.css("transform", scaleStr + translateStr);
	}

	/**
	 * Fit contents into a fixed width and height
	 * @param {number} width
	 * @param {number} height
	 */
	fit(width, height){
		var viewport = this.viewport();
		var widthScale = width / parseInt(viewport.width);
		var heightScale = height / parseInt(viewport.height);
		var scale = widthScale < heightScale ? widthScale : heightScale;

		var offsetY = (height - (viewport.height * scale)) / 2;

		this.layoutStyle("paginated");

		this.width(width);
		this.height(height);
		this.overflow("hidden");

		// Scale to the correct size
		this.scaler(scale, 0, offsetY);

		this.css("background-color", "transparent");
	}

	/**
	 * Set the direction of the text
	 * @param {string} [dir="ltr"] "rtl" | "ltr"
	 */
	direction(dir) {
		if (this.documentElement) {
			this.documentElement.style["direction"] = dir;
		}
	}

	mapPage(cfiBase, layout, start, end, dev) {
		var mapping = new Mapping(layout, dev);

		return mapping.page(this, cfiBase, start, end);
	}

	/**
	 * Emit event when link in content is clicked
	 * @private
	 */
	linksHandler() {
		replaceLinks(this.content, (href) => {
			this.emit(EVENTS.CONTENTS.LINK_CLICKED, href);
		});
	}

	/**
	 * Set the writingMode of the text
	 * @param {string} [mode="horizontal-tb"] "horizontal-tb" | "vertical-rl" | "vertical-lr"
	 */
	writingMode(mode) {
		let WRITING_MODE = prefixed("writing-mode");

		if (mode && this.documentElement) {
			this.documentElement.style[WRITING_MODE] = mode;
		}

		return this.window.getComputedStyle(this.documentElement)[WRITING_MODE] || '';
	}

	/**
	 * Set the layoutStyle of the content
	 * @param {string} [style="paginated"] "scrolling" | "paginated"
	 * @private
	 */
	layoutStyle(style) {

		if (style) {
			this._layoutStyle = style;
			navigator.epubReadingSystem.layoutStyle = this._layoutStyle;
		}

		return this._layoutStyle || "paginated";
	}

	/**
	 * Add the epubReadingSystem object to the navigator
	 * @param {string} name
	 * @param {string} version
	 * @private
	 */
	epubReadingSystem(name, version) {
		navigator.epubReadingSystem = {
			name: name,
			version: version,
			layoutStyle: this.layoutStyle(),
			hasFeature: function (feature) {
				switch (feature) {
					case "dom-manipulation":
						return true;
					case "layout-changes":
						return true;
					case "touch-events":
						return true;
					case "mouse-events":
						return true;
					case "keyboard-events":
						return true;
					case "spine-scripting":
						return false;
					default:
						return false;
				}
			}
		};
		return navigator.epubReadingSystem;
	}

	destroy() {
		// Stop observing
		if(this.observer) {
			this.observer.disconnect();
		}

		this.document.removeEventListener('transitionend', this.resizeCheck);

		this.removeListeners();

	}
}

EventEmitter(Contents.prototype);

export default Contents;
