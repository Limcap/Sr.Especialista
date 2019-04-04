/*
let objetivoDOB
let conclusaoDOB
let btSalvarCondicao = document.getElementById('btSalvarCondicao')

btSalvarCondicao.addEventListener('click',exports.adicionarCondicao)
*/


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

exports.data = {
	all: [],
	render: []
}



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
	this.configViewEvents()
	this.configConclusaoSelectEvent( self )
	return true
}



// Carrega os dados e associa um <option> a cada DOB
exports.carregarDados = async function() {
	this.data.all = await dal.fetchAll('condicoes_unrolled')
	for( let i = 0; i < this.data.all.length; i++ ) {
		let opt = this.newOpt('')
		opt.DOB = this.data.all[i]
		this.data.all[i].opt = opt	
	}
}


/*
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
*/


exports.newOpt = function( text ) {
	let newOpt = document.createElement('option')
	newOpt.text = text
	return newOpt
}



exports.configViewEvents = function() {
	this.attachEvent( this.view.btnSave,'click',this.btnSaveClick )
	this.attachEvent( this.view.btnDel,'click',this.btnDelClick )
	this.attachEvent( this.view.btnUp,'click',this.btnUpClick )
	this.attachEvent( this.view.btnDown,'click',this.btnDownClick )
}



exports.attachEvent = function ( obj,type,handler ) {
	obj.removeEventListener( type,handler )
	obj.addEventListener( type,handler )
	obj.controller = this
}



exports.configConclusaoSelectEvent = function( self ){
	this.ctrl.conclusoes.hooks.onSelect = ()=>self.render()
	//this.ctrl.conclusoes.hooks.onSelect = () => self.atualizarResultado()
}



exports.atualizarResultado = function() {
	objetivoDOB = this.ctrl.objetivos.getSelectedDob()
	conclusaoDOB = this.ctrl.conclusoes.getSelectedDob()
	respostaDOB = this.ctrl.respostas.getSelectedDob()
	perguntaDOB = this.ctrl.perguntas.getSelectedDob()	
	this.view.inpBox.value = objetivoDOB.objetivo + ' = ' + conclusaoDOB.conclusao
}



exports.btnSaveClick = function( ev ) {
	ev.target.controller.adicionarCondicao()
}



exports.adicionarCondicao = function() {
	let objetivoDOB = this.ctrl.objetivos.getSelectedDob()
	let conclusaoDOB = this.ctrl.conclusoes.getSelectedDob()
	let respostaDOB = this.ctrl.respostas.getSelectedDob()
	let perguntaDOB = this.ctrl.perguntas.getSelectedDob()

	let grupo = 0
	let condicaoOpt  = this.view.slcBox.selectedOptions[0]
	grupo = condicaoOpt && condicaoOpt.DOB ? condicaoOpt.DOB.grupo : 0

	if( !objetivoDOB ) alert('Selecione um objetivo')
	else if( !conclusaoDOB ) alert('Selecione uma conclusão')
	else if( !perguntaDOB ) alert('Selecione uma pergunta')
	else if( !respostaDOB ) alert('Selecione uma resposta')
	else {
		let newDOB = {
			id: null,
			objetivo_fk: objetivoDOB.id,
			conclusao_fk: conclusaoDOB.id,
			pergunta_fk: perguntaDOB.id,
			resposta_fk: respostaDOB.id,
			grupo: grupo
		}
		let newOpt = document.createElement('option')
		newDOB.opt = newOpt
		newOpt.DOB = newDOB
		this.data.all.push( newDOB )
		this.render()
	}
}



exports.btnDelClick = function( ev ) {
	ev.target.controller.apagarCondicao()
}



exports.apagarCondicao = function() {
	selectedOpt = this.view.slcBox.selectedOptions[0]
	if( selectedOpt && selectedOpt.DOB ) {
		// remover referências ciclicas para permitir 
		// garbage collection
		let DOB = selectedOpt.DOB
		selectedOpt.DOB = null
		DOB.opt = null
		for( let i = 0; i < this.data.all.length; i++ ) {
			if( this.data.all[i] == DOB ) {
				this.data.all.splice( i, 1 )
			}
		}
	}
	this.render()
}



exports.render = function() {
	// apaga a renderizacao anterior
	let slcBox = this.view.slcBox
	slcBox.innerHTML = ''
	this.view.inpBox.value = ''
	// verifica se existe uma conclusao selecionada
	let conclusaoDOB = this.ctrl.conclusoes.getSelectedDob()
	if( !conclusaoDOB ) return
	// Renderiza o texto do input (Objetivo = Conclusão)
	let objetivoDOB = this.ctrl.objetivos.getSelectedDob()
	this.view.inpBox.value = objetivoDOB.objetivo + ' = ' + conclusaoDOB.conclusao
	
	this.criarRenderArray( conclusaoDOB.id )
	let renderArray = this.data.render

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



exports.criarRenderArray = function( conclusaoID ) {
	//let conclusaoID = this.ctrl.conclusoes.getSelectedDobId()
	let renderArray = []
	// itera por todas as condicoes, procurando as que são referentes
	// à conclusao selecionada, e as adiciona organizadamente por grupo
	// no renderArray
	for( let i = 0; i < this.data.all.length; i++ ) {
		let condicaoDOB = this.data.all[i]
		//console.log(condicaoDOB.conclusao_fk +' = '+conclusaoID)
		if( condicaoDOB.conclusao_fk == conclusaoID ) {
			this.updateOptText( condicaoDOB )
			if( renderArray[condicaoDOB.grupo] === undefined ) {
				renderArray[condicaoDOB.grupo] = []
			}
			renderArray[condicaoDOB.grupo].push( condicaoDOB )
		}
	}
	// remove arrays vazios
	renderArray = renderArray.filter( arr => !!arr && arr.length > 0 )
	//for( let i = 0; i < renderArray.length; i++ ) {
	//	if( !renderArray[i] || renderArray[i].length == 0 )
	//		renderArray.splice(i,1)
	//}
	this.data.render = renderArray
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



exports.btnUpClick = function( ev ) {
	ev.target.controller.mudarDeGrupo(-1)
}



exports.btnDownClick = function( ev ) {
	ev.target.controller.mudarDeGrupo(1)
}



exports.mudarDeGrupo = function( offset ) {
	let selectedOpt = this.view.slcBox.selectedOptions[0]
	if( selectedOpt && selectedOpt.DOB ) {
		let DOB = selectedOpt.DOB
		let grupo = DOB.grupo
		let rA = this.data.render
		let existeGrupoAnterior = !!rA[grupo-1] && rA[grupo-1].length > 0
		if( offset > 0 && ( grupo == 0 || existeGrupoAnterior ) )
			DOB.grupo += 1
		if( offset < 0 && grupo > 0 )
			DOB.grupo -= 1
		console.log('grupo: ' + grupo + ' - novo grupo: ' + DOB.grupo)
	}
	this.render()
}