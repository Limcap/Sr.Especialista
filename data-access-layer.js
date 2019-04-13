const fs = require('fs')
const sqlite3 = require('sqlite3').verbose();
const out = require('./out')


// ---------- States
let db
let perfilAtivo
let sysAtivo


// ---------- Getters and Setters
exports.getPerfilAtivo = function() {
	return perfilAtivo
}
exports.setPerfilAtivo = function(p) {
	perfilAtivo = p
}
exports.setSistemaAtivo = function(obj) {
	sysAtivo = obj
}
exports.getSistemaAtivo = function() {
	return sysAtivo
}


// ---------- Functions
/**
 * Abre conexão com banco
 * Side effect: state "db"
 */
exports.conectarDb = function() {
	db = new sqlite3.Database('./db.sqlite', (err) => {
		if (err) {
		  console.error(err.message);
		}
		console.log('Connected to the database.');
		console.log(db)
	});

	db.exec('PRAGMA foreign_keys = ON;', error => {
		if (error){
			 console.error("Pragma statement didn't work.")
		} else {
			 console.log("Foreign Key Enforcement is on.")
		}
	})
}


/**
 * Encerra conexão com banco
 * Side effect: state 'db'
 */
exports.desconectarDb = function() {
	db.close()
}


/**
 * Busca uma lista com todos os usuarios
 */
exports.getUsuarios = function(callback) {
	qry = "SELECT * FROM usuarios"
	db.all(qry, [], (err, rows) => {
		if (err) throw err
		rows.forEach((row) => console.log(row))
		callback(rows)
	})
}


/**
 * Busca todos os sistemas do usuário logado
 * Return: row do BD
 * Hidden input: state 'perfilAtivo'
 */
exports.getSistemas = function() {
	return new Promise((resolve, reject) => {
		qry = `SELECT * FROM sistemas WHERE usuario_fk = ?`
		db.all(qry, [perfilAtivo.id], (err, rows) => {
			if (err) throw err
			rows.forEach((row) => console.log(row))
			resolve(rows)
		})
	})
}


/**
 * Pede por um usuário, e se ele existir altera o estado
 * 	do DAL para logado
 * Return: obj tipo credencial (Promise)
 * Side Effect: variável perfilAtivo
 **/
exports.logar = function({login, senha}) {
	return new Promise((resolve, reject) => {
		this.coincidirCredencial({login, senha})
		.then((usuarioObj)=>{
			perfilAtivo = usuarioObj
			resolve(usuarioObj)
		})
	})
}


/**
 * Busca um usuário com as credenciais fornecidas
 * Return: obj tipo db-columns (Promise)
 **/
exports.coincidirCredencial = function({login, senha}) {
	return new Promise((resolve, reject) =>{
		let qry = login ?
			`SELECT id, nome FROM usuarios WHERE nome = '${login}' AND senha = '${senha}'`
			: 'SELECT id, nome FROM usuarios WHERE id = 1'
		db.get(qry, [], (err, row) => {
			if (err) throw err
			resolve(row)
		})
	})
}


getPerfilPublico = function(callback) {
	let qry = "SELECT id, nome FROM usuarios WHERE id = 1"
	db.get(qry, [], (err, row) => {
		callback(row)
	})
}


/**
 * Busca todos os registro de uma tabela selecionada do sistema ativo
 */
exports.fetchAll = function( tableName, where=null ) {
	return new Promise((resolve, reject) => {
		let qry
		switch( tableName ) {
			case 'respostas':
				qry = `SELECT respostas.* FROM respostas INNER JOIN perguntas ON respostas.pergunta_fk = perguntas.id WHERE perguntas.sistema_fk = ?`
				break;
			case 'conclusoes':
				qry = `SELECT conclusoes.* FROM conclusoes INNER JOIN objetivos ON conclusoes.objetivo_fk = objetivos.id WHERE objetivos.sistema_fk = ?`
				break;
			case '-condicoes':
				qry = 'SELECT condicoes.*, conclusoes.conclusao, objetivos.objetivo, perguntas.pergunta, respostas.resposta FROM ( condicoes LEFT JOIN conclusoes ON condicoes.conclusao_fk = conclusoes.id ) LEF JOIN objetivos ON conclusoes.objetivo_fk = objetivos.id WHERE objetivos.sistema_fk = ?'
				break;
			default:
				qry = `SELECT * FROM ${tableName} WHERE sistema_fk = ?`
		}
		qry += where ? ` AND ${where}` : ''
		console.log(qry)
		db.all(qry, [sysAtivo.id], (err, rows) => {
		if (err) throw (err)
		else resolve(rows)
		})
	})
}

exports.fetchRespostas = function( pergunta_fk ) {
	return new Promise(( resolve, reject) => {
		let qry = `SELECT respostas.* FROM respostas INNER JOIN perguntas ON respostas.pergunta_fk = perguntas.id WHERE sistema_fk = ? AND pergunta_fk = ?`
		db.all(qry, [sysAtivo.id], (err, rows) => {
			if( err ) reject(err)
			else resolve(rows)
		})
	})
}

/*
exports.oldsaveDataObj = function( table, dataObj ) {
	console.log(dataObj)
	if( !dataObj.id) {
		return new Promise((resolve, reject) => {
			let columns = Object.keys(dataObj).join(',')
			let values = Object.values(dataObj).join('","')
			
			let qry = `INSERT INTO ${table} (${columns}) VALUES ("${values}")`
			console.log(qry)
			db.run(qry, [], function(err, res) {
				if (err) reject (err)
				else {
					console.log("last id = " + this.lastID)
					db.get(`SELECT * FROM ${table} WHERE rowid = ${this.lastID}`, [], (err, row) => {
						console.log(row)
						if(err) reject(err)
						else resolve (row)
					})
				}
			})
		})
	}
	else {
		let pairs = Object.entries(dataObj)
		pairs = pairs.map(x => x[0]+'="'+x[1]+'"').join(',')
		let qry = `UPDATE ${table} SET ${pairs} WHERE ${pkColumn} = ${dataObj.id}`
	}
}
*/

/*
exports.saveDataObj_TEST = async function( dataObj, tableName, pkColumn ) {
	isInsert = dataObj.hasOwnProperty( pkColumn )
	let qry
	if( !isInsert ) {
		let columns = Object.keys( dataObj ).join( ',' )
		let values = Object.values( dataObj ).join( '","' )
		qry = `INSERT INTO ${tableName} (${columns}) VALUES ("${values}")`
	} else {
		let pairs = Object.entries( dataObj )
		pairs = pairs.filter(x => x[0] != pkColumn).map( x => x[0]+' = "'+x[1]+'"' ).join( ',' )
		let pkValue = dataObj[pkColumn]
		qry = `UPDATE ${tableName} SET ${pairs} WHERE ${pkColumn} = ${pkValue}`
	}
	out(qry)
	return { err:qry }
}
*/

exports.saveDataObj = async function( dataObj, tableName, pkColumn ) {
	isInsert = dataObj.hasOwnProperty( pkColumn )
	console.log('\n========== DAL SAVE DOB')
	console.log(`table: ${tableName}`)
	console.log({dataObj})
	let res
	if( isInsert ) {
		res = await updateDataObj( dataObj, tableName, pkColumn )
	} else {
		res = await insertDataObj( dataObj, tableName )
	}
	console.log({res})
/*
	res = isInsert ?
		await insertDataObj( dataObj, tableName ) :
		await updateDataObj( dataObj, tableName, pkColumn )
*/
	if( !res.err ) {
		res.DOB = await getDataObjByRowId( tableName, res.lastID )
	}
	return res
}

let getDataObjByRowId = function( tableName, rowid ) {
	return new Promise(( resolve, reject ) => {
		let qry = `SELECT * FROM ${tableName} WHERE rowid = ?`
		db.get( qry, [rowid], (err, row) => {
			if( err ) throw( err )
			else resolve( row )
		})
	})
}

let insertDataObj = function( dataObj, tableName ) {
	console.log('\n========== DAL INSERT DOB')
	return new Promise(( resolve, reject )=>{
		let columns = Object.keys( dataObj ).join( ',' )
		let values = Object.values( dataObj ).join( '","' )
		let qry = `INSERT INTO ${tableName} (${columns}) VALUES ("${values}")`
		db.run(qry, [], function( err ) {
			resolve( { err:err, lastID:this.lastID } )
		})
	})
}

let updateDataObj = function( dataObj, tableName, pkColumn ) {
	console.log('\n========== DAL UPDATE DOB')
	return new Promise(( resolve, reject ) => {
		let pkValue = dataObj[pkColumn]

		let pairs = Object.entries( dataObj )
		let columns = pairs.filter(p=>p[0]!=pkColumn).map(p=>`${p[0]} = ?`).join(', ')
		let values = pairs.filter(p=>p[0]!=pkColumn).map(p=>p[1])
		let qry = `UPDATE ${tableName} SET ${columns} WHERE ${pkColumn} = ${pkValue}`
		console.log({qry})
		db.run(qry, values, function( err ) {
			resolve( { err:err, lastID:pkValue } )
		})
		//let pairs = Object.entries( dataObj )
		//pairs = pairs.filter(x => x[0] != pkColumn).map( x => x[0]+' = "'+x[1]+'"' ).join( ',' )
		//let qry = `UPDATE ${tableName} SET ${pairs} WHERE ${pkColumn} = ${pkValue}`
		//db.run(qry, [], function( err ) {
		//	resolve( { err:err, lastID:pkValue } )
		//})
	})
}

exports.delDataObj = function( dataObj, tableName, pkColumn ) {
	console.log('\n========== DAL DELETE DOB')
	console.log(`table: ${tableName}`)
	console.log({dataObj})
	return new Promise(( resolve, reject ) => {
		let pkValue = dataObj[pkColumn]
		let qry = `DELETE FROM ${tableName} WHERE ${pkColumn} = ${pkValue}`
		db.run( qry, [], function( err ) {
			if( err ) throw err
			console.log(`deleted: ${this.changes}`)
			resolve( {err:err, deleted:this.changes} )
		})
	})
}