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
		valueColumn: null,
		pkColumn: null
	}
	this.logic = {
		dataObjSaveFunc: null,
		dataObjdelFunc: null,
		dataObjFactory: null,
		dbTableName: null
	}
}

ControllerSelectEdit.prototype.render = function() {
	let dt = this.model.dataArray
	let tc = this.model.textColumn
	let vc = this.model.valueColumn
	let pk = this.model.pkColumn
	let sb = this.view.selectBox
	let ip = this.view.inputField
	let sf = this.logic.dataObjSaveFunc
	let df = this.logic.dataObjdelFunc
	let fc = this.logic.dataObjFactory
	let tb = this.logic.dbTableName

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
		let addOpt = newOption( "+", null, null, clickOpt )
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
		console.log(opt)
		console.log(opt.obj)
	}

	async function clickBtSave() {
		if( ip.value.trim().length > 0 ) {
			selected = sb.options.item( sb.selectedIndex )
			selected.text = ip.value
			let modeInsert = !selected.obj
			let obj = modeInsert ? fc() : selected.obj
			obj[tc] = ip.value
			if( typeof sf === "function" ) {
				obj = await sf( obj, tb, pk )
			}
			console.log(obj)
			selected.obj = obj
			if( modeInsert ) { 
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