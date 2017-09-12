import EventEmitter from "event-emitter";
import {isNumber, prefixed, borders} from "./utils/core";
import EpubCFI from "./epubcfi";
import Mapping from "./mapping";
import {replaceLinks} from "./utils/replacements";
import { Pane, Highlight, Underline } from "marks-pane";

// Dom events to listen for
const EVENTS = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click", "touchend", "touchstart"];

const isChrome = /Chrome/.test(navigator.userAgent);
const isWebkit = !isChrome && /AppleWebKit/.test(navigator.userAgent);

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

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

		this.pane = undefined;
		this.highlights = {};
		this.underlines = {};
		this.marks = {};

		this.listeners();
	}

	static get listenedEvents() {
		return EVENTS;
	}

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

	scrollWidth() {
		var width = this.documentElement.scrollWidth;

		return width;
	}

	scrollHeight() {
		var height = this.documentElement.scrollHeight;

		return height;
	}

	overflow(overflow) {

		if (overflow) {
			this.documentElement.style.overflow = overflow;
		}

		return this.window.getComputedStyle(this.documentElement)["overflow"];
	}

	overflowX(overflow) {

		if (overflow) {
			this.documentElement.style.overflowX = overflow;
		}

		return this.window.getComputedStyle(this.documentElement)["overflowX"];
	}

	overflowY(overflow) {

		if (overflow) {
			this.documentElement.style.overflowY = overflow;
		}

		return this.window.getComputedStyle(this.documentElement)["overflowY"];
	}

	css(property, value, priority) {
		var content = this.content || this.document.body;

		if (value) {
			content.style.setProperty(property, value, priority ? "important" : "");
		}

		return this.window.getComputedStyle(content)[property];
	}

	viewport(options) {
		var _width, _height, _scale, _minimum, _maximum, _scalable;
		var width, height, scale, minimum, maximum, scalable;
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

		/*
		* check for the viewport size
		* <meta name="viewport" content="width=1024,height=697" />
		*/
		if($viewport && $viewport.hasAttribute("content")) {
			let content = $viewport.getAttribute("content");
			let _width = content.match(/width\s*=\s*([^,]*)/g);
			let _height = content.match(/height\s*=\s*([^,]*)/g);
			let _scale = content.match(/initial-scale\s*=\s*([^,]*)/g);
			let _minimum = content.match(/minimum-scale\s*=\s*([^,]*)/g);
			let _maximum = content.match(/maximum-scale\s*=\s*([^,]*)/g);
			let _scalable = content.match(/user-scalable\s*=\s*([^,]*)/g);
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

		if (options) {
			if (options.width || parsed.width) {
				newContent.push("width=" + (options.width || parsed.width));
			}

			if (options.height || parsed.height) {
				newContent.push("height=" + (options.height || parsed.height));
			}

			if (options.scale || parsed.scale) {
				newContent.push("initial-scale=" + (options.scale || parsed.scale));
			}
			if (options.scalable || parsed.scalable) {
				newContent.push("minimum-scale=" + (options.scale || parsed.minimum));
				newContent.push("maximum-scale=" + (options.scale || parsed.maximum));
				newContent.push("user-scalable=" + (options.scalable || parsed.scalable));
			}

			if (!$viewport) {
				$viewport = this.document.createElement("meta");
				$viewport.setAttribute("name", "viewport");
				this.document.querySelector("head").appendChild($viewport);
			}

			$viewport.setAttribute("content", newContent.join(", "));

			this.window.scrollTo(0, 0);
		}


		return {
			width: parseInt(width),
			height: parseInt(height)
		};
	}


	// layout(layoutFunc) {
	//
	//   this.iframe.style.display = "inline-block";
	//
	//   // Reset Body Styles
	//   this.content.style.margin = "0";
	//   //this.document.body.style.display = "inline-block";
	//   //this.document.documentElement.style.width = "auto";
	//
	//   if(layoutFunc){
	//     layoutFunc(this);
	//   }
	//
	//   this.onLayout(this);
	//
	// };
	//
	// onLayout(view) {
	//   // stub
	// };

	expand() {
		this.emit("expand");
	}

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

	removeListeners() {

		this.removeEventListeners();

		this.removeSelectionListeners();

		clearTimeout(this.expanding);
	}

	resizeCheck() {
		let width = this.textWidth();
		let height = this.textHeight();
		if (width != this._size.width || height != this._size.height) {

			this._size = {
				width: width,
				height: height
			};

			this.pane && this.pane.render();
			this.onResize && this.onResize(this._size);
			this.emit("resize", this._size);
		}
	}

	resizeListeners() {
		var width, height;
		// Test size again
		clearTimeout(this.expanding);

		requestAnimationFrame(this.resizeCheck.bind(this));

		this.expanding = setTimeout(this.resizeListeners.bind(this), 350);
	}

	transitionListeners() {
		let body = this.content;

		body.style['transitionProperty'] = "font, font-size, font-size-adjust, font-stretch, font-variation-settings, font-weight, width, height";
		body.style['transitionDuration'] = "0.001ms";
		body.style['transitionTimingFunction'] = "linear";
		body.style['transitionDelay'] = "0";

		this.document.addEventListener('transitionend', this.resizeCheck.bind(this));
	}

	//https://github.com/tylergaw/media-query-events/blob/master/js/mq-events.js
	mediaQueryListeners() {
		var sheets = this.document.styleSheets;
		var mediaChangeHandler = function(m){
			if(m.matches && !this._expanding) {
				setTimeout(this.expand.bind(this), 1);
				// this.expand();
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

	imageLoadListeners(target) {
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

	fontLoadListeners(target) {
		if (!this.document || !this.document.fonts) {
			return;
		}

		this.document.fonts.ready.then(function () {
			this.expand();
		}.bind(this));

	}

	root() {
		if(!this.document) return null;
		return this.document.documentElement;
	}

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
						this.pane && this.pane.render();
						resolve(true);
					}, 1);
				}
			};

			this.document.head.appendChild($stylesheet);

		}.bind(this));
	}

	// Array: https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule
	// Object: https://github.com/desirable-objects/json-to-css
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
		this.pane && this.pane.render();
	}

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

	addClass(className) {
		var content;

		if(!this.document) return;

		content = this.content || this.document.body;

		if (content) {
			content.classList.add(className);
		}

	}

	removeClass(className) {
		var content;

		if(!this.document) return;

		content = this.content || this.document.body;

		if (content) {
			content.classList.remove(className);
		}

	}

	addEventListeners(){
		if(!this.document) {
			return;
		}

		EVENTS.forEach(function(eventName){
			this.document.addEventListener(eventName, this.triggerEvent.bind(this), false);
		}, this);

	}

	removeEventListeners(){
		if(!this.document) {
			return;
		}
		EVENTS.forEach(function(eventName){
			this.document.removeEventListener(eventName, this.triggerEvent, false);
		}, this);

	}

	// Pass browser events
	triggerEvent(e){
		this.emit(e.type, e);
	}

	addSelectionListeners(){
		if(!this.document) {
			return;
		}
		this.document.addEventListener("selectionchange", this.onSelectionChange.bind(this), false);
	}

	removeSelectionListeners(){
		if(!this.document) {
			return;
		}
		this.document.removeEventListener("selectionchange", this.onSelectionChange, false);
	}

	onSelectionChange(e){
		if (this.selectionEndTimeout) {
			clearTimeout(this.selectionEndTimeout);
		}
		this.selectionEndTimeout = setTimeout(function() {
			var selection = this.window.getSelection();
			this.triggerSelectedEvent(selection);
		}.bind(this), 250);
	}

	triggerSelectedEvent(selection){
		var range, cfirange;

		if (selection && selection.rangeCount > 0) {
			range = selection.getRangeAt(0);
			if(!range.collapsed) {
				// cfirange = this.section.cfiFromRange(range);
				cfirange = new EpubCFI(range, this.cfiBase).toString();
				this.emit("selected", cfirange);
				this.emit("selectedRange", range);
			}
		}
	}

	range(_cfi, ignoreClass){
		var cfi = new EpubCFI(_cfi);
		return cfi.toRange(this.document, ignoreClass);
	}

	cfiFromRange(range, ignoreClass){
		return new EpubCFI(range, this.cfiBase, ignoreClass).toString();
	}

	cfiFromNode(node, ignoreClass){
		return new EpubCFI(node, this.cfiBase, ignoreClass).toString();
	}

	map(layout){
		var map = new Mapping(layout);
		return map.section();
	}

	size(width, height){
		var viewport = { scale: 1.0, scalable: "no" };

		if (width >= 0) {
			this.width(width);
			viewport.width = width;
			this.css("padding", "0 "+(width/12)+"px", true);
		}

		if (height >= 0) {
			this.height(height);
			viewport.height = height;
		}

		this.css("margin", "0");
		this.css("box-sizing", "border-box");


		this.viewport(viewport);
	}

	columns(width, height, columnWidth, gap){
		var COLUMN_AXIS = prefixed("column-axis");
		var COLUMN_GAP = prefixed("column-gap");
		var COLUMN_WIDTH = prefixed("column-width");
		var COLUMN_FILL = prefixed("column-fill");

		this.width(width);
		this.height(height);

		// Deal with Mobile trying to scale to viewport
		this.viewport({ width: width, height: height, scale: 1.0, scalable: "no" });

		this.css("display", "inline-block"); // Fixes Safari column cut offs
		this.css("overflow-y", "hidden");
		this.css("margin", "0", true);

		this.css("padding", "20px " + (gap / 2) + "px", true);

		this.css("box-sizing", "border-box");
		this.css("max-width", "inherit");

		this.css(COLUMN_AXIS, "horizontal");
		this.css(COLUMN_FILL, "auto");

		this.css(COLUMN_GAP, gap+"px");
		this.css(COLUMN_WIDTH, columnWidth+"px");
	}

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

	fit(width, height){
		var viewport = this.viewport();
		var widthScale = width / viewport.width;
		var heightScale = height / viewport.height;
		var scale = widthScale < heightScale ? widthScale : heightScale;

		var offsetY = (height - (viewport.height * scale)) / 2;

		this.width(width);
		this.height(height);
		this.overflow("hidden");

		// Deal with Mobile trying to scale to viewport
		this.viewport({ width: width, height: height, scale: 1.0 });

		// Scale to the correct size
		this.scaler(scale, 0, offsetY);

		this.css("background-color", "transparent");
	}

	mapPage(cfiBase, layout, start, end, dev) {
		var mapping = new Mapping(layout, dev);

		return mapping.page(this, cfiBase, start, end);
	}

	linksHandler() {
		replaceLinks(this.content, (href) => {
			this.emit("linkClicked", href);
		});
	}

	highlight(cfiRange, data={}, cb) {
		let range = this.range(cfiRange);
		let emitter = () => {
			this.emit("markClicked", cfiRange, data);
		};

		data["epubcfi"] = cfiRange;

		if (!this.pane) {
			this.pane = new Pane(this.content, this.document.body);
		}

		let m = new Highlight(range, "epubjs-hl", data, {'fill': 'yellow', 'fill-opacity': '0.3', 'mix-blend-mode': 'multiply'});
		let h = this.pane.addMark(m);

		this.highlights[cfiRange] = { "mark": h, "element": h.element, "listeners": [emitter, cb] };

		h.element.addEventListener("click", emitter);

		if (cb) {
			h.element.addEventListener("click", cb);
		}
		return h;
	}

	underline(cfiRange, data={}, cb) {
		let range = this.range(cfiRange);
		let emitter = () => {
			this.emit("markClicked", cfiRange, data);
		};

		data["epubcfi"] = cfiRange;

		if (!this.pane) {
			this.pane = new Pane(this.content, this.document.body);
		}

		let m = new Underline(range, "epubjs-ul", data, {'stroke': 'black', 'stroke-opacity': '0.3', 'mix-blend-mode': 'multiply'});
		let h = this.pane.addMark(m);

		this.underlines[cfiRange] = { "mark": h, "element": h.element, "listeners": [emitter, cb] };

		h.element.addEventListener("click", emitter);

		if (cb) {
			h.element.addEventListener("click", cb);
		}
		return h;
	}

	/*
	mark(cfiRange, data={}, cb) {
		let range = this.range(cfiRange);

		let container = range.commonAncestorContainer;
		let parent = (container.nodeType === 1) ? container : container.parentNode;
		let emitter = () => {
			this.emit("markClicked", cfiRange, data);
		};

		parent.setAttribute("ref", "epubjs-mk");

		parent.dataset["epubcfi"] = cfiRange;

		if (data) {
			Object.keys(data).forEach((key) => {
				parent.dataset[key] = data[key];
			});
		}

		parent.addEventListener("click", emitter);

		if (cb) {
			parent.addEventListener("click", cb);
		}

		this.marks[cfiRange] = { "element": parent, "listeners": [emitter, cb] };

		return parent;
	}
	*/

	mark(cfiRange, data={}, cb) {

		if (cfiRange in this.marks) {
			let item = this.marks[cfiRange];
			return item;
		}

		let range = this.range(cfiRange);

		let container = range.commonAncestorContainer;
		let parent = (container.nodeType === 1) ? container : container.parentNode;
		let emitter = (e) => {
			this.emit("markClicked", cfiRange, data);
		};

		let pos = parent.getBoundingClientRect();
		let mark = this.document.createElement('a');
		mark.setAttribute("ref", "epubjs-mk");
		mark.style.position = "absolute";
		mark.style.top = `${pos.top}px`;
		mark.style.left = `${pos.right}px`;

		mark.dataset["epubcfi"] = cfiRange;

		if (data) {
			Object.keys(data).forEach((key) => {
				mark.dataset[key] = data[key];
			});
		}

		if (cb) {
			mark.addEventListener("click", cb);
		}

		mark.addEventListener("click", emitter);

		this.content.appendChild(mark);

		this.marks[cfiRange] = { "element": mark, "listeners": [emitter, cb] };

		return parent;
	}

	unhighlight(cfiRange) {
		let item;
		if (cfiRange in this.highlights) {
			item = this.highlights[cfiRange];
			this.pane.removeMark(item.mark);
			item.listeners.forEach((l) => {
				if (l) { item.element.removeEventListener("click", l) };
			});
			delete this.highlights[cfiRange];
		}
	}

	ununderline(cfiRange) {
		let item;
		if (cfiRange in this.underlines) {
			item = this.underlines[cfiRange];
			this.pane.removeMark(item.mark);
			item.listeners.forEach((l) => {
				if (l) { item.element.removeEventListener("click", l) };
			});
			delete this.underlines[cfiRange];
		}
	}

	unmark(cfiRange) {
		let item;
		if (cfiRange in this.marks) {
			item = this.marks[cfiRange];
			this.content.removeChild(item.element);
			item.listeners.forEach((l) => {
				if (l) { item.element.removeEventListener("click", l) };
			});
			delete this.marks[cfiRange];
		}
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
