// See https://stackoverflow.com/questions/36515099/how-to-package-an-electron-app-into-a-single-executable/58044211
// for single EXE build.

const { app, BrowserWindow, ipcMain } = require("electron");
const url = require("url");
const path = require("path");

var DecompressZip = require("decompress-zip");
// var unzipper = new DecompressZip(filename)

const request = require('request');
const fs = require('fs');

let mainWindow;
let downloadWindow;

let downloadTitle;
let downloadFilename;

app.on("ready", () => {
    checkVersionsFolder();
    mainWindow = new BrowserWindow({
        width: 800,
        height: 420,
        frame: false,
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
    mainWindow.setMenu(null);
    mainWindow.setResizable(false);
})

ipcMain.on("download-file", (e, webFile) => {
    openProgressWindow();
    
    downloadFilename = nameFromLink(webFile.link);
    downloadFile(webFile);
})

// Documentation: https://www.npmjs.com/package/decompress-zip
ipcMain.on("extract-game", () => {
    openProgressWindow();
    
    downloadTitle = "Decompressing...";
    downloadFilename = "Thirdym.v0.1.0.zip";

    var unzipper = new DecompressZip(path.join(__dirname, "downloads/Thirdym.v0.1.0-alpha.zip"));

    unzipper.on('error', function (err) {
        console.log('Caught an error');
    });
    
    unzipper.on('extract', function (log) {
        console.log('Finished extracting');
        downloadWindow.close()
        downloadWindow = null;
    });
    
    unzipper.on('progress', function (fileIndex, fileCount) {
        console.log('Extracted file ' + (fileIndex + 1) + ' of ' + fileCount);
        showProgress(fileIndex, fileCount);
    });
    
    unzipper.extract({
        path: path.join(__dirname, "downloads"),
        filter: function (file) {
            return file.type !== "SymbolicLink";
        }
    });
})

function openProgressWindow(){
    downloadWindow = new BrowserWindow({
        width: 400,
        height: 200,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    downloadWindow.loadURL(url.format({
        pathname: path.join(__dirname, "views/download-progress.html"),
        protocol: "file",
        slashes: true
    }))
    downloadWindow.setMenu(null);
    downloadWindow.setResizable(false);
}

function nameFromLink(link){
    const slicedUrl = link.split("/"); 
    const filename = slicedUrl[slicedUrl.length - 1];
    return filename;
}

function checkVersionsFolder() {
    if (fs.existsSync(path.join(__dirname, "versions"))) {
        console.log("'versions' EXISTS IN '" + __dirname + "'");
    } else {
        console.log("'versions' NOT FOUND. CREATING 'versions' FOLDER IN '" + __dirname + "'");
        fs.mkdir(path.join(__dirname, "versions"), (err) => {
            if (err) {
                return console.log(err);
            }
            console.log("'versions' WAS CREATED IN '" + __dirname + "'")
        });
    }
}

// Source: https://ourcodeworld.com/articles/read/228/how-to-download-a-webfile-with-electron-save-it-and-show-download-progress
function downloadFile(webFile){
    
    downloadTitle = "Downloading..."

    // Save variable to know progress
    var received_bytes = 0;
    var total_bytes = 0;

    var req = request({
        method: 'GET',
        uri: webFile.link
    });

    var out = fs.createWriteStream(path.join(webFile.filepath, nameFromLink(webFile.link)));
    req.pipe(out);

    // Change the total bytes value to get progress later.
    req.on('response', data => {
        total_bytes = parseInt(data.headers['content-length' ]);
    });

    // Update the received bytes
    req.on('data', chunk => {
        received_bytes += chunk.length;
        showProgress(received_bytes, total_bytes);
    });

    req.on('end', () => {
        console.log("File succesfully downloaded");
        downloadWindow.close();
        mainWindow.webContents.send("download-finished");
    });
}

function showProgress(received, total) {
    var percentage = (received * 100) / total;
    console.log(percentage + "% | " + received + " bytes out of " + total + " bytes.");

    downloadProgress = {
        progress: percentage,
        title: downloadTitle,
        filename: downloadFilename
    };
    downloadWindow.webContents.send("download-progress", downloadProgress);
}