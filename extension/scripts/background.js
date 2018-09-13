/*
	when receive link from content script - add it to array

	stores link array, like a db
*/

"use strict"

/*
    DEBUG
*/

const DEBUG = false;
const FILENAME = "background.js";

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
	init data
*/

const DELIM = "\r\n";
var links = [];
//var port;

// get browser version
var browserVersion;
browser.runtime.getBrowserInfo().then(function(info)
{
    browserVersion = parseInt(info.version, 10) || -1;
});

/*
	functions for link storage
*/

function linksToText()
{
	return links.join(DELIM);
}

/*
	clipboard
*/

function clipboardWrite(newText)
{
	console.log("Saving to clipboard: " + newText);

    // ver 63 needed for clipboard.writeText
    if (browserVersion < 63)
    {
        sendCommandToActiveTab("clipboard-write", newText);
    }
    else
    {
    	navigator.clipboard.writeText(newText);
    }
}

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
	    // adds link to list and copy to clipboard
		case "add-link":
	        links.push(info);
			clipboardWrite(info);
			break;

        // returns links to requester
		case "request-links":
			sendCommand("show-links", linksToText());
			break;

        // copies all links from list to clipboard
		case "copy-links":
			clipboardWrite(linksToText());
			break;

        // clears link list
		case "clear-links":
			links = [];
			break;
	};
}

function sendCommand(command, info)
{
    console.log("Sending command: " + command + ". With info: " + info);
    sendMessage({command: command, info: info});
}

function sendCommandToActiveTab(command, info)
{
    browser.tabs.query({active: true, currentWindow: true}).then(function(tabs){
        browser.tabs.sendMessage(tabs[0].id, {command: command, info: info});
    });
}

/*
	do work
*/

// listen for messages
browser.runtime.onMessage.addListener(onMessage);

// log
console.log("background.js loaded");
