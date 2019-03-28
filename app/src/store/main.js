import axios from 'axios'
import { getField, updateField } from 'vuex-map-fields'

const setState = prop => (state, value) => { state[prop] = value }
const usersUrl = `http://127.0.0.1:3210/portal/v1/subscriber`
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
const authTokenUri = `http://127.0.0.1:3210/portal/v1/registration/token`

export const initialState = {
  updatedUser: [],
  users: [],
  toast: {
    show: false,
    value: ''
  },
  subscribers: []
}

export const getters = { getField }

export const mutations = {
  setUpdatedUser: setState('updatedUser'),
  setUsers: setState('users'),
  setToast (state, {show, value}) {
    const formattedValue = value.charAt(0).toUpperCase() + value.slice(1)
    state.toast = {show, value: formattedValue}
  },
  updateField
}

export const actions = {
  fetchUsers ({state, commit, dispatch}, id) {
    return axios({
      ...apiInit,
      method: 'post',
      url: authTokenUri,
      data: msoPortalAuthPostConfig
    }).then(({data}) => {
      return axios({
        ...{
          crossDomain: true,
          headers: {
            'Content-type': 'application/json',
            Authorization: `Bearer ${data.accessToken}`
          }
        },
        method: 'get',
        url: id ? `${usersUrl}/${id}` : usersUrl
      })
        .then(({data}) => {
          console.log('\n Users data : ' + JSON.stringify(data))
          id ? commit('setUpdatedUser', data) : commit('setUsers', data)
          return data
        })
    })
  },

  upsertUsers ({state, commit, dispatch}, {method, upsertData}) {
    console.log('\n upsertUsers called with data ' + JSON.stringify(upsertData) + 'for method : ' + JSON.stringify(method))
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
        method: method === 'PATCH' ? 'PATCH' : 'POST',
        url: upsertData && upsertData.hasOwnProperty('id') && method !== 'POST' ? `${usersUrl}/${upsertData.id}` : usersUrl,
        data: { ...upsertData }
      })
        .then(({data}) => {
          console.log('\n' + JSON.stringify(method) + ' User response : ' + JSON.stringify(data))
          return dispatch('fetchUsers')
        })
    })
  },

  deleteUsers ({state, commit, dispatch}, id) {
    console.log('\n deleteUsers called with ID ' + JSON.stringify(id))
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
        method: 'DELETE',
        url: id ? `${usersUrl}/${id}` : usersUrl
      })
        .then(({data}) => {
          console.log('\n Delete users response : ' + JSON.stringify(data))
          return dispatch('fetchUsers')
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
