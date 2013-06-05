//-- http://stackoverflow.com/questions/2124684/jquery-how-click-anywhere-outside-of-the-div-the-div-fades-out

jQuery.fn.extend({
  // Calls the handler function if the user has clicked outside the object (and not on any of the exceptions)
  clickOutside: function(handler, exceptions) {
	  var $this = this;

	  jQuery(document).on("click.offer", function(event) {
		  if (exceptions && jQuery.inArray(event.target, exceptions) > -1) {
			  return;
		  } else if (jQuery.contains($this[0], event.target)) {
			  return;
		  } else {
			  jQuery(document).off("click.offer");
			  handler(event, $this);
		  }
	  });

	  return this;
  }
});
