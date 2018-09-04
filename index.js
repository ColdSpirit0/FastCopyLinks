var self = require('sdk/self');
var { Hotkey } = require("sdk/hotkeys");
var tabs = require("sdk/tabs");
var selection = require("sdk/selection");
var clipboard = require("sdk/clipboard");
var pageMod = require("sdk/page-mod");
var array = require('sdk/util/array');
var buttons = require('sdk/ui/button/action');



var pageWorkers = [];
function getActiveTabWorker(){
        for(i=0; i<pageWorkers.length; i++)
                if(pageWorkers[i].tab === tabs.activeTab)
                        return pageWorkers[i];
        return null;
}

/* create button */
var activated = false;

//set label description
var labelText = "\nPlugin works with pages, which was opened AFTER activation FCL." +
                "\nFor copy link - hover cursor on link and press Ctrl+C." +
                "\nCtrl+Alt+C copies all links to buffer, what was copied with Ctrl+C hotkeys after FCL activation.";
                
var activatedLabel = 'Deactivate FCL' + labelText;
var deactivatedLabel = 'Activate FCL' + labelText;

//set icon styles
var activatedIcons = {
                "16": "./activated-16.png",
                "32": "./activated-32.png",
                "64": "./activated-64.png"
};

var deactivatedIcons = {
                "16": "./deactivated-16.png",
                "32": "./deactivated-32.png",
                "64": "./deactivated-64.png"
};


var button = buttons.ActionButton({
        id: "fast-copy-links",
        label: deactivatedLabel,
        icon: deactivatedIcons,
        onClick: toggleActivation
});

var links = '';
var mod = null;
var copyHK = null;
var copyListHK = null;

function toggleActivation(){
        
        /* turn on plugin */
        if(!activated){
                /* clear clipboard, change label and icons */
                clipboard.set('');
                button.label = activatedLabel,
                button.icon = activatedIcons;
                
                /* turn on pageMod */
                mod = pageMod.PageMod({
                        include: '*',
                        contentScriptFile: "./getElement.js",
                        attachTo: ["existing", "top"],
                        onAttach: function(worker) {
                                console.log('attach page');
                                array.add(pageWorkers, worker);
                                worker.on('pageshow', function() { array.add(pageWorkers, this); });
                                worker.on('pagehide', function() { array.remove(pageWorkers, this); });
                                worker.on('detach', function() { array.remove(pageWorkers, this); });
                                worker.port.on('link found', function(link){
                                        links += link + "\r\n"
                                        clipboard.set(link);
                                });
                        }
                });
                /* create hotkey listeners */
                
                //Ctrl+C
                copyHK = Hotkey({
                        combo: "accel-c",
                        onPress: function() {
                                /* if no selection - then copy link, else - copy selection */
                                if (!selection.text){
                                        var activeWorker = getActiveTabWorker();
                                        if(activeWorker !== null)
                                                activeWorker.port.emit("keyPressed");
                                }
                                else{
                                        clipboard.set(selection.text);
                                }
                        }
                });
                
                //Ctrl+Alt+C
                copyListHK = Hotkey({
                        combo: "accel-alt-c",
                        onPress: function() {
                                clipboard.set(links);
                        }
                });
        }
        
        /* turn off plugin */
        else{
                /* change button style */
                button.label = deactivatedLabel;
                button.icon = deactivatedIcons;
                
                /* destroy active elements */
                mod.destroy();
                copyHK.destroy();
                copyListHK.destroy();
                links = '';
        }
        /* toggle */
        activated = !activated;
}
