const API_PREFIX = 'portal/v1'
const CSRT_PATH = `${API_PREFIX}/csrt`
const CERTIFICATES_PATH = `${API_PREFIX}/certificates`
const USERS_PATH = `${API_PREFIX}/users`
const SUBSCRIBER_PATH = `${API_PREFIX}/subscriber`
const REGISTER_PATH = `${API_PREFIX}/register`
const SOCKET_PATH = `${API_PREFIX}/socket`

const paths = () => {
  return {
    API_PREFIX ,
    REGISTER_PATH ,
    CSRT_PATH ,
    CERTIFICATES_PATH ,
    SUBSCRIBER_PATH,
    USERS_PATH ,
    SOCKET_PATH
  }
}

module.exports = paths()