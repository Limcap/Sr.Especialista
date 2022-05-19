const { app, BrowserWindow } = require('electron')
var dal = require('./data-access-layer')
var out = require('./out')
const msgbox = require("./msgbox-back.js")
//const { showError: sendErrorAlertToWindow } = require('./msgbox-back.js')


// ---------- INICIALIZAR JANELA
let winMain = null
let winAjuda = null


app.on('ready', ()=>{
	let w = new BrowserWindow({ width: 800, height: 800, title: "Sr. Especialista", webPreferences: {nodeIntegration: true,	contextIsolation: false, }})
	winMain = w
	w.loadFile('sysLogin.html')
	//w.webContents.openDevTools()
	w.webContents.on('did-finish-load', ()=>{
		console.log("Carregamento da janela finalizado")
		conectarDb()
	})
})


function abrirAjuda() {
	if( !winAjuda ) {
		winAjuda = new BrowserWindow({width: 800, height: 800, title: "Sr. Especialista - Sobre", webPreferences: {nodeIntegration: true,	contextIsolation: false, }})
		winAjuda.loadFile('sysAjuda.html')
		winAjuda.on('closed', () => {winAjuda = null})
		//winAjuda.setMenu(null)
	}
}


function conectarDb() {
	try {
		console.log("going to connect")
		dal.conectarDb()
	}
	catch(err){
		console.log(err)
		err = err.split("::");
		if(err[0]==1) msgbox.showWarning(winMain,err[1])
		else msgbox.showError(winMain,err[0])
		//winMain.webContents.send('error-back', err)
	}
}


// ---------- REINICIALIZAR DAO (Mais para desenvolvimento)
const ipc = require('electron').ipcMain
ipc.on('reload-dao',function(ev, arg) {
	let perfilAtivo = dal.getPerfilAtivo()
	let sysAtivo = dal.getSistemaAtivo()
	delete require.cache[require.resolve('./data-access-layer.js')];
	dal = require('./data-access-layer.js')
	conectarDb()
	dal.setPerfilAtivo(perfilAtivo)
	dal.setSistemaAtivo(sysAtivo)
})

ipc.on('abrir-ajuda', abrirAjuda)


/*
const fs = require('fs')
const sql = require('./sql.js');
var filebuffer = fs.readFileSync('db.sqlite')
// Load Database
var db = new sql.Database(filebuffer);
*/

// Execute some sql
//sqlstr = "CREATE TABLE hello (id int, word char);";
//sqlstr += "INSERT INTO hello VALUES (0, 'hello');"
//sqlstr += "INSERT INTO hello VALUES (1, 'world');"
//db.run(sqlstr); // Run the query without returning anything

//var res = db.exec("SELECT * FROM sistema");
/*
[
	{columns:['a','b'], values:[[0,'hello'],[1,'world']]}
]
*/

/*
// Prepare an sql statement
var qry = db.prepare("SELECT * FROM sistema");
qry.step()
let res = qry.getAsObject()
console.log(res);

db.close()
*/