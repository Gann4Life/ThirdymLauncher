const { ipcRenderer } = require("electron");
const path = require("path");
const fs = require("fs");
const request = require("request");

const downloadButton = document.querySelector("#dl-button");
const playButton = document.querySelector("#play-button");

ipcRenderer.on("download-finished", () => {
    downloadButton.classList.add("d-none");
    playButton.classList.remove("d-none");
    extractGame();
});

function extractGame() {
    ipcRenderer.send("extract-game");
}

function playGame() {

}

function downloadThirdym() {
    downloadButton.classList.add("d-none");
    request("http://gann4life.ga/json/data.json", {json: true}, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            const webFile = { link: body.games.thirdym.download };
            ipcRenderer.send("download-file", webFile);
        } else {
            return console.log(error);
        }
    });
}