const authentication = require('@feathersjs/authentication');
// const errors = require('feathers-errors');
const jwt = require('@feathersjs/authentication-jwt');
// const { authenticate } = authentication.hooks;
// const {find , eqProps } = require('ramda');
module.exports = function () {
  const app = this;
  const config = app.get('authentication');
  // const regServerConfig = app.get('registrationServer');
  // Set up authentication with the secret
  app.configure(authentication(config));
  app.configure(jwt());

  // The `authentication` service is used to create a JWT.
  // The before `create` hook registers strategies that can be used
  // to create a new valid JWT (e.g. local or oauth2)
  app.service('/portal/v1/registration/token').hooks({
    before: {
      create: [
        hook => {
          // const { data , params  } = hook
          // const regServer = find(eqProps('url', Object.assign({} ,{url:params.headers.host})), regServerConfig.hosts);
          // const clinic = find(eqProps('url', Object.assign({} ,{url:data.clientID})), regServerConfig.clinics);
          // Uncomment to check if reg server is authentic
          //  if(!!regServer) {
          //  if(!data.clientID || !data.deviceID || !data.macAddress) {
          //      throw new errors.BadRequest('Missing request parameters', {
          //        clientID: 'www.happy-clinic.com',
          //        deviceID: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          //        macAddress: '08:00:69:02:01:FC'
          //      });
          //    }
          //    hook.params.payload = hook.params.payload || {};
          //    // merge in a custom properties
          //    Object.assign(hook.params.payload, hook.data);
          //    return hook;
          // }
          //   else {
          //     throw new errors.Forbidden('Registration server could not be verified')
          //   }
          hook.params.payload = hook.params.payload || {};
          // merge in a custom properties
          Object.assign(hook.params.payload, hook.data);
          return hook;
        }
      ]
    },
    after:{
      create: [],
    }
  });
};

