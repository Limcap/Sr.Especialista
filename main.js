const { app, BrowserWindow } = require('electron')
const dal = require("./data-access-layer.js")

// ---------- Inicialização
dal.conectarDb()

// ---------- Funções
function createWindow () {
  // Create the browser window.
  let win = new BrowserWindow({ width: 800, height: 600 })

  // and load the index.html of the app.
  win.loadFile('login.html')

  //win.webContents.openDevTools()
}


app.on('ready', createWindow)



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