var Url = require('./core').Url;

function Themes(rendition) {
	this.rendition = rendition;
	this._themes = {
		"default" : {
			"rules" : [],
			"url" : "",
			"serialized" : ''
		}
	};
	this._overrides = {};
	this._current = "default";
	this._injected = [];
	this.rendition.hooks.content.register(this.inject.bind(this));
	this.rendition.hooks.content.register(this.overrides.bind(this));

}

Themes.prototype.register = function () {
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
};

Themes.prototype.default = function (theme) {
	if (!theme) {
		return;
	}
	if (typeof(theme) === "string") {
		return this.registerUrl("default", theme);
	}
	if (typeof(theme) === "object") {
		return this.registerRules("default", theme);
	}
};

Themes.prototype.registerThemes = function (themes) {
	for (var theme in themes) {
		if (themes.hasOwnProperty(theme)) {
			if (typeof(themes[theme]) === "string") {
				this.registerUrl(theme, themes[theme]);
			} else {
				this.registerRules(theme, themes[theme]);
			}
		}
	}
};

Themes.prototype.registerUrl = function (name, input) {
	var url = new Url(input);
	this._themes[name] = { "url": url.toString() };
};

Themes.prototype.registerRules = function (name, rules) {
	this._themes[name] = { "rules": rules };
	// TODO: serialize css rules
};

Themes.prototype.apply = function (name) {
	var prev = this._current;
	var contents;

	this._current = name;
	this.update(name);

	contents = this.rendition.getContents();
	contents.forEach(function (content) {
		content.removeClass(prev);
		content.addClass(name);
	}.bind(this));
};

Themes.prototype.update = function (name) {
	var contents = this.rendition.getContents();
	contents.forEach(function (content) {
		this.add(name, content);
	}.bind(this));
};

Themes.prototype.inject = function (view) {
	var links = [];
	var themes = this._themes;
	var theme;

	for (var name in themes) {
		if (themes.hasOwnProperty(name)) {
			theme = themes[name];
			if(theme.rules || (theme.url && links.indexOf(theme.url) === -1)) {
				this.add(name, view.contents);
			}
		}
	}

	if(this._current) {
		view.contents.addClass(this._current);
	}
};

Themes.prototype.add = function (name, contents) {
	var theme = this._themes[name];

	if (!theme) {
		return;
	}

	if (theme.url) {
		contents.addStylesheet(theme.url);
	} else if (theme.serialized) {
		// TODO: handle serialized
	} else if (theme.rules && theme.rules.length) {
		contents.addStylesheetRules(theme.rules);
		theme.injected = true;
	}
};

Themes.prototype.override = function (name, value) {
	var contents = this.rendition.getContents();

	this._overrides[name] = value;

	contents.forEach(function (content) {
		content.css(name, this._overrides[name]);
	}.bind(this));
};

Themes.prototype.overrides = function (view) {
	var contents = view.contents;
	var overrides = this._overrides;
	var rules = [];

	for (var rule in overrides) {
		if (overrides.hasOwnProperty(rule)) {
			contents.css(rule, overrides[rule]);
		}
	}
};

Themes.prototype.fontSize = function (size) {
	this.override("font-size", size);
};

module.exports = Themes;
