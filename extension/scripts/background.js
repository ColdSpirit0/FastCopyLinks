/*
	when receive link from content script - add it to array

	stores link array, like a db
*/

"use strict"

/*
	init data
*/

const DEBUG = false;

if (!DEBUG)
	console.log = function(){};

const delim = "\r\n";
var links = [];

/*
	functions for link storage
*/

function linksToText()
{
	return links.join(delim);
}

function addLink(newLink)
{
	links.push(newLink);
}

/*
	clipboard
*/

function clipboardWrite(newText)
{
	console.log("Saving to clipboard: " + newText);
	navigator.clipboard.writeText(newText);
}

/*
	messages
*/

function handleMessage(request, sender, sendResponse)
{
	console.log("Got a command: " + request.command);

	switch (request.command)
	{
		case "add-link":
			addLink(request.link);
			clipboardWrite(request.link);
			break;

		case "request-links":
			sendResponse({linkList: linksToText()});
			break

		case "copy-links":
			clipboardWrite(linksToText());
			break;

		case "clear-links":
			links = [];
			break;
	}
}

/*
	do work
*/

// listen for messages
browser.runtime.onMessage.addListener(handleMessage);

// log
console.log("background.js loaded");
