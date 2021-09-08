const { ipcRenderer } = require("electron");
const path = require("path");
const fs = require("fs");


const downloadButton = document.querySelector("#dl-button");
const playButton = document.querySelector("#play-button");

ipcRenderer.on("download-finished", () => {
    downloadButton.classList.add("d-none");
    playButton.classList.remove("d-none");
    extractGame();
})

function extractGame() {
    ipcRenderer.send("extract-game");
}

function playGame() {

}

function downloadThirdym() {
    const webFile = {
        link: "https://github.com/Gann4/Thirdym/releases/download/0.1.0-alpha/Thirdym.v0.1.0-alpha.zip",
        filepath: path.join(__dirname, "../downloads"),
    };
    ipcRenderer.send("download-file", webFile);
}