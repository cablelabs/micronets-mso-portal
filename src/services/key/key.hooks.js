const { authenticate } = require('feathers-authentication').hooks;
const errors = require('feathers-errors');
module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [
      hook => {
        if(hook.params.authenticated){
          const config = hook.app.get('authentication');
          hook.result = Object.assign({},{ key:config.secret });
        }
        else {
          throw new errors.NotAuthenticated();
        }
      }
    ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
