import Vue from 'vue'
import Vuex from 'vuex'
import { BrowserWindow, ipcMain } from 'electron'

import modules from './modules'

Vue.use(Vuex)

const clients = []

const broadcastMutations = store => {
  store.subscribe((mutation, state) => {
    Object.keys(clients).forEach((id) => {
      clients[id].send('vuex-apply-mutation', mutation)
    })
  })
}

const store = new Vuex.Store({
  modules,
  plugins: [broadcastMutations],
  strict: process.env.NODE_ENV !== 'production'
})

ipcMain.on('vuex-connect', (event) => {
  let win = BrowserWindow.fromWebContents(event.sender)

  win.on('close', () => {
    delete clients[win.id]
  })

  clients[win.id] = event.sender
  event.returnValue = store.state
})

ipcMain.on('vuex-action', (event, action) => {
  store.dispatch(action)
})
