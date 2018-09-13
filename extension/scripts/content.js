/*
	wait for ctrl+c press
	get hovered link
	send to background

	helps copy to clipboard
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
        DEBUG
    */

    const DEBUG = false;
    const FILENAME = "content.js";

    if (DEBUG)
    {
        console.log = function() {
            var context = FILENAME + ":";
            return Function.prototype.bind.call(console.log, console, context);
        }();
    }
    else
    {
        console.log = function(){};
    }

	/*
		init variables
	*/

	//var port = browser.runtime.connect({name: "content-script-port"});

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

	function onMessage(message)
	{
	    runCommand(message.command, message.info);
	};

	function sendMessage(message)
	{
	    browser.runtime.sendMessage(message);
	}

	/*
	    commands
	*/

	function runCommand(command, info)
	{
	    console.log("Running command: " + command);

	    switch(command)
	    {
	        // copies text to clipboard
	        case "clipboard-write":
                const el = document.createElement('textarea');
                el.value = info;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
	            break;
	    }
	}

	function sendCommand(command, info)
	{
	    console.log("Sending command: " + command + ". With info: " + info);
	    sendMessage({command: command, info: info});
	}

	function sendLink(link)
	{
	    console.log("Sending link: " + link);
		sendCommand("add-link", link);
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

	browser.runtime.onMessage.addListener(onMessage);

	console.log("content.js loaded");
})();
