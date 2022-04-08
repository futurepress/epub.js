export function isAbsolute(inputUrl) {
	if (!inputUrl) {
		return
	}
	if (inputUrl instanceof URL) {
		return true;
	}
	return inputUrl.indexOf("://") > -1;
}

export function createUrl(inputUrl, base) {
	if (inputUrl instanceof URL) {
		return inputUrl;
	} else if (!base && !isAbsolute(inputUrl)) {
		let locationBase = "";
		if (typeof(window) !== "undefined" &&
			typeof(window.location) !== "undefined") {
			locationBase = window.location.href;
		} else {
			locationBase = "http://example.com"; // Prevent URL error
		}
		return new URL(inputUrl, locationBase);
	} else {
		return new URL(inputUrl, base);
	}
}

export function filename(inputUrl) {
	const url = createUrl(inputUrl);
	return url.pathname.split('/').pop();
}

export function directory(inputUrl) {
	const url = createUrl(inputUrl);
	const name = filename(url);
	return url.pathname.replace(name, "");
}

export function extension(inputUrl) {
	const name = filename(inputUrl);
	return name.split('.').pop();
}

export function resolve(inputUrl, path) {
	const url = createUrl(inputUrl); 
	return new URL(path, url).href;
}

export function relative(inputUrl, path) {
	const url = createUrl(inputUrl); 
	return new URL(path, url).pathname;
}