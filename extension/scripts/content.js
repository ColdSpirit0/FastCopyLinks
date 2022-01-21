/*
	wait for ctrl/cmd+c press
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

			// get link from page
			case "get-hovered-link":

				// get hovered element
				var target = getInnermostHovered();

				// then recursive find link from top element to "document" element
				var link = findLink(target);

				//if found
				if (link) { sendLink(link); }
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
		events and removal protection
	*/

	var rootElement = document.documentElement;

	function attachEvent()
	{
		console.log("Attaching event")
		rootElement.addEventListener("keydown", function(e)
		{
			e = e || window.event;
			// keyCode detection
			var key = e.which || e.keyCode;
			// ctrl/cmd key detection
			var modKey = e.ctrlKey ? e.ctrlKey : (
				(key === 17) ? true : (
					e.metaKey ? true : false
				)
			);

			// if Ctrl+C or Cmd+C pressed
			if ( modKey && key == 67 )
			{
				console.log("Ctrl/Cmd+C pressed");
				sendCommand("modKey-c-event");
			}
		}, false);
	}

	var observer = new MutationObserver(function(mutations)
	{
		mutations.forEach(function(mutation)
		{
			// check is event handler in list of removed elements
			mutation.removedNodes.forEach(function(removedElement)
			{
				if (removedElement == rootElement)
				{
					console.log("Removed event handler: " + removedElement);

					rootElement = document.documentElement;
					attachEvent();
				}
			});
		});
	});

	observer.observe(document, {childList: true});

	attachEvent();

	browser.runtime.onMessage.addListener(onMessage);

	console.log("content.js loaded");
})();
