const electron = require('electron')
const { remote } = electron
const { Menu } = remote
const thisWin = remote.getCurrentWindow()
const ipc = electron.ipcRenderer

const template = [
	{
		label: 'Reload',
		click() {
			ipc.send('reload-dao')
			delete require.cache[require.resolve('./controllerSelectEdit.js')];
			setTimeout(()=>thisWin.reload(),1000)
		}
	},
	{
		label: 'DevTools',
		click() { thisWin.webContents.toggleDevTools() }
	}
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)