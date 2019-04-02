const levels = ['SUCCESS','NOTIFY','WARNING','ERROR','CATASTROPHE']
module.exports = function( msg, level ) {
	level = level === undefined ? 1 : level
	console.log( levels[level] + ": " + msg )
}