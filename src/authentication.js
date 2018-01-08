const authentication = require('feathers-authentication');
const errors = require('feathers-errors');
const jwt = require('feathers-authentication-jwt');
const { authenticate } = authentication.hooks;

module.exports = function () {
  const app = this;
  const config = app.get('authentication');

  // Set up authentication with the secret
  app.configure(authentication(config));
  app.configure(jwt());

  // The `authentication` service is used to create a JWT.
  // The before `create` hook registers strategies that can be used
  // to create a new valid JWT (e.g. local or oauth2)
  app.service('authentication').hooks({
    before: {
      create: [
        hook => {
          const { data  } = hook;
          if(!data.clientID || !data.deviceID || !data.macAddress) {
            throw new errors.BadRequest('Missing request parameters', {
              clientID: '34534534',
              deviceID: '2323423',
              macAddress: '00-14-22-01-23-45'
            });
          }
          hook.params.payload = hook.params.payload || {};
          // merge in a custom properties
          Object.assign(hook.params.payload, hook.data);
        }
      ]
    }
  });
};

