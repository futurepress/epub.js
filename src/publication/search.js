/**
 * Find a string in a section
 * @param  {string} _query The query string to find
 * @return {object[]} A list of matches, with form {cfi, excerpt}
 */
find(_query){
	var section = this;
	var matches = [];
	var query = _query.toLowerCase();
	var find = function (node) {
		var text = node.textContent.toLowerCase();
		var range = section.document.createRange();
		var cfi;
		var pos;
		var last = -1;
		var excerpt;
		var limit = 150;

		while (pos != -1) {
			// Search for the query
			pos = text.indexOf(query, last + 1);

			if (pos != -1) {
				// We found it! Generate a CFI
				range = section.document.createRange();
				range.setStart(node, pos);
				range.setEnd(node, pos + query.length);

				cfi = section.cfiFromRange(range);

				// Generate the excerpt
				if (node.textContent.length < limit) {
					excerpt = node.textContent;
				}
				else {
					excerpt = node.textContent.substring(pos - limit / 2, pos + limit / 2);
					excerpt = "..." + excerpt + "...";
				}

				// Add the CFI to the matches list
				matches.push({
					cfi: cfi,
					excerpt: excerpt
				});
			}

			last = pos;
		}
	};

	sprint(section.document, function (node) {
		find(node);
	});

	return matches;
}