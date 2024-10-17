const { app, BrowserWindow } = require('electron');
const path = require('path');

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: process.platform === 'darwin' 
            ? path.join(__dirname, 'icons/icon.icns') 
            : path.join(__dirname, 'icons/icon_256x256.ico'),
    });
    win.maximize();
    win.loadFile('index.html');
}

function openFile(filePath) {
    console.log('File opened:', filePath);
}

app.whenReady().then(() => {
    createWindow();

    app.on('open-file', (event, filePath) => {
        event.preventDefault();
        if (win) {
            openFile(filePath);
        } else {
            app.once('browser-window-created', () => {
                openFile(filePath);
            });
        }
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    if (process.platform === 'win32' && process.argv.length >= 2) {
        const openedFilePath = process.argv[1];
        openFile(openedFilePath);
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('second-instance', (event, argv) => {
    if (process.platform === 'win32' && argv.length >= 2) {
        const openedFilePath = argv[1];
        if (win) {
            openFile(openedFilePath);
        }
    }
});
