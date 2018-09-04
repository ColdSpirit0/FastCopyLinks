/*
	work with link array
	load it to clipboard
	save to file
*/

"use strict"

/*
	init variables
*/

const DEBUG = false;

if (!DEBUG)
	console.log = function(){};

var info = document.querySelector(".info");
var linkList = document.querySelector(".link-list");

/*
	messages
*/

function sendCommand(command, rfun)
{
	browser.runtime.sendMessage({command: command}).then(rfun);
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
			copyLinks();
			changeInfo("All links copied");
			break;

		case "button-clear":
			clearLinks();
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

function updateLinks()
{
	// send command to bg script
	sendCommand("request-links", function(message){
		linkList.value = message.linkList;
	});
}

function copyLinks()
{
	sendCommand("copy-links");
}

function clearLinks()
{
	sendCommand("clear-links");
	updateLinks();
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

// set default info
changeInfo();

listenForClicks();

updateLinks();

console.log("options.js loaded");
