// ---------- FIX PARA ELECTRON E ALERT
// Veja o arquivo msgbox.js para mais detalhes
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