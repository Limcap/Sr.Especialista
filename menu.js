const electron = require('electron')
const { remote } = electron
const { Menu } = remote
const thisWin = remote.getCurrentWindow()
const ipc = electron.ipcRenderer

const template = [
	{
		label: 'Develpment',
		submenu: [
			{
				label: 'Toggle DevTools',
				click() { thisWin.webContents.toggleDevTools() }
			},
			{
				label: 'Hard Reload',
				click() {
					ipc.send('reload-dao')
					delete require.cache[require.resolve('./controllerSelectEdit.js')];
					setTimeout(()=>thisWin.reload(),1000)
				},
				accelerator: 'CmdOrCtrl+Shift+r'
			},
			{
				label: 'Soft Reload',
				click() { remote.getCurrentWindow().reload() },
				accelerator: 'CmdOrCtrl+r'
			}
		]
		
	},
	{
		label: 'Zoom',
		submenu: [
			{ label: 'Aumentar', role: 'zoomin', accelerator: 'CmdOrCtrl+]', },
			{ label: 'Reduzir', role:'zoomout', accelerator: 'CmdOrCtrl+[', },
			{ role: 'resetzoom' }
		]
	},
	{
		label: 'Ajuda',
		submenu: [
			{
				label: 'Como usar',
				click(){ipc.send('abrir-ajuda')}
			}
		]
	}
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)


exports.strings = {
	titulo: 'Sr. Especialista'
}