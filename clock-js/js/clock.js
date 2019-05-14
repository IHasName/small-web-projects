document.addEventListener("DOMContentLoaded", initClock);

ty = 0;
tt = 0;

function initClock() {
    document.removeEventListener("DOMContentLoaded", initClock);
    clockElement = document.getElementById('clock');
    ty = clockElement.getAttribute('animation');
    tt = clockElement.getAttribute('time');
    clockElement.innerHTML = 
    '<li class="content counter-box"><p id="hours">' + getThree(0, 0, 23) + '</p></li>' +
    '<li class="content">:</li>' + 
    '<li class="content counter-box"><p id="minutes">' + getThree(0, 0, 59) + '</p></li>' +
    '<li class="content">:</li>' + 
    '<li class="content counter-box"><p id="seconds">' + getThree(0, 0, 59) + '</p></li>';
    updateCounter(false);
    clocker = setInterval(function() {
        updateCounter(true);
    }, 1000);
} 

function updateCounter(animate) {
    currentTime = new Date().getTime();

    time = (currentTime % 86400000) + (3600000 * 2);
    hours = Math.floor((time % 86400000) / 3600000);
    minutes = Math.floor((time % 3600000) / 60000);
    seconds = Math.floor((time % 60000) / 1000);

    hoursElement = document.getElementById("hours");
    minutesElement = document.getElementById("minutes");
    secondsElement = document.getElementById("seconds");

    hoursFormatted = getThree(hours, 0, 23);
    if(hoursElement.innerHTML != hoursFormatted) {
        if(animate) {
            hoursElement.setAttribute("style", "animation-name: " + ty + "; animation-duration: " + tt + "s");
            setTimeout(function() {
                hoursElement.innerHTML = hoursFormatted;
                hoursElement.setAttribute("style", "");
            }, tt * 1000 + 10);
        } else {
            hoursElement.innerHTML = hoursFormatted;
        }
    }
    minutesFormatted = getThree(minutes, 0, 59);
    if(minutesElement.innerHTML != minutesFormatted) {
        if(animate) {
            minutesElement.setAttribute("style", "animation-name: " + ty + "; animation-duration: " + tt + "s");
            setTimeout(function() {
                minutesElement.innerHTML = minutesFormatted;
                minutesElement.setAttribute("style", "");
            }, tt * 1000 + 10);
        } else {
            minutesElement.innerHTML = minutesFormatted;
        }
    }
    secondsFormatted = getThree(seconds, 0, 59);
    if(secondsElement.innerHTML != secondsFormatted) {
        if(animate) {
            secondsElement.setAttribute("style", "animation-name: " + ty + "; animation-duration: " + tt + "s");
            setTimeout(function() {
                secondsElement.setAttribute("style", "");
                secondsElement.innerHTML = secondsFormatted;
            }, tt * 1000 + 10);
        } else {
            secondsElement.innerHTML = secondsFormatted;
        }
    }
}

function getThree(n, m, x) {
    return formatNum(n+2 > x ? m+1 : n+2) + "\n" + formatNum(n+1 > x ? m : n+1) + "\n" + formatNum(n) + "\n" + formatNum(n-1 < m ? x : n-1);
}

function formatNum(n) {
    return (n < 10 ? '0' : '') + n;
}
