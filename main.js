const path  = require('path');
const os  = require('os');
const fs  = require('fs');
const resizeImg = require('resize-img');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');

process.env.NODE_ENV = 'production';

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
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
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname,'./renderer/index.html'));
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

    mainWindow.on('closed', () => (mainWindow = null))

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

//Response to ipc reander resize
ipcMain.on('image:resize', (e, option)=> {
    option.dest = path.join(os.homedir(), 'imageresizer')
    resizeImage(option);
})

async function resizeImage({imgPath, width, height, dest}) {
    try {
      const newPath = await resizeImg(fs.readFileSync(imgPath), {
        width: +width,
        height: +height
      });
      
      const filename = path.basename(imgPath);

      if(!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
      }

      fs.writeFileSync(path.join(dest, filename), newPath);

      mainWindow.webContents.send('image:done');

      shell.openPath(dest);
    }
    catch(err) {
        console.log(err);
    }
}

app.on('window-all-closed', () => {
    if (!isMac) app.quit()
});