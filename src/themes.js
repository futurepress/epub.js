import Url from "./utils/url";

/**
 * Themes to apply to displayed content
 * @class
 * @param {Rendition} rendition
 */
class Themes {
	constructor(rendition) {
		this.rendition = rendition;
		this._themes = {
			"default" : {
				"rules" : {},
				"url" : "",
				"serialized" : ""
			}
		};
		this._overrides = {};
		this._current = "default";
		this._injected = [];
		this.rendition.hooks.content.register(this.inject.bind(this));
		this.rendition.hooks.content.register(this.overrides.bind(this));

	}

	/**
	 * Add themes to be used by a rendition
	 * @param {object | string}
	 * @example themes.register("light", "http://example.com/light.css")
	 * @example themes.register("light", { "body": { "color": "purple"}})
	 * @example themes.register({ "light" : {...}, "dark" : {...}})
	 */
	register () {
		if (arguments.length === 0) {
			return;
		}
		if (arguments.length === 1 && typeof(arguments[0]) === "object") {
			return this.registerThemes(arguments[0]);
		}
		if (arguments.length === 1 && typeof(arguments[0]) === "string") {
			return this.default(arguments[0]);
		}
		if (arguments.length === 2 && typeof(arguments[1]) === "string") {
			return this.registerUrl(arguments[0], arguments[1]);
		}
		if (arguments.length === 2 && typeof(arguments[1]) === "object") {
			return this.registerRules(arguments[0], arguments[1]);
		}
	}

	/**
	 * Add a default theme to be used by a rendition
	 * @param {object | string} theme
	 * @example themes.register("http://example.com/default.css")
	 * @example themes.register({ "body": { "color": "purple"}})
	 */
	default (theme) {
		if (!theme) {
			return;
		}
		if (typeof(theme) === "string") {
			return this.registerUrl("default", theme);
		}
		if (typeof(theme) === "object") {
			return this.registerRules("default", theme);
		}
	}

	registerThemes (themes) {
		for (var theme in themes) {
			if (themes.hasOwnProperty(theme)) {
				if (typeof(themes[theme]) === "string") {
					this.registerUrl(theme, themes[theme]);
				} else {
					this.registerRules(theme, themes[theme]);
				}
			}
		}
	}

	registerUrl (name, input) {
		var url = new Url(input);
		this._themes[name] = { "url": url.toString() };
		if (this._injected[name]) {
			this.update(name);
		}
	}

	registerRules (name, rules) {
		this._themes[name] = { "rules": rules };
		// TODO: serialize css rules
		if (this._injected[name]) {
			this.update(name);
		}
	}

	select (name) {
		var prev = this._current;
		var contents;

		this._current = name;
		this.update(name);

		contents = this.rendition.getContents();
		contents.forEach( (content) => {
			content.removeClass(prev);
			content.addClass(name);
		});
	}

	update (name) {
		var contents = this.rendition.getContents();
		contents.forEach( (content) => {
			this.add(name, content);
		});
	}

	inject (contents) {
		var links = [];
		var themes = this._themes;
		var theme;

		for (var name in themes) {
			if (themes.hasOwnProperty(name) && (name === this._current || name === "default")) {
				theme = themes[name];
				if((theme.rules && Object.keys(theme.rules).length > 0) || (theme.url && links.indexOf(theme.url) === -1)) {
					this.add(name, contents);
				}
				this._injected.push(name);
			}
		}

		if(this._current != "default") {
			contents.addClass(this._current);
		}
	}

	add (name, contents) {
		var theme = this._themes[name];

		if (!theme || !contents) {
			return;
		}

		if (theme.url) {
			contents.addStylesheet(theme.url);
		} else if (theme.serialized) {
			// TODO: handle serialized
		} else if (theme.rules) {
			contents.addStylesheetRules(theme.rules);
			theme.injected = true;
		}
	}

	override (name, value) {
		var contents = this.rendition.getContents();

		this._overrides[name] = value;

		contents.forEach( (content) => {
			content.css(name, this._overrides[name]);
		});
	}

	overrides (contents) {
		var overrides = this._overrides;

		for (var rule in overrides) {
			if (overrides.hasOwnProperty(rule)) {
				contents.css(rule, overrides[rule]);
			}
		}
	}

	/**
	 * Adjust the font size of a rendition
	 * @param {number} size
	 */
	fontSize (size) {
		this.override("font-size", size);
	}

	/**
	 * Adjust the font-family of a rendition
	 * @param {string} f
	 */
	font (f) {
		this.override("font-family", f);
	}

	destroy() {
		this.rendition = undefined;
		this._themes = undefined;
		this._overrides = undefined;
		this._current = undefined;
		this._injected = undefined;
	}

}

export default Themes;
