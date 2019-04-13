const dal = require('electron').remote.require('./data-access-layer')
const compFaixaNumeros = require('./compFaixaNumeros')
/*
let objetivoDOB
let conclusaoDOB
let btSalvarCondicao = document.getElementById('btSalvarCondicao')

btSalvarCondicao.addEventListener('click',exports.adicionarCondicao)
*/

exports.view = {
	slcBox: null,
	inpBox: null,
	btnAdd: null,
	btnDel: null,
	btnUp: null,
	btnDown: null,
	btnEqual: null,
	btnDiff: null,
	btnSmaller: null,
	btnLarger: null,
	inpNumber: null,
	btnSaveNumber: null,
	grpRageControls: null
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

exports.persist = {
	save: null,
	delete: null
}

exports.setView = function( slcBox, inpBox, btnAdd, btnDel, btnUp, btnDown, btnEqual, btnDiff, grpRangeControls, btnSmaller, btnLarger, inpNumber, btnSaveNumber ) {
	this.view.slcBox = document.getElementById(slcBox)
	this.view.inpBox = document.getElementById(inpBox)
	this.view.btnAdd = document.getElementById(btnAdd)
	this.view.btnDel = document.getElementById(btnDel)
	this.view.btnUp = document.getElementById(btnUp)
	this.view.btnDown = document.getElementById(btnDown)
	this.view.btnEqual = document.getElementById(btnEqual)
	this.view.btnDiff = document.getElementById(btnDiff)
	this.view.grpRangeControls = document.getElementById(grpRangeControls)
	this.view.btnSmaller = document.getElementById(btnSmaller)
	this.view.btnLarger = document.getElementById(btnLarger)
	this.view.inpNumber = document.getElementById(inpNumber)
	this.view.btnSaveNumber = document.getElementById(btnSaveNumber)
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
	this.attachEvent( this.view.btnAdd,'click',this.btnAddClick )
	this.attachEvent( this.view.btnDel,'click',this.btnDelClick )
	this.attachEvent( this.view.btnUp,'click',this.btnUpClick )
	this.attachEvent( this.view.btnDown,'click',this.btnDownClick )
	this.attachEvent( this.view.slcBox,'change',this.slcBoxChange )
	this.attachEvent( this.view.btnEqual,'click',this.btnEqualClick )
	this.attachEvent( this.view.btnDiff,'click',this.btnDiffClick )
	this.attachEvent( this.view.btnSmaller,'click',this.btnSmallerClick )
	this.attachEvent( this.view.btnLarger,'click',this.btnLargerClick )
	this.attachEvent( this.view.inpNumber,'change',this.inpNumberChange )
	this.attachEvent( this.view.inpNumber,'blur',this.inpNumberBlur )

}



exports.attachEvent = function ( obj,type,handler ) {
	obj.removeEventListener( type,handler )
	obj.addEventListener( type,handler )
	obj.controller = this
}



exports.configConclusaoSelectEvent = function( self ){
	this.ctrl.objetivos.hooks.onSelect = ()=>self.render()
	this.ctrl.perguntas.hooks.onSelect = ()=>self.render()
	this.ctrl.respostas.hooks.onSelect = ()=>self.render()
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



exports.btnAddClick = function( ev ) {
	ev.target.controller.adicionarCondicao()
}



exports.adicionarCondicao = async function() {
	let objetivoDOB = this.ctrl.objetivos.getSelectedDob()
	let conclusaoDOB = this.ctrl.conclusoes.getSelectedDob()
	let respostaDOB = this.ctrl.respostas.getSelectedDob()
	let perguntaDOB = this.ctrl.perguntas.getSelectedDob()

	let condicaoOpt  = this.view.slcBox.selectedOptions[0]
	let grupo = condicaoOpt && condicaoOpt.DOB ? condicaoOpt.DOB.grupo : 0
	let valorPadraoDeFaixa = respostaDOB ? compFaixaNumeros.getMin( respostaDOB.resposta ) : null

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
			grupo: grupo,
			valorDeFaixa: valorPadraoDeFaixa
		}

		let DALDOB = this.formatDOBtoDAL( newDOB, 'insert' )
		let res = await this.persist.save( DALDOB,'condicoes','id' )

		newDOB.id = res.lastID
		console.log({lastID:res.lastID})
		console.log({newDOB})

		let newOpt = document.createElement('option')
		newDOB.opt = newOpt
		newOpt.DOB = newDOB
		this.data.all.push( newDOB )
		this.render()
	}
}



exports.formatDOBtoDAL = function( DOB={}, mode='update' ) {
	// É NECESSARIO SEMPRE REMOVER A REFERENCIA CICLICA ENTRE
	// DOBS E OPTS TANTO PARA GARBAGE COLLECTION COMO PARA NAO
	// OCORRER PROBLEMA AO ENVIAR PARA UMA FUNCAO DO DAL
	let DALDOB = {
		id: DOB.id,
		conclusao_fk: DOB.conclusao_fk || null,
		resposta_fk: DOB.resposta_fk || null,
		grupo: DOB.grupo || 0,
		valorDeFaixa: DOB.valorDeFaixa || null,
		comparativo: DOB.comparativo || '='
	}
	if( mode == 'insert'){
		console.log({mode})
		delete DALDOB.id
	}
	return DALDOB
}



exports.btnDelClick = function( ev ) {
	console.log('\nCLICKED DEL CONDICAO BUTTON')
	ev.target.controller.apagarCondicao()
}



exports.apagarCondicao = async function() {
	console.log('\nAPAGARCONDICAO FUNCTION')
	selectedOpt = this.view.slcBox.selectedOptions[0]
	console.log({selectedOpt})
	if( selectedOpt && selectedOpt.DOB ) {
		let DOB = selectedOpt.DOB
		let DALDOB = this.formatDOBtoDAL( DOB, 'delete' )
		let success = await this.apagarExterno( DALDOB )
		if( !success ) return
		// remover referências ciclicas para permitir 
		// garbage collection
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



exports.apagarExterno = function( DOB ) {
	return this.persist.delete( DOB,'condicoes','id' )
}



exports.render = function() {
	console.log('\n==== RENDER')
	// apaga a renderizacao anterior
	let slcBox = this.view.slcBox
	slcBox.innerHTML = ''
	this.view.inpBox.value = ''
	slcBox.selectedIndex = -1
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

	// Reseta o estado dos controles
	this.view.grpRangeControls.classList.add('disabledGroup')
	this.view.inpNumber.value = null
	// Ajusta o estado dos controles para a opcao selecionada
	if( this.view.slcBox.selectedIndex != -1 ) {
		this.editCondicao()
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



exports.updateOptText = function( condicaoDOB ) {
	let cPerg = this.ctrl.perguntas.data.all
	let cResp = this.ctrl.respostas.data.all

	let pergunta = '' 
	let resposta = ''
	let comparativo = '='

	for( let i = 0; i < cPerg.length; i++ ) {
		if( cPerg[i].id == condicaoDOB.pergunta_fk ) {
			pergunta = cPerg[i].pergunta 
		}
	}

	if( condicaoDOB.valorDeFaixa ) {
		resposta = condicaoDOB.valorDeFaixa
		comparativo = condicaoDOB.comparativo ? condicaoDOB.comparativo : '='
	} else {
		for( let i = 0; i < cResp.length; i++ ) {
			if( cResp[i].id == condicaoDOB.resposta_fk ) {
				resposta = cResp[i].resposta 
			}
		}
	}

	condicaoDOB.opt.text = `${pergunta}   ${comparativo}   ${resposta}`
}



exports.btnUpClick = function( ev ) {
	ev.target.controller.mudarDeGrupo(-1)
}



exports.btnDownClick = function( ev ) {
	ev.target.controller.mudarDeGrupo(1)
}



exports.mudarDeGrupo = async function( offset ) {
	let selectedOpt = this.view.slcBox.selectedOptions[0]
	if( selectedOpt && selectedOpt.DOB ) {
		let DOB = selectedOpt.DOB
		let grupo = DOB.grupo
		let rA = this.data.render
		let grupoReal
		for( let i = 0; i < rA.length; i++ ) {
			for( let j = 0; j < rA[i].length; j++ ) {
				if( rA[i][j] == DOB ) {
					grupoReal = i
					break
				}
			}
		}
		let existeGrupoAnterior = !!rA[grupoReal-1] && rA[grupoReal-1].length > 0
		let existeGrupoPosterior = !!rA[grupoReal+1] && rA[grupoReal+1].length > 0
		let estouSozinhoNoGrupo = rA[grupoReal].length == 1

		let DALDOB = this.formatDOBtoDAL( DOB,'update' )
		DALDOB.grupo += offset > 0 ? 1 : -1
		let res = await this.persist.save( DALDOB,'condicoes','id' )
		if( res.err ) throw res.err

		if( offset > 0 ){
			if( existeGrupoPosterior || !estouSozinhoNoGrupo )
				DOB.grupo += 1
		}
		else if( offset < 0 && grupo > 0 ) {
			DOB.grupo -=1
		}
		console.log(`Grupo atual: ${grupo}(${grupoReal}) - Novo grupo: ${DOB.grupo}`)
	}
	this.render()
}



exports.slcBoxChange = function( ev ) {
	ev.target.controller.editCondicao()
}



exports.editCondicao = function() {
	let v = this.view
	let condicaoDOB = v.slcBox.selectedOptions[0].DOB
	if( condicaoDOB != null && condicaoDOB.valorDeFaixa ) {
		v.grpRangeControls.classList.remove('disabledGroup')
		console.log({condicaoDOB})
		v.inpNumber.value = condicaoDOB.valorDeFaixa
		v.inpNumber.min = compFaixaNumeros.getMin( condicaoDOB.resposta )
		v.inpNumber.max = compFaixaNumeros.getMax( condicaoDOB.resposta )
	}
	else {
		v.grpRangeControls.classList.add('disabledGroup')
		v.inpNumber.value = null
	}
}



exports.btnEqualClick = function( ev ) {
	ev.target.controller.setComparator('=')
}

exports.btnDiffClick = function( ev ) {
	ev.target.controller.setComparator('!=')
}

exports.btnSmallerClick = function( ev ) {
	ev.target.controller.setComparator('<')
}

exports.btnLargerClick = function( ev ) {
	ev.target.controller.setComparator('>')
}

exports.inpNumberChange = function( ev ) {
	ev.target.controller.setRangeValue( ev.target.value )
}

exports.inpNumberBlur = function( ev ) {
	ev.target.controller.setRangeValue( ev.target.value )
}


exports.setComparator = function( c ) {
	alert( c )
}