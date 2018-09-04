function getTarget(e){
    if (e.target) return e.target;
    else if (e.srcElement) return e.srcElement;
}

function getInnermostHovered() {
    var n = document.querySelector(":hover");
    var nn;
    while (n) {
        nn = n;
        n = nn.querySelector(":hover");
    }
    return nn;
}

function qualifyURL(url){
    var a = document.createElement('a');
    a.href = url; // set string url
    url = a.href; // get qualified url
    a.href = null; // no server request
    return url;
}

function findLink(element){    
    if (element !== document){
        if(element.tagName === "A"){
            //console.log(element.getAttribute("href"));
            var link = element.getAttribute("href");
            //console.log(link);
            return qualifyURL(link);
        }
        else{
            return findLink(element.parentNode);
        }
    }
    else 
        return null;
}
/* main function */
self.port.on('keyPressed', function(){
        // get element
        target = getInnermostHovered();
        // then recursive find link from top element to "document" element
        link = findLink(target);
        //if found - send to plugin
        if (link) 
                self.port.emit("link found", link);
});




