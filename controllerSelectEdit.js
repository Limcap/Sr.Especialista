const out = require('electron').remote.require('./out')

let ControllerSelectEdit = function() {
	this.view = {
		selectBox: null,
		inputField: null,
		buttonSave: null,
		buttonDel: null
	}
	this.refs = {
		textColumn: null,
		pkColumn: null,
		fkColumn: null,
		fkValue: null,
		tableName: null
	}
	this.logic = {
		onSave: null,
		onDelete: null,
		onSelect: null,
	}
	this.hooks = {
		onSelect: null,
		onSave: null,
		onDelete: null
	}
	this.data = {
		all: null,
		current: null,
		fetch: null
	}
	this._child = null
}



ControllerSelectEdit.prototype.getSelectedDobId = function() {
	// retorna nulo se nao houver item selecionado ou se
	// o item não possuir um dob associado
	let sb = this.view.selectBox
	if( !sb || sb.selectedIndex == -1 ) return null
	let dob = sb.options.item( sb.selectedIndex ).dob
	return dob ? dob[this.refs.pkColumn] : null
}



ControllerSelectEdit.prototype.getSelectedDob = function() {
	let sb = this.view.selectBox
	if( !sb || sb.selectedIndex == -1 ) return null
	else return sb.options.item( sb.selectedIndex ).dob
}



ControllerSelectEdit.prototype.setView = function( selectBox, inputField, buttonSave, buttonDel ) {
	this.view.selectBox = document.getElementById( selectBox )
	this.view.inputField = document.getElementById( inputField )
	this.view.buttonSave = document.getElementById( buttonSave )
	this.view.buttonDel = document.getElementById( buttonDel )
}



ControllerSelectEdit.prototype.setRefs = function( textColumn, pkColumn, fkColumn, fkValue, tableName ) {
	this.refs.textColumn = textColumn
	this.refs.pkColumn = pkColumn
	this.refs.fkColumn = fkColumn
	this.refs.fkValue = fkValue
	this.refs.tableName = tableName
}



ControllerSelectEdit.prototype.updateChild = function( child ) {
	if( child ) this._child = child
	if( this._child instanceof controllerSelectEdit )
		this._child.setFkValue( this.getSelectedDobId() )
}



ControllerSelectEdit.prototype.setFkValue = function( fkValue ) {
	this.refs.fkValue = fkValue
	this.render()
}



ControllerSelectEdit.prototype.boot = async function() {
	// carregar os dados
	this.data.all = await this.data.fetch()
	console.log
	this._setupView()
	this.render()
}



ControllerSelectEdit.prototype.render = function() {
	let allData = this.data.all
	let txtCol = this.refs.textColumn
	let slcBox = this.view.selectBox
	let inpBox = this.view.inputField
	// esvazia os inputs
	inpBox.value = ''
	slcBox.innerHTML=''
	// se as views nao estiverem definidas, pare aqui
	if( !allData || !slcBox || !inpBox ) return false
	// filtrar os dados
	this.data.current = this.data.all.filter(
		item => item[this.refs.fkColumn] == this.refs.fkValue
	)
	// populate select 
	let curData = this.data.current
	for( let i = 0; i < curData.length; i++ ) {
		let text = txtCol ? curData[i][txtCol] : curData[i][0]
		let value = curData[i][this.refs.pkColumn]
		let option = this._newOption( text, value, curData[i] )
		slcBox.options.add( option )
	}
	// adiciona a opção '+' se a Foreing Key nao for null
	if( this.refs.fkValue != null ) this._insertEmptyOpt()
}



ControllerSelectEdit.prototype._setupView = function() {
	let th = this
	function onEvent(obj,type,handler) {
		obj.removeEventListener(type,handler)
		obj.addEventListener(type,handler)
		obj.controller = th
	}
	onEvent(this.view.selectBox,'change',this._changeOpt)
	onEvent(this.view.buttonSave,'click',this._clickBtSave)
	onEvent(this.view.buttonDel,'click',this._clickBtDel)
}



ControllerSelectEdit.prototype._newOption = function( text, value, dob ) {
	opt = document.createElement( "option" )
	opt.text = text
	opt.value = value
	opt.dob = dob
	return opt
}



ControllerSelectEdit.prototype._insertEmptyOpt = function( focus ) {
	if( focus === undefined ) focus = true
	let newOpt = this._newOption( "+", null, null )
	this.view.selectBox.options.add( newOpt )
	if( focus ) {
		//slcBox.selectedIndex = slcBox.length-1
		newOpt.selected = true
		this.view.inputField.value = ''
		//clickOpt( {target:newOpt} )
	}
}



ControllerSelectEdit.prototype._changeOpt = function( ev ) {
	let slcBox = ev.target
	let opt = slcBox.selectedOptions[0]
	let inpBox = slcBox.controller.view.inputField
	inpBox.value = opt.dob ? opt.text : ""
	if( !opt.dob ) inpBox.focus()
	//console.log( 'dob selected:\n' );console.log( opt.dob )
	ev.target.controller.updateChild()
	// executa custom function onSelect 
	let onSelect = ev.target.controller.logic.onSelect
	let hookOnSelect = ev.target.controller.hooks.onSelect
	if( typeof onSelect === 'function' ) onSelect( opt )
	if( typeof hookOnSelect === 'function' ) hookOnSelect( opt )
}



ControllerSelectEdit.prototype._clickBtSave = async function( ev ) {
	let ctrl = ev.target.controller
	let r = ctrl.refs
	let v = ctrl.view
	let l = ctrl.logic
	
	let selected = v.selectBox.options.item( v.selectBox.selectedIndex )
	// se nada estiver selecionado
	if( !selected ) {
		alert( 'Selecione um item primeiro' )
		return false
	}
	let newText = v.inputField.value.trim()
	let oldText = selected.text

	if( newText.length > 0 ) {		
		// modo 'insert' se a opção '+' estiver selecionada (ela não possui um dob associado)
		let isInsert = !selected.dob
		let dob = isInsert ? {} : selected.dob
		// adiciona informacao no dob
		dob[r.fkColumn] = r.fkValue
		dob[r.textColumn] = newText
		console.log(JSON.stringify(dob))
		if( typeof l.onSave === 'function') {
			// chama funcao de salvaento externa
			let res = await l.onSave( dob, r.pkColumn )
			if( res === false ) { // cancela a salvamento
				dob[r.textColumn] = oldText
			}
			else if( res.err ) { // erro no salvamento
				dob[r.textColumn] = oldText
				alert( "Ocorreu um erro ao tentar salvar o item" )
				throw res.err
			} else { // salvamento bem sucedido
				console.log( 'ControllerSelectEdit: data saved successfully' )
				selected.dob = res.dob
				selected.text = res.dob[r.textColumn]
				if( isInsert ) {
					ctrl._addDOB( selected.dob )
					if(ctrl._child) {
						ctrl._insertEmptyOpt( false )
						// atualiza a visualizacao do child
						ctrl.updateChild()
						// poe o cursor no input do child
						ctrl._child.view.inputField.focus()
					} else {
						ctrl._insertEmptyOpt()
						ctrl.view.inputField.focus()
					}
				}
			}
		} else { // não existe função de salvamento
			selected.dob = dob
			selected.text = dob[r.textColumn]
			if( isInsert ) ctrl._insertEmptyOpt()
		}
	}
}


ControllerSelectEdit.prototype._addDOB = function( dob ) {
	this.data.all.push( dob )
}



ControllerSelectEdit.prototype._clickBtDel = function( ev ) {
	let ctrl = ev.target.controller
	let slcBox = ctrl.view.selectBox
	let selected = slcBox.options.item( slcBox.selectedIndex )
	// if there's an item selected and if that item has an associated dob
	// (meaning it will not work when nothing or the 'new' option is selected)
	if( selected && selected.dob ) {
		ctrl._deleteByIndex( slcBox.selectedIndex )
	}
}



ControllerSelectEdit.prototype._deleteByIndex = function( slcIndex ) {
	let r = this.refs, v = this.view, d = this.data
	let dob = v.selectBox.selectedOptions[0].dob
	// chama a funcao de delete externa
	this._externalDelete( dob, r.pkColumn )
	// remove o item da view
	v.selectBox.remove( slcIndex )
	// remove o item do data array
	d.all = d.all.filter( item => item != dob )
	d.current = d.current.filter( item => item != dob )
	// seleciona o proximo item
	v.selectBox.selectedIndex = Math.min(slcIndex, d.current.length+1)
	// atualiza o child
	this._deleteChildDOBsWithFkValue( dob[r.pkColumn] )
}



ControllerSelectEdit.prototype._externalDelete = async function( dob, pkColumn ) {
	let l = this.logic
	if( typeof l.onDelete === "function" ) {
		let res = await l.onDelete( dob, pkColumn )
		if( res.err ) {
			alert( "Ocorreu um erro ao tentar deletar o item" )
			throw res.err
		}
		console.log( 'Itens excluídos: ' + res.deleted )
	}
}



ControllerSelectEdit.prototype._deleteChildDOBsWithFkValue = function( fkValue ) {
	if( this._child instanceof ControllerSelectEdit ) {
		let dAll = this._child.data.all
		let fkColumn = this._child.refs.fkColumn
		this._child.data.all = dAll.filter( item => item[fkColumn] != fkValue )
		this.updateChild()
	}
}



ControllerSelectEdit.prototype._deleteByFK = function( fkValue, newFKvalue ) {
	let fkColumn = this.refs.fkColumn
	if( fkValue ) {
		this.data.all = this.data.all.filter(
			item => item[fkColumn] != fkValue
		)
	}
	if (!newFKvalue ) {
		this.refs.fkValue = null
	}
	this.render()
}


module.exports = ControllerSelectEdit



/*
ControllerSelectEdit.prototype._clickBtDel_OLD =  async function( ev ) {
	let ctrl = ev.target.controller
	let r = ctrl.refs, v = ctrl.view, l = ctrl.logic, d = ctrl.data
	let selectedIndex = v.selectBox.selectedIndex
	let selected = v.selectBox.options.item( v.selectBox.selectedIndex )
	
	// if there's an item selected and if that item has an associated dob
	// (meaning it will not work when nothing or the 'new' option is selected)
	if( selected && selected.dob ) {
		if( typeof l.onDelete === "function" ) {
			let res = await l.onDelete( selected.dob, r.pkColumn )
			if( res.err ) {
				alert( "Ocorreu um erro ao tentar deletar item" )
				throw res.err
			}
			console.log( 'Itens excluídos: ' + res.deleted )
		}
		v.selectBox.remove( v.selectBox.selectedIndex )
		// remove o item do data array
		for( let i = 0; i < d.all.length; i++) {
			if ( d.current[i] && d.current[i] === selected.dob)
				d.current.splice(i, 1)
			if ( d.all[i] === selected.dob)
				d.all.splice(i, 1)
		}
		// seleciona o proximo item
		v.selectBox.selectedIndex = Math.min(selectedIndex, d.current.length+1)
		// atualiza o child
		ctrl._deleteChildDataWithFkValue( selected.dob[r.pkColumn] )
	}
}
*/