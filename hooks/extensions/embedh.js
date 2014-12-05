EpubGuest = function (element, options) {
	return new Annotator.Guest(element, options);
}

window.hypothesisRole = EpubGuest;

window.hypothesisConfig = function () {
	return {};
};
