document.addEventListener('DOMContentLoaded', initS);

triggers = [];

function initS() {
    document.removeEventListener('DOMContentLoaded', initS);

    trigger = document.getElementsByClassName("collapse-control");
    for(i = 0; i < trigger.length; i++) {
        t = trigger[i];
        t.addEventListener("click", handleCollapse);
        triggers.push(t);
    }
}

function handleCollapse(e) {
    t = e.target;
    
    collapsable = document.getElementById(t.getAttribute("trigger-for"));
    cl = collapsable.classList;
    if(cl.contains("collapsed")){
        cl.remove("collapsed");
        t.classList.remove("closed");
    } else {
        cl.add("collapsed");
        t.classList.add("closed");
    }
}