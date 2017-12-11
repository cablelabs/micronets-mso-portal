const authentication = require('feathers-authentication')
const errors = require('feathers-errors');
const jwt = require('feathers-authentication-jwt');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const moment = require('moment');
const { authenticate } = authentication.hooks
  module.exports = function () {
    const app = this;
    const config = app.get('authentication')

    // Set up authentication with the secret
    app.configure(authentication(config))
    app.configure(jwt())

    // The `authentication` service is used to create a JWT.
   // The before `create` hook registers strategies that can be used
   // to create a new valid JWT (e.g. local or oauth2)
    app.service('authentication').hooks({
      before: {
        create: [
          //authentication.hooks.authenticate(config.strategies),
          // This hook adds the `test` attribute to the JWT payload by
          // modifying params.payload.
          hook => {
            // make sure params.payload exists
            const { data , params } = hook
            console.log('\n data  : ' + JSON.stringify(data))
            console.log('\n params : ' + JSON.stringify(params))
            console.log('\n BEFORE hook.params.payload : ' + JSON.stringify(hook.params.payload))
            hook.params.payload = hook.params.payload || {}
            console.log('\n AFTER hook.params.payload : ' + JSON.stringify(hook.params.payload))
            // merge in a custom properties
            Object.assign(hook.params.payload,data)
          }

        ],
        remove: [
          authenticate('jwt')
        ]
      }
    })

  }

