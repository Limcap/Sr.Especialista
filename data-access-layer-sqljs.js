const fs = require('fs')
const sql = require('./sql.js');

let filebuffer = fs.readFileSync('db.sqlite')
let db = new sql.Database(filebuffer);

exports.getUsuarios = function() {
	let qry = db.prepare("SELECT * FROM usuario");
	qry.step()
	let res = qry.getAsObject()
	return res
}

exports.closedb = function() {
	db.close()
}