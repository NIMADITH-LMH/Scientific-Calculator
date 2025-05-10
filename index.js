const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

let mainWindow;
let splashWindow;

function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 400,
        height: 400,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        center: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, 'icon.ico')
    });

    splashWindow.loadFile('splash.html');
    splashWindow.on('closed', () => splashWindow = null);
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 500,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        resizable: true,
        title: 'Scientific Calculator',
        minWidth: 400,
        minHeight: 600,
        show: false, // Start hidden
        icon: path.join(__dirname, 'icon.ico')
    });

    mainWindow.loadFile('index.html');
    
    // Once the main window is ready, show it and close splash
    mainWindow.once('ready-to-show', () => {
        // Add a short delay for smooth transition
        setTimeout(() => {
            mainWindow.show();
            if (splashWindow) {
                splashWindow.close();
            }
        }, 3000); // 3 seconds delay - matches the splash animation
    });
    
    // Optional: Handle window closing
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createSplashWindow();
    createMainWindow();
    
    // Register F11 shortcut for fullscreen toggle
    globalShortcut.register('F11', () => {
        if (mainWindow) {
            const isFullScreen = mainWindow.isFullScreen();
            mainWindow.setFullScreen(!isFullScreen);
        }
    });
    
    // Register Esc shortcut to exit fullscreen
    globalShortcut.register('Escape', () => {
        if (mainWindow && mainWindow.isFullScreen()) {
            mainWindow.setFullScreen(false);
        }
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Unregister shortcuts when app is quitting
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
