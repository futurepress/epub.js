import EventEmitter from "event-emitter";
import {isNumber, prefixed} from "./utils/core";
import EpubCFI from "./epubcfi";
import Mapping from "./mapping";
import {replaceLinks} from "./utils/replacements";

// Dom events to listen for
const EVENTS = ["keydown", "keyup", "keypressed", "mouseup", "mousedown", "click", "touchend", "touchstart"];

class Contents {
	constructor(doc, content, cfiBase) {
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

		this.cfiBase = cfiBase || "";

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
		var width;
		var range = this.document.createRange();
		var content = this.content || this.document.body;

		// Select the contents of frame
		range.selectNodeContents(content);

		// get the width of the text content
		width = range.getBoundingClientRect().width;

		return width;

	}

	textHeight() {
		var height;
		var range = this.document.createRange();
		var content = this.content || this.document.body;

		range.selectNodeContents(content);

		height = range.getBoundingClientRect().height;

		return height;
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

	css(property, value) {
		var content = this.content || this.document.body;

		if (value) {
			content.style[property] = value;
		}

		return this.window.getComputedStyle(content)[property];
	}

	viewport(options) {
		var width, height, scale, scalable;
		var $viewport = this.document.querySelector("meta[name='viewport']");
		var newContent = "";

		/*
		* check for the viewport size
		* <meta name="viewport" content="width=1024,height=697" />
		*/
		if($viewport && $viewport.hasAttribute("content")) {
			let content = $viewport.getAttribute("content");
			let contents = content.split(/\s*,\s*/);
			if(contents[0]){
				width = contents[0].replace("width=", "").trim();
			}
			if(contents[1]){
				height = contents[1].replace("height=", "").trim();
			}
			if(contents[2]){
				scale = contents[2].replace("initial-scale=", "").trim();
			}
			if(contents[3]){
				scalable = contents[3].replace("user-scalable=", "").trim();
			}
		}

		if (options) {

			newContent += "width=" + (options.width || width);
			newContent += ", height=" + (options.height || height);
			if (options.scale || scale) {
				newContent += ", initial-scale=" + (options.scale || scale);
			}
			if (options.scalable || scalable) {
				newContent += ", user-scalable=" + (options.scalable || scalable);
			}

			if (!$viewport) {
				$viewport = this.document.createElement("meta");
				$viewport.setAttribute("name", "viewport");
				this.document.querySelector("head").appendChild($viewport);
			}

			$viewport.setAttribute("content", newContent);
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

		this.resizeListeners();

		this.linksHandler();
	}

	removeListeners() {

		this.removeEventListeners();

		this.removeSelectionListeners();
	}

	resizeListeners() {
		var width, height;
		// Test size again
		clearTimeout(this.expanding);

		width = this.scrollWidth();
		height = this.scrollHeight();

		if (width != this._size.width || height != this._size.height) {

			this._size = {
				width: width,
				height: height
			};

			this.emit("resize", this._size);
		}

		this.expanding = setTimeout(this.resizeListeners.bind(this), 350);
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

	observe(target) {
		var renderer = this;

		// create an observer instance
		var observer = new MutationObserver(function(mutations) {
			if(renderer._expanding) {
				renderer.expand();
			}
			// mutations.forEach(function(mutation) {
			//   console.log(mutation);
			// });
		});

		// configuration of the observer:
		var config = { attributes: true, childList: true, characterData: true, subtree: true };

		// pass in the target node, as well as the observer options
		observer.observe(target, config);

		return observer;
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

		if(!this.document) return;

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
					if (range.collapsed) {
						position = range.getClientRects()[0];
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
					setTimeout(function(){
						resolve(true);
					}, 1);
				}
			};

			this.document.head.appendChild($stylesheet);

		}.bind(this));
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/insertRule
	addStylesheetRules(rules) {
		var styleEl;
		var styleSheet;
		var key = "epubjs-inserted-css";

		if(!this.document) return;

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

		content.classList.add(className);

	}

	removeClass(className) {
		var content;

		if(!this.document) return;

		content = this.content || this.document.body;

		content.classList.remove(className);

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
		}.bind(this), 500);
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

	map(layout){
		var map = new Mapping(layout);
		return map.section();
	}

	size(width, height){

		if (width >= 0) {
			this.width(width);
		}

		if (height >= 0) {
			this.height(height);
		}

		this.css("margin", "0");
		this.css("boxSizing", "border-box");

	}

	columns(width, height, columnWidth, gap){
		var COLUMN_AXIS = prefixed("columnAxis");
		var COLUMN_GAP = prefixed("columnGap");
		var COLUMN_WIDTH = prefixed("columnWidth");
		var COLUMN_FILL = prefixed("columnFill");

		this.width(width);
		this.height(height);

		// Deal with Mobile trying to scale to viewport
		this.viewport({ width: width, height: height, scale: 1.0 });

		// this.overflowY("hidden");
		this.css("overflowY", "hidden");
		this.css("margin", "0");
		this.css("boxSizing", "border-box");
		this.css("maxWidth", "inherit");

		this.css(COLUMN_AXIS, "horizontal");
		this.css(COLUMN_FILL, "auto");

		this.css(COLUMN_GAP, gap+"px");
		this.css(COLUMN_WIDTH, columnWidth+"px");
	}

	scaler(scale, offsetX, offsetY){
		var scaleStr = "scale(" + scale + ")";
		var translateStr = "";
		// this.css("position", "absolute"));
		this.css("transformOrigin", "top left");

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
		this.viewport({ scale: 1.0 });

		// Scale to the correct size
		this.scaler(scale, 0, offsetY);

		this.css("backgroundColor", "transparent");
	}

	mapPage(cfiBase, start, end) {
		var mapping = new Mapping();

		return mapping.page(this, cfiBase, start, end);
	}

	linksHandler() {
		replaceLinks(this.content, (href) => {
			this.emit("link", href);
		});
	}

	destroy() {
		// Stop observing
		if(this.observer) {
			this.observer.disconnect();
		}

		this.removeListeners();

	}
}

EventEmitter(Contents.prototype);

export default Contents;
