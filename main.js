const { app, BrowserWindow } = require('electron')
var dal = require('./data-access-layer')
var out = require('./out')


// ---------- CONECTAR BANCO DE DADOS
dal.conectarDb()


// ---------- INICIALIZAR JANELA
let winMain
function createWindow () {
  winMain = new BrowserWindow({ width: 800, height: 800 })
  winMain.loadFile('sysLogin.html')
  //win.webContents.openDevTools()
}
app.on('ready', createWindow)

let winAjuda = null
function abrirAjuda() {
	if( !winAjuda )
		winAjuda = new BrowserWindow({width: 800, height: 800})
	winAjuda.loadFile('sysAjuda.html')
	winAjuda.on('closed', () => {winAjuda = null})
	//winAjuda.setMenu(null)
}


// ---------- REINICIALIZAR DAO (Mais para desenvolvimento)
const ipc = require('electron').ipcMain
ipc.on('reload-dao',function(ev, arg) {
	let perfilAtivo = dal.getPerfilAtivo()
	let sysAtivo = dal.getSistemaAtivo()
	delete require.cache[require.resolve('./data-access-layer.js')];
	dal = require('./data-access-layer.js')
	dal.conectarDb()
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