let ControllerSelectEdit = function() {
	this.view = {
		selectBox: null,
		inputField: null,
		buttonSave: null,
		buttonDel: null
	}
	this.model = {
		dataArray: null,
		textColumn: null,
		valueColumn: null
	}
	this.logic = {
		saveFunction: null,
		delFunction: null
	}
	/*
	this.dataArray = null
	this.selectBox = null
	this.inputField = null
	this.buttonSave = null
	this.buttonDel = null
	this.saveFunction = null
	this.delFunction = null
	this.textPropertyName = null
	this.valuePropertyName = null
	*/
}

ControllerSelectEdit.prototype.render = function() {
	let dt = this.model.dataArray
	let tc = this.model.textColumn
	let vc = this.model.valueColumn
	let sb = this.view.selectBox
	let ip = this.view.inputField

	if( !dt || !sb || !ip ) {
		return false
	}

	sb.innerHTML=""
	for( let i = 0; i < dt.length; i++ ) {
		let text = tc ? dt[i][tc] : d[i][0]
		let value = vc ? dt[i][vc] : null
		let option = newOption( text, value, dt[i], clickOpt )
		sb.options.add( option )
	}
	insertAddOpt()

	this.view.buttonSave.addEventListener('click',clickBtSave)
	this.view.buttonDel.addEventListener('click',clickBtDel)

	function newOption( text,value,obj,onclick ) {
		opt = document.createElement( "option" )
		opt.text = text
		opt.value = value
		opt.obj = obj
		opt.addEventListener( 'click',onclick )
		return opt
	}

	function insertAddOpt(focus) {
		let addOpt = newOption( "+", "-1", null, clickOpt )
		sb.options.add( addOpt )
		if( focus ) {
			sb.selectedIndex = sb.length-1
			clickOpt( {target:addOpt} )
		}
	}

	function clickOpt( ev ) {
		let opt = ev.target
		ip.value = opt.obj ? opt.text : ""
		ip.selectedOpt = opt
		ip.focus()
	}

	function clickBtSave() {
		if( ip.value.trim().length > 0 ) {
			selected = sb.options.item( sb.selectedIndex )
			selected.text = ip.value
			if( !selected.obj ) {
				selected.obj = {fato:ip.value, sistema_fk:1}
				insertAddOpt( true )
			}
		}
	}

	function clickBtDel() {
		selected = sb.options.item( sb.selectedIndex )
		if( selected.obj )
			sb.remove( sb.selectedIndex )
	}

	return true
}

module.exports = ControllerSelectEdit