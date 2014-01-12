EPUBJS.reader.SettingsController = function() {
	var book = this.book;

	var $settings = $("#settings-modal"),
			$overlay = $(".overlay");

	var show = function() {
		$settings.addClass("md-show");
	};

	var hide = function() {
		$settings.removeClass("md-show");
	};

	var $sidebarReflowSetting = $('#sidebarReflow');

    $sidebarReflowSetting.on('click', function() {
        Reader.settings.sidebarReflow = !Reader.settings.sidebarReflow;
    });

	$settings.find(".closer").on("click", function() {
		hide();
	});

	$overlay.on("click", function() {
		hide();
	});

	return {
		"show" : show,
		"hide" : hide
	};
};