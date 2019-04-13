exports.rule = {
	full: /^[fF]aixa(\s)*::(\s)*(\d)+(\s)*a(\s)*(\d)+(\s)*$/,
	cmd: /^(\s)*[Ff]aixa(\s)*::(\s)*/,
	param: /(\s)*(\d)+(\s)*a(\s)*(\d)+(\s)*$/,
	splitter: /a/
}



/**
 * Verifica se o parametro passdo é uma faixa de números
 */
exports.isFaixaDeNumero = function( text ) {
	return this.rule.full.test( text )
	let arr = this.getRange( text )
	if( arr ) {
		return arr.length == 2 && parseInt( arr[0] ) != NaN && parseInt( arr[1] ) != NaN
	}
	else return false
}



exports.formatFaixaDeNumeros = function( text ) {
	let arr = this.getRange( text )
	if( arr ) {
		return `Faixa :: ${arr[0].trim()} a ${arr[1].trim()}`
	}
}



exports.getRange = function( text ) {
	if( this.isFaixaDeNumero( text ) ) {
		return text.replace(this.rule.cmd,'').split(this.rule.splitter)
	}
	else return []
}



exports.getMin = function( text ) {
	let arr = this.getRange( text )
	console.log(arr)
	if( arr.length == 0 ) return null
	let a = parseInt( arr[0] )
	let b = parseInt( arr[1] )
	return a > b ? b : a
}



exports.getMax = function( text ) {
	let arr = this.getRange( text )
	console.log({arr})
	if( arr.length == 0 ) return null
	let a = parseInt( arr[0] )
	let b = parseInt( arr[1] )
	return a > b ? a : b
}