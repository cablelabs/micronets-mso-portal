// A hook that checks if request is from authentic source service
// const logger = require('winston');
const {find , eqProps } = require('ramda');

module.exports = function () {
  return function  (hook) {
    const regServerConfig = hook.app.get('registrationServer');
    const { data , params } = hook;
    const regServerSource = Object.assign({} ,{url:params.headers.host})
    const clinicSource = Object.assign({} ,{url:data.clientID})
    const regServer = find(eqProps('url', Object.assign({} ,{url:params.headers.host})), regServerConfig.hosts);
    const clinic = find(eqProps('url', Object.assign({} ,{url:data.clientID})), regServerConfig.clinics);
    hook.data = !!regServer && !!clinic
    return hook;
  };
};
