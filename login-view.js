//const BrowserWindow = require('electron').remote.BrowserWindow
const { remote } = require('electron')
const dal = remote.require('./data-access-layer.js')
const thisWin = remote.getCurrentWindow()


// ---------- Elementos da DOM
const inpLogin = document.getElementById('inpLogin')
const inpSenha = document.getElementById('inpSenha')
const btEntrar = document.getElementById('btEntrar')
const btNovoPerfil = document.getElementById('btNovoPerfil')
const divMensagem = document.getElementById('divMensagem')


// ---------- Eventos
btEntrar.addEventListener('click',tentarLogar)
btNovoPerfil.addEventListener('click',listarUsuarios)


// ---------- Funções
function listarUsuarios() {
	dal.getUsuarios((rows)=>{
		rows = JSON.stringify(rows)
		divMensagem.innerHTML = rows
	})
}


function isPerfilPublico() {
	if(inpLogin.value.trim() == "")
	return true
}


function tentarLogar() {
	credenciais = {
		login: inpLogin.value.trim(),
		senha: inpSenha.value.trim()
	}
	dal.logar(credenciais)
	.then(userObj =>{
		if(userObj) {
			divMensagem.innerHTML=`Perfil encontrado: ${userObj.nome}`
			thisWin.loadFile('./sysSelect.html')
		}
		else
			divMensagem.innerHTML="Credencial não existente"
	})
	/*
	dal.coincidirUsuario(credenciais, (retorno) => {
		if(!retorno) {
			divMensagem.innerHTML="Credencial não existente"
		}
		else {
			console.log(`user id = ${retorno.id} .`)
		}
	})
	*/
	//thisWin.loadFile('./selectSys.html')
}