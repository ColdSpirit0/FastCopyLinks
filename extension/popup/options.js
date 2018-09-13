"use strict"

/*
    DEBUG
*/

const DEBUG = false;
const FILENAME = "options.js";

if (DEBUG)
{
    console.log = function() {
        var context = FILENAME;
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

var info = document.querySelector(".info");
var linkList = document.querySelector(".link-list");

/*
	messages
*/

function onMessage(message)
{
    runCommand(message.command, message.info);
}

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

	switch (command)
	{
	    // add links to textarea
		case "show-links":
		    linkList.value = info;
			break;
	};
}

function sendCommand(command, info)
{
    console.log("Sending command: " + command + ". With info: " + info);
    sendMessage({command: command, info: info});
}

/*
	buttons and button events
*/

function isButton(e)
{
	return e.classList.contains("button");
}

function onButtonPressed(buttonId)
{
	console.log("Pressed button: " + buttonId);

	switch(buttonId)
	{
		case "button-copy":
		    if (linkList.value.length > 0) {
        	    sendCommand("copy-links");
		    }
		    else {
		        changeInfo("Nothing to copy!");
		    }
			break;

		case "button-clear":
        	sendCommand("clear-links");
	        requestLinks();
			changeInfo("Links cleared");
			break;
	}
}


/*
	form
*/

function changeInfo(newInfo)
{
	// validate
	if (newInfo == null)
	{
		newInfo = "Hover on link and press Ctrl+C";
	}

	console.log("Changing info to: " + newInfo);

	info.innerHTML = newInfo;
}

function requestLinks()
{
    sendCommand("request-links");
}

/*
	events
*/

function listenForClicks()
{
	document.addEventListener("click", (e) => {

		if (isButton(e.target))
			onButtonPressed(e.target.id);
	});
}

/*
	do work
*/

browser.runtime.onMessage.addListener(onMessage);

// set default info
changeInfo();

listenForClicks();

requestLinks();

console.log("options.js loaded");
