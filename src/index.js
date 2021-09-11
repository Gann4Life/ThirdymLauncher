// See https://stackoverflow.com/questions/36515099/how-to-package-an-electron-app-into-a-single-executable/58044211
// for single EXE build.

const { app, BrowserWindow, ipcMain } = require("electron");
const DecompressZip = require("decompress-zip");
const fs = require('fs');
const path = require("path");
const request = require('request');
const url = require("url");

let downloadsFolder = path.join(__dirname, "versions");

let mainWindow;
let downloadWindow;

let downloadTitle;
let downloadFilename;

app.on("ready", () => {
    verifyVersionsFolder();
    verifyGameInstallation();

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
    var unzipper = new DecompressZip(path.join(downloadsFolder, downloadFilename));

    unzipper.on('error', function (err) {
        console.log('Caught an error');
    });
    
    unzipper.on('extract', function (log) {
        console.log('Finished extracting');
        mainWindow.webContents.send("extract-finish");
        downloadWindow.close()
        downloadWindow = null;
        fs.unlinkSync(path.join(downloadsFolder, downloadFilename));
    });
    
    unzipper.on('progress', function (fileIndex, fileCount) {
        console.log('Extracted file ' + (fileIndex + 1) + ' of ' + fileCount);
        showProgress(fileIndex, fileCount);
    });
    
    unzipper.extract({
        path: downloadsFolder,
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

function arrayContains(needle, arrhaystack)
{
    var hasNeedleBeenFound = false;
    arrhaystack.forEach(item => {
        if (item.includes(needle)) {
            hasNeedleBeenFound = true;
        }
    });
    return hasNeedleBeenFound;
}

function nameFromLink(link){
    const slicedUrl = link.split("/"); 
    const filename = slicedUrl[slicedUrl.length - 1];
    return filename;
}

function getJsonFromURL(link, callback) {
    const options = { json: true };
    request(link, options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            callback(body);
        } else {
            return console.log(error);
        }
    });
}

function verifyVersionsFolder() {
    if (fs.existsSync(downloadsFolder)) {
        console.log("'versions' EXISTS IN '" + __dirname + "'");
    } else {
        console.log("'versions' NOT FOUND. CREATING 'versions' FOLDER IN '" + __dirname + "'");
        fs.mkdir(downloadsFolder), (err) => {
            if (err) {
                return console.log(err);
            }
            console.log("'versions' WAS CREATED IN '" + __dirname + "'");
        };
    }
}

function verifyGameInstallation() {
    var needsToUpdate;
    if (fs.existsSync(downloadsFolder)) {
        fs.readdir(downloadsFolder, (err, files) => {
            getJsonFromURL("http://gann4life.ga/json/data.json", res => {
                const lastGameVersion = res.games.thirdym.version;
                needsToUpdate = !arrayContains(lastGameVersion, files);
                mainWindow.webContents.send("requires-update", {
                    required: needsToUpdate,
                    version: lastGameVersion
                });
            });
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

    var out = fs.createWriteStream(path.join(downloadsFolder, downloadFilename));
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