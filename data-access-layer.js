const fs = require('fs')
const sqlite3 = require('sqlite3').verbose();


// ---------- States
let db
let perfilAtivo
let sysAtivo


// ---------- Getters and Setters
exports.getPerfilAtivo = function() {
	return perfilAtivo
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
 * Busca todos os fatos do sistema ativo
 */
exports.fetchAllFatos = function() {
	return new Promise((resolve, reject) => {
		let qry = "SELECT * FROM fatos WHERE sistema_fk = ?"
		db.all(qry, [sysAtivo.id], (err, rows) => {
		if (err) reject(err)
		else resolve(rows)
		})
	})
}