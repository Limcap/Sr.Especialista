let data
let vwSelect
let vwInput
let btSave
let bttDel

let setData = function(d) {
	data = d
}

let setView = function(v) {
	view = v
}

function setup(d, vs, vi, bs, bd) {
	[data,	viewSelect, viewInput,	buttonSave, buttontDel] =
	[d,		vs,			vi,			bs,			bd]
}

function render() {
	for(let i = 0; i < data.length; i++) {
		let opt = newOption(row.fato, i, row, "clickOptFatos(this)")
		vwSelect.options.add(opt)
	}
	vwSelect.options.add( newEmptyOption() )
}

function newOption(text,value,obj,onclick) {
	opt = document.createElement("option")
	opt.text = text
	opt.value = value
	opt.obj = obj
	opt.setAttribute("onclick",onclick)
	return opt
}

function newEmptyOption() {
	let opt = newOption("+","-1",null,"clickOptFatos(this)")
	return opt
}

function clickOption(opt) {
	vwInput.value = opt.obj ? opt.text : ""
	vwInput.opt = opt
	vwInput.focus()
	
}

function clickBtSave() {
	if(vwInput.opt.obj) {
		vwInput.opt.text = vwInput.value
	} else {
		let opt = newOption(vwInput.value,"",{},"clickOptFatos(this)")
		vwSelect.options.add( opt )
		vwInput.opt = opt
	}
}