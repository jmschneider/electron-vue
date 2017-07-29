import Vue from 'vue'
import Vuex from 'vuex'
import { ipcRenderer } from 'electron'

import modules from './modules'

Vue.use(Vuex)

let state = ipcRenderer.sendSync('vuex-connect')

Object.keys(modules).forEach(module => {
  modules[module].state = {
    ...modules[module].state,
    ...state[module]
  }
})

const store = new Vuex.Store({
  modules,
  strict: process.env.NODE_ENV !== 'production'
})

store._dispatch = store.dispatch

store.dispatch = function (type, ...payload) {
  if (typeof type === 'object' && type.type && arguments.length === 1) {
    payload = [type.payload]
    type = type.type
  }

  ipcRenderer.send('vuex-action', { type, payload })
}

ipcRenderer.on('vuex-apply-mutation', (event, mutation) => {
  store.commit(mutation)
})

export default store
