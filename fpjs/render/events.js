FP.events = {}

// -- From Monocle Events

// Fire a custom event on a given target element. The attached data object will
// be available to all listeners at evt.m.
//
// Internet Explorer does not permit custom events; we'll wait for a
// version of IE that supports the W3C model.
//
FP.core.dispatch = function (elem, evtType, data, cancelable) {
  if (!document.createEvent) {
	return true;
  }
  var evt = document.createEvent("Events");
  evt.initEvent(evtType, false, cancelable || false);
  evt.m = data;
  try {
	return elem.dispatchEvent(evt);
  } catch(e) {
	console.warn("Failed to dispatch event: "+evtType);
	return false;
  }
}


// Register a function to be invoked when an event fires.
FP.events.listen = function (elem, evtType, fn, useCapture) {
  if (typeof elem == "string") { elem = document.getElementById(elem); }
  return elem.addEventListener(evtType, fn, useCapture || false);
}


// De-register a function from an event.
FP.events.deafen = function (elem, evtType, fn, useCapture) {
  if (typeof elem == "string") { elem = document.getElementById(elem); }
  return elem.removeEventListener(evtType, fn, useCapture || false);
}