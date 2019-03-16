import axios from 'axios'
import { getField, updateField } from 'vuex-map-fields'

const setState = prop => (state, value) => { state[prop] = value }
const usersUrl = `http://127.0.0.1:3210/internal/subscriber`
const apiInit = {crossDomain: true, headers: {'Content-type': 'application/json'}}
const msoPortalAuthPostConfig = {
  'clientID': 'https://coloradohealthcare.org/',
  'deviceID': '440c4aa0a4e595c4caa1e4294c6fdcc446444044441d44445fc4c4441cf44f1d',
  'vendor': 'Colorado healthcare',
  'dtype': 'Colorado Bot',
  'model': 'Colorado Bot',
  'serial': 'GG-555555',
  'macAddress': '03:30:93:39:03:3B'
}
const authTokenUri = `http://127.0.0.1:3210/portal/registration/token`

export const initialState = {
  users: [],
  toast: {
    show: false,
    value: ''
  },
  subscribers: []
}

export const getters = { getField }

export const mutations = {
  setUsers: setState('users'),
  setToast (state, {show, value}) {
    const formattedValue = value.charAt(0).toUpperCase() + value.slice(1)
    state.toast = {show, value: formattedValue}
  },
  updateField
}

export const actions = {
  fetchAuthToken ({commit, dispatch}) {
    return axios({
      ...apiInit,
      method: 'post',
      url: authTokenUri,
      data: msoPortalAuthPostConfig
    }).then(({data}) => {
      return dispatch('initializeMicronets', {token: data.accessToken}).then(() => {
      })
    })
  },

  fetchUsers ({state, commit, dispatch}, id) {
    console.log('\n Store fetchUsers called ')
    return axios({
      ...apiInit,
      method: 'post',
      url: authTokenUri,
      data: msoPortalAuthPostConfig
    }).then(({data}) => {
      console.log('\n Access Token : ' + JSON.stringify(data.accessToken))
      return axios({
        ...{
          crossDomain: true,
          headers: {
            'Content-type': 'application/json',
            Authorization: `Bearer ${data.accessToken}`
          }
        },
        method: 'get',
        url: usersUrl
      })
        .then(({data}) => {
          console.log('\n Users data : ' + JSON.stringify(data))
          commit('setUsers', data)
          return data
        })
    })
  }

}

export default {
  state: Object.assign({}, initialState),
  mutations,
  actions,
  getters
}
