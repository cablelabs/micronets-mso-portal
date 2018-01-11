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
              clientID: 'www.happy-clinic.com',
              deviceID: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
              macAddress: '08:00:69:02:01:FC'
            });
          }
          hook.params.payload = hook.params.payload || {};
          // merge in a custom properties
          Object.assign(hook.params.payload, hook.data);
        }
      ]
    },
    after:{
      create: [
        hook => {
          const { data ,params  } = hook;
        }
      ],
    }
  });
};

