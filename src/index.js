const { app, BrowserWindow, ipcMain } = require("electron");
const url = require("url");
const path = require("path");
var request = require('request');
var fs = require('fs');

let mainWindow;
app.on("ready", () => {
    mainWindow = new BrowserWindow({
        width: 720,
        height: 480,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "views/index.html"),
        protocol: "file",
        slashes: true
    }))
})

ipcMain.on("download-file", (e, webFile) => {
    fullpath = path.join(__dirname, webFile.path);
    downloadFile(webFile.link, fullpath);

})

function downloadFile(file_url , targetPath){
    // Save variable to know progress
    var received_bytes = 0;
    var total_bytes = 0;

    var req = request({
        method: 'GET',
        uri: file_url
    });

    var out = fs.createWriteStream(targetPath);
    req.pipe(out);

    req.on('response', function ( data ) {
        // Change the total bytes value to get progress later.
        total_bytes = parseInt(data.headers['content-length' ]);
    });

    req.on('data', function(chunk) {
        // Update the received bytes
        received_bytes += chunk.length;

        showProgress(received_bytes, total_bytes);
    });

    req.on('end', function() {
        console.log("File succesfully downloaded");
    });
}

function showProgress(received,total){
    var percentage = (received * 100) / total;
    console.log(percentage + "% | " + received + " bytes out of " + total + " bytes.");
}