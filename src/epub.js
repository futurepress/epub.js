var Book = require('./book');
var EpubCFI = require('./epubcfi');

function ePub(_url) {
	return new Book(_url);
};

ePub.VERSION = "0.3.0";

ePub.CFI = EpubCFI;

ePub.ViewManagers = {};
ePub.Views = {};
ePub.register = {
	manager : function(name, manager){
  	return ePub.ViewManagers[name] = manager;
	},
	view : function(name, view){
		return ePub.Views[name] = view;
	}
};

// Default Views
ePub.register.view("iframe", require('./views/iframe'));

// Default View Managers
ePub.register.manager("single", require('./managers/single'));
ePub.register.manager("continuous", require('./managers/continuous'));
ePub.register.manager("paginate", require('./managers/paginate'));

module.exports = ePub;
