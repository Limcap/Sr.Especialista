exports.formatToModel = function( rows=[[]], modelObj={}, modelFunctions={}, newObj={}, filters=[], maxDepth=10 ) {
/*
	if( maxDepth == 0 ) return
	let modelKeys = Object.keys( modelObj )

	for( modelKey of modelKeys ) {
		console.log('==================== MODELKEY: ' + modelKey)
		//console.log({modelObj})
		//console.log({newObj})
		let modelValue = modelObj[modelKey]
		let arr = modelKey.split('__')
		let prefix = arr.length > 1 ? arr[0] : ''
		let col = arr.length > 1 ? arr[1] : arr[0]
		console.log({prefix})
		console.log({filters})

		for( let i = 0; i <  rows.length; i++ ) {
			let row = rows[i]
			let newKey = null
			let ok = true
			
			for( let filter of filters ) {
				if( row[filter[0]] != row[filter[1]] ) {
					ok = false
					break
				}
			}
			
			if ( ok ) newKey = `${prefix}_${row[col]}`
			console.log({newKey})

			if( newKey && !newObj[newKey] ) {
				newObj[newKey] = null
	
				if( typeof modelValue == 'string' ) {
					let newValue = null
					let ok = true
					
					// for( filter of filters ) {
					// 	if( row[filter[0]] != row[filter[1]] ) {
					// 		ok = false 
					// 		break
					// 	}
					// }
					
					if( ok ) {
						newValue = row[modelValue]
					}

					newObj[newKey] = newValue
				}
				if( typeof modelValue == 'object' ){
					if( !newObj[newKey] ) newObj[newKey] = {}
					let newFilter = [col, row[col]]
					console.log({newFilter})
					let a = [ newFilter ]
					console.log({a})
					//filters = a
					console.log(`about to enter in key ${newKey} -- ${modelKey}`)
					console.log(`new filter: ${col} = ${row[col]}`)
					console.log({filters})
					console.log({newObj})
					nweObj = this.formatToModel( rows, modelObj[modelKey], modelFunctions, newObj[newKey], a, maxDepth-1 )
					filters.pop()
				}
			}
		}
	}
	return newObj
}
*/

	if( maxDepth == 0 ) return	
	let modelKeys = Object.keys( modelObj )
	for( let modelKey of modelKeys ) {
		//console.log('-- MODEL KEY: ' + modelKey )			
		let arr = modelKey.split('__')
		let prefix = arr.length > 1 ? arr[0] : ''
		let col = arr.length > 1 ? arr[1] : arr[0]
		//console.log('FILTERS: ' + JSON.stringify(filters) )
		//console.log(`NEWOBJ: ${JSON.stringify(newObj)}`)
		for( let [i, row] of rows.entries() ) {
			//console.log(`=== DEPTH: ${maxDepth}, MODEL-KEY:${modelKey}, ROW:${i}`)
			let newKey = null
			let ok = true
			for( let filter of filters ) {
				//console.log(`${filter[0]}: ${row[filter[0]]} = ${filter[1]}`)
				if( row[filter[0]] != filter[1] ) {
					ok = false
					break
				}	
			}	
			if ( ok ) {
				newKey = col.length > 0 ? `${prefix}_${row[col]}` : prefix
				if( !newObj[newKey] ) {
					newObj[newKey] = null
					//console.log(`    NEWKEY: ${newKey}`)
				
					let modelValue = modelObj[modelKey]
					//console.log(`    TYPEOF modelValue: ${typeof modelValue} (${modelValue})`)

					if( typeof modelValue == 'string' ) {
						newValue = row[modelValue]
						newObj[newKey] = newValue
						//console.log(`    NEWOBJ: ${JSON.stringify(newObj)}`)
						break
					}

					else if( typeof modelValue == 'object' ){
						if( !newObj[newKey] ) newObj[newKey] = {}
						let newFilter = [col, row[col]]
						filters.push( newFilter )
						//console.log(`    NEWOBJ: ${JSON.stringify(newObj)}`)
						newObj[newKey] = this.formatToModel( rows, modelObj[modelKey], modelFunctions, newObj[newKey], filters, maxDepth-1 )
						filters.pop()
					}
				}
			}
		}
	}
	return newObj
}
