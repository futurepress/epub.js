var replace = require('./replacements');
var core = require('./core');
var Path = require('./core').Path;
var path = require('path');

function Resources(manifest, options) {
	this.settings = {
		base64: (options && options.base64) || true,
		archive: (options && options.archive),
		resolver: (options && options.resolver)
	};
	this.manifest = manifest;
	this.resources = Object.keys(manifest).
		map(function (key){
			return manifest[key];
		});

	this.replacementUrls = undefined;

	this.split();
	this.urls();
}

Resources.prototype.split = function(){

	// HTML
	this.html = this.resources.
		filter(function (item){
			if (item.type === "application/xhtml+xml" ||
					item.type === "text/html") {
				return true;
			}
		});

	// Exclude HTML
	this.assets = this.resources.
		filter(function (item){
			if (item.type !== "application/xhtml+xml" &&
					item.type !== "text/html") {
				return true;
			}
		});

	// Only CSS
	this.css = this.resources.
		filter(function (item){
			if (item.type === "text/css") {
				return true;
			}
		});
};

Resources.prototype.urls = function(){

	// All Assets Urls
	this.urls = this.assets.
		map(function(item) {
			return item.href;
		}.bind(this));

	// Css Urls
	this.cssUrls = this.css.map(function(item) {
		return item.href;
	});

};

/**
 * Create blob urls for all the assets
 * @param  {Archive} archive
 * @param  {resolver} resolver Url resolver
 * @return {Promise}         returns replacement urls
 */
Resources.prototype.replacements = function(archive, resolver){
	archive = archive || this.settings.archive;
	resolver = resolver || this.settings.resolver;
	var replacements = this.urls.
		map(function(url) {
			var absolute = resolver(url);

			return archive.createUrl(absolute, {"base64": this.settings.base64});
		}.bind(this))

	return Promise.all(replacements)
		.then(function(replacementUrls) {
			this.replacementUrls = replacementUrls;
			return replacementUrls;
		}.bind(this));
};

Resources.prototype.replaceCss = function(archive, resolver){
	var replaced = [];
	archive = archive || this.settings.archive;
	resolver = resolver || this.settings.resolver;
	this.cssUrls.forEach(function(href) {
		var replacment = this.createCssFile(href, archive, resolver)
			.then(function (replacementUrl) {
				// switch the url in the replacementUrls
				var indexInUrls = this.urls.indexOf(href);
				if (indexInUrls > -1) {
					this.replacementUrls[indexInUrls] = replacementUrl;
				}
			}.bind(this));

		replaced.push(replacment);
	}.bind(this));
	return Promise.all(replaced);
};

Resources.prototype.createCssFile = function(href, archive, resolver){
		var newUrl;
		var indexInUrls;
		archive = archive || this.settings.archive;
		resolver = resolver || this.settings.resolver;

		if (path.isAbsolute(href)) {
			return new Promise(function(resolve, reject){
				resolve(urls, replacementUrls);
			});
		}

		var absolute = resolver(href);

		// Get the text of the css file from the archive
		var textResponse = archive.getText(absolute);
		// Get asset links relative to css file
		var relUrls = this.urls.map(function(assetHref) {
				var resolved = resolver(assetHref);
				var relative = new Path(absolute).relative(resolved);

				return relative;
			}.bind(this));

		return textResponse.then(function (text) {
			// Replacements in the css text
			text = replace.substitute(text, relUrls, this.replacementUrls);

			// Get the new url
			if (this.settings.base64) {
				newUrl = core.createBase64Url(text, 'text/css');
			} else {
				newUrl = core.createBlobUrl(text, 'text/css');
			}

			return newUrl;
		}.bind(this));

};

Resources.prototype.relativeTo = function(absolute, resolver){
	resolver = resolver || this.settings.resolver;

	// Get Urls relative to current sections
	return this.urls.
		map(function(href) {
			var resolved = resolver(href);
			var relative = new Path(absolute).relative(resolved);
			return relative;
		}.bind(this));
};

Resources.prototype.substitute = function(content, url) {
	var relUrls;
	if (url) {
		relUrls = this.relativeTo(url);
	} else {
		relUrls = this.urls;
	}
	return replace.substitute(content, relUrls, this.replacementUrls);
};

module.exports = Resources;
