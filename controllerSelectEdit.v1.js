const out = require('electron').remote.require('./out')

let ControllerSelectEdit = function() {
	this.view = {
		selectBox: null,
		inputField: null,
		buttonSave: null,
		buttonDel: null
	}
	this.model = {
		dataArray: null,
		tableName: null,
		textColumn: null,
		valueColumn: null,
		pkColumn: null
	}
	this.logic = {
		dataObjSaveFunc: null,
		dataObjDelFunc: null,
		onSelect: null
	}
	this.child = {
		selectBox: null,
		FKcolumn: null,
		FKvalue: null
	}
}

ControllerSelectEdit.prototype.setChild = function( selectBox, FKcolumn, FKvalue ) {
	this.child.selectBox = selectBox
	this.child.FKcolumn = FKcolumn
	this.child.FKvalue = FKvalue
}

ControllerSelectEdit.prototype.setView = function( selectBox, inputField, buttonSave, buttonDel ) {
	this.view.selectBox = document.getElementById( selectBox )
	this.view.inputField = document.getElementById( inputField )
	this.view.buttonSave = document.getElementById( buttonSave )
	this.view.buttonDel = document.getElementById( buttonDel )
}

ControllerSelectEdit.prototype.setRefs = function( tableName, pkColumn, textColumn, valueColumn ) {
	this.model.tableName = tableName
	this.model.pkColumn = pkColumn
	this.model.textColumn = textColumn
	this.model.valueColumn = valueColumn
}

ControllerSelectEdit.prototype.getSelectedDob = function() {
	let sb = this.view.selectBox
	if( !sb || sb.selectedIndex == -1 ) return null
	else return sb.options.item( sb.selectedIndex ).dob
}

ControllerSelectEdit.prototype.render = function() {
	let dt = this.model.dataArray
	let tb = this.model.tableName
	let tc = this.model.textColumn
	let vc = this.model.valueColumn
	let pk = this.model.pkColumn
	let sb = this.view.selectBox
	let ip = this.view.inputField
	let sf = this.logic.dataObjSaveFunc
	let df = this.logic.dataObjDelFunc
	let os = this.logic.onSelect

	ip.value = ''
	sb.innerHTML=''

	// se as views nao estiverem definidas, pare aqui
	if( !dt || !sb || !ip ) return false

	// populate select box
	for( let i = 0; i < dt.length; i++ ) {
		let text = tc ? dt[i][tc] : d[i][0]
		let value = vc ? dt[i][vc] : null
		let option = newOption( text, value, dt[i], clickOpt )
		sb.options.add( option )
	}
	insertEmptyOpt()
	

	// Remove the click event from the view buttons
	this.view.selectBox.removeEventListener('change',this.view.selectBox.customChangeFunction)
	this.view.selectBox.removeEventListener('change',this.view.selectBox.changeFunction)
	this.view.buttonSave.removeEventListener('click',this.view.buttonSave.clickFunction)
	this.view.buttonDel.removeEventListener('click',this.view.buttonDel.clickFunction)
	
	// Save a reference of the functions in the button for removal on a later call to render()
	this.view.selectBox.customChangeFunction = customChangeOpt
	this.view.selectBox.changeFunction = changeOpt
	this.view.buttonSave.clickFunction = clickBtSave
	this.view.buttonDel.clickFunction = clickBtDel

	// Add event listeners
	this.view.selectBox.addEventListener('change',customChangeOpt)
	this.view.selectBox.addEventListener('change',changeOpt)
	this.view.buttonSave.addEventListener('click',clickBtSave)
	this.view.buttonDel.addEventListener('click',clickBtDel)
	// The above is needed because each time the method 'render' is called, the function attached
	// to the click event is different, because it is inside a different execution of the 'render'
	// function, so the context is different and calling removeEventListener(clickBtSave) will not
	// do anything because clickBtSave will be referencing the new context and not the context of the
	// previous execution of 'render'. Therefore it is necessary to save a reference to the function
	// attached, so it can be accessed at a later time.

	function newOption( text,value,dob ) {
		opt = document.createElement( "option" )
		opt.text = text
		opt.value = value
		opt.dob = dob
		return opt
	}

	function insertEmptyOpt(focus) {
		if(!focus) focus = true
		let addOpt = newOption( "+", null, null, clickOpt )
		sb.options.add( addOpt )
		if( focus ) {
			sb.selectedIndex = sb.length-1
			addOpt.selected = true
			//clickOpt( {target:addOpt} )
		}
	}

	function clickOpt( ev ) {
		let opt = ev.target
		ip.value = opt.dob ? opt.text : ""
		//ip.selectedOpt = opt
		//ip.focus()
	}

	function changeOpt( ev ) {
		let opt = ev.target.selectedOptions[0]
		console.log( opt.dob )
		ip.value = opt.dob ? opt.text : ""
	}

	function customChangeOpt( ev ) {
		let sb = ev.target
		let opt = sb.selectedOptions[0]
		if( typeof os === 'function' ) os( opt )
	}

	async function clickBtSave() {
		out("Controller.clickBtSave")
		if( ip.value.trim().length > 0 ) {
			let selected = sb.options.item( sb.selectedIndex )
			// se nada estiver selecionado
			if( !selected ) alert( 'Selecione um item primeiro' )
			// modo 'insert' se a opção '+' estiver selecionada (ela não possui um dob associado)
			let isInsert = !selected.dob
			let dob = isInsert ? {} : selected.dob
			dob[tc] = ip.value.trim()
			if( typeof sf === 'function') {
				let res = await sf( dob, tb, pk )
				if( res === false ) { // cancela a salvamento
					dob[tc] = selected.text
				}
				else if( res.err ) { // erro no salvamento
					dob[tc] = selected.text
					alert( "Ocorreu um erro ao tentar salvar o item" )
					throw res.err
				} else { // salvamento bem sucedido
					console.log( 'ControllerSelectEdit: data saved successfully' )
					selected.dob = res.dob
					selected.text = res.dob[tc]
					if( isInsert ) insertEmptyOpt()
				}
			} else { // não existe função de salvamento
				selected.dob = dob
				selected.text = dob[tc]
				if( isInsert ) insertEmptyOpt()
			}
		}
	}

	/*
	if( ip.value.trim().length > 0 ) {
		selected = sb.options.item( sb.selectedIndex )
		selected.text = ip.value
		let modeInsert = !selected.obj
		out(modeInsert ? "SQL: INSERT" : "SQL: UPDATE")
		let dob = modeInsert ? fc() : selected.dob
		dob[tc] = ip.value
		sf( dob, tb, pk )
	}
	*/

	/*
	async function clickBtSave_Old2() {
		if( ip.value.trim().length > 0 ) {
			selected = sb.options.item( sb.selectedIndex )
			selected.text = ip.value
			let modeInsert = !selected.dob
			out(modeInsert ? "SQL: INSERT" : "SQL: UPDATE")
			let dob = modeInsert ? fc() : selected.dob
			dob[tc] = ip.value
			if( typeof sf === "function" ) {
				dob = await sf( dob, tb, pk )
			}
			console.log(dob)
			selected.dob = dob
			if( modeInsert ) { 
				insertEmptyOpt( true )
			}
		}``
	}
	*/

	async function clickBtDel() {
		selected = sb.options.item( sb.selectedIndex )
		// if there's an item selected and if that item has an associated dob
		// (meaning it will not work when nothing or the 'new' option is selected)
		if( selected && selected.dob ) {
			if( typeof df === "function" ) {
				let res = await df( selected.dob, tb, pk )
				if( res.err ) {
					alert( "Ocorreu um erro ao tentar deletar item" )
					throw res.err
				}
				console.log( 'Itens excluídos: ' + res.deleted )
			}
			sb.remove( sb.selectedIndex )
			for( let i = 0; i < dt.length; i++){ 
				if ( dt[i] === selected.dob) {
				  dt.splice(i, 1); 
				}
			}
		}
	}

	return true
}

function replaceInstance( old_element ) {
	var new_element = old_element.cloneNode(true);
	old_element.parentNode.replaceChild(new_element, old_element);
}

module.exports = ControllerSelectEdit