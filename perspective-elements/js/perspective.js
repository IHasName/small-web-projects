'use strict';

// Created by LikeWhat (https://github.com/IHasName)
// Project Page: https://github.com/IHasName/small-web-projects/tree/master/perspective-elements
var perspectivejs = (function () {

    var pjs = function(settings) {
        var pjs_ = this;
        pjs_.settings = {
            autoInit: true, // Whether the Script should initialize automatically (When set to false you'll have to use the init Function)
            transition_duration: 150, // Defines how long the Element needs to follow the Mouse
            max_tilt: 20, // Maximum Degree the Element should follow 
            max_brightness: 1.3, // How much the Brightness should change depending on Tilt (-1 to disable)
            easing: "ease", // Movement Easing 
            perspective: "800px", // Perspective Tag (Should look fine for everything)
            disableLoaded: false // Whether the Loaded Messsage should be displayed or not
        }
        extendObj(pjs_.settings, settings);

        // This automatic Update Rate should be fine but can be changed via the Controller 
        pjs_.updateEvery = pjs_.settings.transition_duration / 10
        if(pjs_.settings.autoInit) {
            pjs_.waitThenInit();
        }
    }

    pjs.prototype.waitThenInit = function() {
        document.addEventListener("DOMContentLoaded", this.init());
    }
    
    pjs.prototype.init = function() {
        var pjs_ = this;
        pjs_.elements = document.querySelectorAll('.perspective');

        pjs_.elements.forEach(e => {
            e.innerHTML = '<div class="perspective-object" id="' + e.getAttribute("pjs-container-id") + '" style="transform: perspective(0);transition:none">' + e.innerHTML + '</div>';
            e.addEventListener("mousemove", function(ev) {
                pjs_.update(ev, this)
            });
            e.addEventListener("mouseleave", function(e) {
                var df = this.querySelector(".perspective-object")
                df.style.transition = 'all ' + (pjs_.getValue(this, "transition_duration")/1000) + 's ' + pjs_.getValue(this, "easing");
                df.style.transform = "perspective(0)";
                df.style.filter = "";
                df.updateCount = 0;
            });
            e.addEventListener("mouseenter", function(e) {
                var df = this.querySelector(".perspective-object")
                df.style.transition = 'all ' + (pjs_.getValue(this, "transition_duration")/1000) + 's ' + pjs_.getValue(this, "easing");
                df.updateCount = 0;
                pjs_.update(e, this, 1);
            })
        })
        if(!pjs_.settings.disableLoaded) {
            console.log("PerspectiveElementsJS loaded")
        }
    }

    pjs.prototype.update = function(e, ele, f) {
        var pjs_ = this;
        var df = ele.querySelector(".perspective-object");

        // Only update when needed
        if(++df.updateCount > pjs_.updateEvery || f) {
            df.updateCount = 0;
        } else {
            return;
        }

        var hlX = ele.scrollWidth / 2;
        var hlY = ele.scrollHeight / 2;
    
        var top = 0;
        var left = 0;
        var tmpe = ele

        // Make sure we have the right offset to the Page
        while(tmpe.offsetParent) {
            top += tmpe.offsetTop;
            left += tmpe.offsetLeft;
            tmpe = tmpe.offsetParent;
        }

        // Maphfs
        var ofY = Math.max(e.pageY, top) - Math.min(e.pageY, top) - hlY;
        var ofX = Math.max(e.pageX, left) - Math.min(e.pageX, left) - hlX;
         
        var aX = pjs_.getValue(ele, "max_tilt") / hlX; 
        var aY = pjs_.getValue(ele, "max_tilt") / hlY;
 
        var iX = ofX * aX * (pjs_.getValue(ele, "invert") ? -1 : 1);
        var iY = ofY * aY * (pjs_.getValue(ele, "invert") ? -1 : 1);
 
        if(pjs_.getValue(ele, "max_brightness") > 0) {
            var brF = (pjs_.getValue(ele, "max_brightness") - 1) / pjs_.getValue(ele, "max_tilt");
            var br = Math.max((1 + (brF * -iY)), 0)
    
            df.style.filter = 'brightness(' + br + ')';
        }
        df.style.transform = 'perspective(' + pjs_.getValue(ele, "perspective") + ') rotateX(' + -iY + 'deg) rotateY(' + iX + 'deg)';
    }

    // Returns a Value thats set on the Element or from the Settings
    pjs.prototype.getValue = function(ele, val) {
        if(ele.getAttribute("pjs-" + val) != undefined) {
            // Boolean check since it converts those to Strings c:
            if(ele.getAttribute("pjs-" + val) == "true" || ele.getAttribute("pjs-" + val) == "false") {
                return ele.getAttribute("pjs-" + val) == "true";
            }
            return ele.getAttribute("pjs-" + val)
        } else {
            return this.settings[val];
        }
    }

    return pjs;
})();

function extendObj(object, toextend) {
    if (typeof toextend != "undefined") {
        for (var prop in toextend) {
            if (toextend[prop] != undefined) {
                object[prop] = toextend[prop];
            }
        }
    }
}

