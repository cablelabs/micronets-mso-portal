const API_VERSION = 'v1'
const MSO_API_PREFIX = `portal/${API_VERSION}`
const MM_API_PREFIX = `mm/${API_VERSION}`
const MM_API_PREFIX2 = `mm/${API_VERSION}/micronets`
const CSRT_PATH = `${MSO_API_PREFIX}/ca/csrt`
const CERTIFICATES_PATH = `${MSO_API_PREFIX}/ca/cert`
const DEVICES_PATH = `${MSO_API_PREFIX}/devices`
const SUBSCRIBER_PATH = `${MSO_API_PREFIX}/subscriber`
const REGISTER_PATH = `${MSO_API_PREFIX}/register`
const SOCKET_PATH = `${MSO_API_PREFIX}/socket`
const MM_CSRT_PATH = `${MM_API_PREFIX2}/csrt`
const MM_CERTIFICATES_PATH = `${MM_API_PREFIX2}/certificates`
const MM_REGISTRY_PATH = `${MM_API_PREFIX2}/registry`
const MM_ODL_PATH = `${MM_API_PREFIX2}/odl`
const MM_SUBSCRIBER_PATH = `${MM_API_PREFIX}/subscriber`
const DPP_PATH = `${MSO_API_PREFIX}/dpp`
const USERS_PATH = `${MSO_API_PREFIX}/users`

const paths = () => {
  return {
    MSO_API_PREFIX ,
    MM_API_PREFIX,
    MM_API_PREFIX2,
    REGISTER_PATH ,
    CSRT_PATH ,
    CERTIFICATES_PATH ,
    SUBSCRIBER_PATH,
    DEVICES_PATH ,
    SOCKET_PATH,
    MM_CSRT_PATH,
    MM_CERTIFICATES_PATH,
    MM_REGISTRY_PATH,
    MM_ODL_PATH,
    MM_SUBSCRIBER_PATH,
    USERS_PATH,
    DPP_PATH
  }
}

module.exports = paths()