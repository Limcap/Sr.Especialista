// ---------- FIX PARA ELECTRON E ALERT
// No electron, após exibir uma janela de alert, os campos de input ficam indisponivels, não da pra digitar.
// Para contonrnar isso usamos o codigo abaixo:

// Primeiro inserimos o codigo abaixo no main.js pois deve ser colocado no backend
/*
const { ipcMain, dialog } = require("electron");
ipcMain.on("alert",(event,message)=>{
    dialog.showMessageBox({
        type: 'warning',//alert,error
        message: message
    });
});
*/


// depois fazemos o require deste arquivo nos scripts de frontend que desejarmos:
// const msgbox = require('./msgbox.js')
// daí é só chamar a funcao usando msgbox.showMsg("mensagem")
//depois, em todo lugar que fosse chamar um alert, ao inves disso chamamos:
const { ipcRenderer } = require("electron");
exports.showInfo = function(msg) {
    ipcRenderer.send("info",msg)
}
exports.showWarning = function(msg) {
    ipcRenderer.send("warning",msg)
}
exports.showError = function(msg) {
    ipcRenderer.send("error",msg)
}