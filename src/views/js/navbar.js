let btns = document.querySelectorAll("#navbtn");

function setInactiveAllOtherButtons(enabledIndex) {
    for(var i = 0; i < btns.length; i++) {
        var btn = btns[i];
        if (i != enabledIndex && btn.classList.contains("active")) {
            btn.classList.remove("active");
        }
    }
}

function showTab(tabname) {
    const tabs = document.querySelectorAll("div[tab-display]");
    tabs.forEach(i => {
        if (i.getAttribute("tab-display") == tabname) {
            i.classList.remove("d-none");
        } else {
            if (!i.classList.contains("d-none")) {
                i.classList.add("d-none")
            }
        }
    })
}

for(var i = 0; i < btns.length; i++) {
    var btn = btns[i];
    btn.onclick = function () {
        if (!this.classList.contains("active")) {
            setInactiveAllOtherButtons(i);
            showTab(this.getAttribute("tab-display"));
            this.classList.add("active");
        }
    }
}