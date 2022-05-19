// ---------- FIX PARA ELECTRON E ALERT
// Veja o arquivo msgbox-front.js para mais detalhes
const { ipcMain, dialog } = require("electron");

ipcMain.on("error",(event,message)=>{
    dialog.showMessageBox({
        type: 'error',//alert,error
        message: message
    });
});

ipcMain.on("warning",(event,message)=>{
    dialog.showMessageBox({
        type: 'warning',//alert,error
        message: message
    });
});

ipcMain.on("info",(event,message)=>{
    dialog.showMessageBox({
        type: 'info',//alert,error
        message: message
    });
});

ipcMain.on('log',(event,msg)=>{
    console.log(`message from backend:\r\n${msg}`);
});

exports.showError = function(window,msg) {
    window.webContents.send('backend-error',msg)
}

exports.showWarning = function(window,msg) {
    window.webContents.send('backend-warning',msg)
}

exports.showInfo = function(window,msg) {
    window.webContents.send('backend-info',msg)
}

exports.consoleLog = function(window,msg) {
    window.webContents.send('backend-log',msg)
}