/*
	wait for ctrl+c press
	get hovered link
	send to background
*/

(function() {
	/**
	* Check and set a global guard variable.
	* If this content script is injected into the same page again,
	* it will do nothing next time.
	*/
	if (window.hasRun) {
		return;
	}
	window.hasRun = true;

	/*
		init variables
	*/

	const DEBUG = false;

	if (!DEBUG)
		console.log = function(){};

	/*
		copy link functions
	*/

	function getInnermostHovered()
	{
		var n = document.querySelector(":hover");
		var nn;
		while (n) {
			nn = n;
			n = nn.querySelector(":hover");
		}
		return nn;
	}

	function qualifyURL(url)
	{
		var a = document.createElement('a');
		a.href = url; // set string url
		url = a.href; // get qualified url
		a.href = null; // no server request
		return url;
	}

	function findLink(element)
	{
		if (element !== document)
		{
			if(element.tagName === "A")
			{
				var link = element.getAttribute("href");
				return qualifyURL(link);
			}
			else
			{
				return findLink(element.parentNode);
			}
		}
		else
		{
			return null;
		}
	}

	/*
		messages
	*/

	function sendLink(link)
	{
		browser.runtime.sendMessage({command: "add-link", link: link});
	}

	/*
		events
	*/

	document.body.addEventListener("keydown",function(e)
	{
		e = e || window.event;
		var key = e.which || e.keyCode; // keyCode detection
		var ctrl = e.ctrlKey ? e.ctrlKey : ((key === 17) ? true : false); // ctrl detection

		// if Ctrl+C pressed
		if ( key == 67 && ctrl )
		{
			console.log("Ctrl+C pressed");

			/*
				get link from page
			*/

			// get hovered element
			var target = getInnermostHovered();

			// then recursive find link from top element to "document" element
			var link = findLink(target);

			//if found
			if (link) { sendLink(link); }
		}
	},false);

	console.log("content.js loaded");
})();