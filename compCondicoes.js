let condArr = []

let objetivoDOB
let conclusaoDOB
let respostaDOB
let perguntaDOB
let slcCondicao = document.getElementById('slcCondicao')
let inpResultado = document.getElementById('inpResultado')
let btSalvarCondicao = document.getElementById('btSalvarCondicao')

btSalvarCondicao.addEventListener('click',exports.adicionarCondicao)



exports.view = {
	slcBox: null,
	inpBox: null,
	btnSave: null,
	btnDel: null,
	btnUp: null,
	btnDown: null
}

exports.ctrl = {
	objetivos: null,
	conclusoes: null,
	perguntas: null,
	respostas: null
}

exports.data = []



exports.setView = function( slcBox, inpBox, btnSave, btnDel, btnUp, btnDown ) {
	this.view.slcBox = document.getElementById(slcBox)
	this.view.inpBox = document.getElementById(inpBox)
	this.view.btnSave = document.getElementById(btnSave)
	this.view.btnDel = document.getElementById(btnDel)
	this.view.btnUp = document.getElementById(btnUp)
	this.view.btnDown = document.getElementById(btnDown)
}



exports.setCtrl = function( ctrlObjetivos, ctrlConclusoes, ctrlPerguntas, ctrlRespostas ) {
	this.ctrl.objetivos = ctrlObjetivos
	this.ctrl.conclusoes = ctrlConclusoes
	this.ctrl.perguntas = ctrlPerguntas
	this.ctrl.respostas = ctrlRespostas
}



exports.inicializar = async function( self ) {
	await this.carregarDados()
	//this.render()
	this.configViewEvents()
	this.configConclusaoSelectEvent( self )
	return true
}



exports.carregarDados = async function() {
	let rawArr =  await dal.fetchAll('condicoes_unrolled')
	let tidyArr = []
	for( let i = 0; i < rawArr.length; i++ ) {
		let dob = rawArr[i]
		if( tidyArr[dob.grupo] === undefined ) {
			tidyArr[dob.grupo] = []
		}
		tidyArr[dob.grupo].push( dob )
		let opt = this.newOpt( dob.pergunta + ' = ' + dob.resposta )
		opt.dob = dob
		dob.opt = opt
	}
	console.log(tidyArr)
	this.data = tidyArr
}



exports.populateSlctBox = function() {
	for( let i = 0; i < this.data.length; i++ ) {
		grupoArr = this.data[i]
		for( let j = 0; j < grupoArr.length; j ++ ) {
			let DOB = grupoArr[j]
			this.view.slcBox.options.add( DOB.opt )
		}
		if( i + 1 < this.data.length ) {
			let ou = this.newOpt('OU')
			ou.style = 'font-weight: bold'
			this.view.slcBox.options.add( ou )
		}
	}
}



exports.newOpt = function( text ) {
	let newOpt = document.createElement('option')
	newOpt.text = text
	return newOpt
}



exports.configViewEvents = function() {
	this.attachEvent(this.view.btnSave,'click',this.adicionarCondicao)
	
}



exports.attachEvent = function (obj,type,handler) {
	obj.removeEventListener(type,handler)
	obj.addEventListener(type,handler)
	obj.controller = this
}



exports.configConclusaoSelectEvent = function( self ){
	this.ctrl.conclusoes.hooks.onSelect = () => self.render()
	//this.ctrl.conclusoes.hooks.onSelect = () => self.atualizarResultado()
}



exports.atualizarResultado = function( opt ) {
	objetivoDOB = this.ctrl.objetivos.getSelectedDob()
	conclusaoDOB = this.ctrl.conclusoes.getSelectedDob()
	respostaDOB = this.ctrl.respostas.getSelectedDob()
	perguntaDOB = this.ctrl.perguntas.getSelectedDob()	
	this.view.inpBox.value = objetivoDOB.objetivo + ' = ' + conclusaoDOB.conclusao
}



exports.adicionarCondicao = function() {
	objetivoDOB = ctrlObjetivos.getSelectedDob()
	conclusaoDOB = ctrlConclusoes.getSelectedDob()
	respostaDOB = ctrlRespostas.getSelectedDob()
	perguntaDOB = ctrlPerguntas.getSelectedDob()	

	let newOpt = document.createElement('option')
	newOpt.resposta_fk = respostaDOB.id
	newOpt.conclusao_fk = conclusaoDOB.id
	newOpt.text = perguntaDOB.pergunta + ' = ' + respostaDOB.resposta
	slcCondicao.options.add( newOpt )
}



exports.criarDOB = function() {
	objetivoDOB = this.ctrl.objetivos.getSelectedDob()
	conclusaoDOB = this.ctrl.conclusoes.getSelectedDob()
	respostaDOB = this.ctrl.respostas.getSelectedDob()
	perguntaDOB = this.ctrl.perguntas.getSelectedDob()

	let newDOB = {
		id: null,
		objetivo_fk: objetivoDOB.id,
		conclusao_fk: conclusaoDOB.id,
		pergunta_fk: perguntaDOB.id,
		resposta_fk: respostaDOB.id
	}
}



exports.render = function() {
	// Renderiza o texto do input (Objetivo = Conclusão)
	let objetivoDOB = this.ctrl.objetivos.getSelectedDob()
	let conclusaoDOB = this.ctrl.conclusoes.getSelectedDob()
	this.view.inpBox.value = objetivoDOB.objetivo + ' = ' + conclusaoDOB.conclusao
	
	let renderArray = this.criarRenderArray()
	let slcBox = this.view.slcBox
	slcBox.innerHTML = ''

	console.log(renderArray)
	for( let i = 0; i < renderArray.length; i++ ) {
		grupoArray = renderArray[i]
		for( let j = 0; j < grupoArray.length; j ++ ) {
			let condicaoDOB = grupoArray[j]
			slcBox.options.add( condicaoDOB.opt )
		}
		// insere OU
		if( i + 1 < renderArray.length ) {
			let ouOpt = this.newOpt('OU')
			ouOpt.style = 'font-weight: bold'
			slcBox.options.add( ouOpt )
		}
	}
}



exports.criarRenderArray = function() {
	let conclusaoID = this.ctrl.conclusoes.getSelectedDobId()
	let renderArray = []
	// itera por todas as condicoes, procurando as que são referentes
	// à conclusao selecionada, e as adiciona organizadamente por grupo
	// no renderArray
	for( let i = 0; i < this.data.length; i++ ) {
		grupoArr = this.data[i]
		for( let j = 0; j < grupoArr.length; j ++ ) {
			let condicaoDOB = grupoArr[j]
			//console.log(condicaoDOB.conclusao_fk +' = '+conclusaoID)
			if( condicaoDOB.conclusao_fk == conclusaoID ) {
				this.updateOptText( condicaoDOB )
				if( renderArray[condicaoDOB.grupo] === undefined ) {
					renderArray[condicaoDOB.grupo] = []
				}
				renderArray[condicaoDOB.grupo].push( condicaoDOB )
			}
		}
	}
	// remove arrays vazios
	for( let i = 0; i < renderArray.length; i++ ) {
		if( !renderArray[i] || renderArray[i].length == 0 )
			renderArray.splice(i,1)
	}
	return renderArray
}



exports.updateOptText = function( DOB ) {
	let cPerg = this.ctrl.perguntas.data.all
	let cResp = this.ctrl.respostas.data.all

	let pergunta = '' 
	let resposta = ''

	for( let i = 0; i < cPerg.length; i++ ) {
		if( cPerg[i].id == DOB.pergunta_fk ) {
			pergunta = cPerg[i].pergunta 
		}
	}
	for( let i = 0; i < cResp.length; i++ ) {
		if( cResp[i].id == DOB.resposta_fk ) {
			resposta = cResp[i].resposta 
		}
	}
	DOB.opt.text = pergunta + ' = ' + resposta
}
