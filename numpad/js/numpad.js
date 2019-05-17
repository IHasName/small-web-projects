// Add Eventlistener for Document load
document.addEventListener("DOMContentLoaded", init);

// Numpad Values
var editing = null;
var mainnumpad = null;
numpadHeight = 269;
numpadWidth = 203.5;
numpadCurrentX = 0;
numpadCurrentY = 0;

// Cursor Stuff
startX = 0;
startY = 0;

function init() {
    // Remove Load Listener 
    document.removeEventListener("DOMContentLoaded", init);
    
    numpads = document.getElementsByClassName("numpads");
    if(numpads) {
        for(let num of numpads) {
            num.setAttribute("onfocus", "numpadOpen('" + num.id + "')");
        }
    }
    mainnumpad = document.getElementById("numpad");

    initMouseEvents();
}

function initMouseEvents() {
    mainnumpad.addEventListener("mousedown", function(e) {
        startX = e.clientX - numpadCurrentX;
        startY = e.clientY - numpadCurrentY;
        window.addEventListener("mousemove", handleMove);
    });
    document.addEventListener("mouseup", function() {
        window.removeEventListener("mousemove", handleMove);
    });
}

function handleMove(e) {
    console.log("cursorX: " + e.clientX + " cursorY: " + e.clientY + " startY: " + startY + " startX: " + startX);
    mainnumpad.style.top = e.clientY - startY;
    mainnumpad.style.left = e.clientX - startX; 
}

function numpadOpenAt(n, x, y) {
    editing = document.getElementById(n);
    mainnumpad.classList.remove("hidden");
    numpadCurrentY = y - numpadHeight;
    mainnumpad.style.top = numpadCurrentY;
    numpadCurrentX = x - numpadWidth; 
    mainnumpad.style.left = numpadCurrentX;
    mainnumpad.style.display = null;
}
function numpadOpen(n) {
    if(editing) {
        return;
    }
    numpadOpenAt(n, window.innerWidth / 2, window.innerHeight / 2);
}
function numpadClose() {
    editing = null;
    mainnumpad.classList.add("hidden");
    setTimeout(function() {
        mainnumpad.setAttribute("style", "display: none")
    }, 600);
}
function numpadInput(b) {
    if(!editing) {
        return;
    }
    currval = editing.value;
    if(b == "$del") {
        if(currval.length == 0) {
            return;
        }
        editing.value = currval.substring(0, currval.length-1);
    } else {
        editing.value = currval + b;
    }
}