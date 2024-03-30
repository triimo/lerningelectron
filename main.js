const path  = require('path');
const { app, BrowserWindow, Menu } = require('electron');

const isDev = process.env.NODE_ENV !== 'development';
const isMac = process.platform === 'darwin';

function createMainWindow() {
    const mainWIndow = new BrowserWindow({
        title: 'Image Resizer',
        width: isDev ? 1000 : 500,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    // Open devtool if in dev enf
    if(isDev) {
        mainWIndow.webContents.openDevTools();
    }

    mainWIndow.loadFile(path.join(__dirname,'./renderer/index.html'));
}

//Create About Windows 
function createAboutWindow() {
    const AboutWindow = new BrowserWindow({
        title: 'About Image Resizer',
        width: 300,
        height: 300
    });

    AboutWindow.loadFile(path.join(__dirname,'./renderer/about.html'));
}


app.whenReady().then(() => {
    createMainWindow();

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) 
        createMainWindow()
      })

});

//Menu template
const menu = [
    ...(isMac ? [{
        label: app.name,
        submenu: [
            {
              label: 'About',
              click: createAboutWindow,
            }
        ]
    }] : []),
    {
        role: 'fileMenu',
    },
    ...(!isMac ? [{
        label: 'Help',
        submenu: [{
            label: 'About',
            click: createAboutWindow,
        }]
    }]:[])
];

app.on('window-all-closed', () => {
    if (!isMac) app.quit()
});