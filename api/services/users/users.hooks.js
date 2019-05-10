const local = require('@feathersjs/authentication-local');
const saltRounds = 10;
const bcrypt = require('bcrypt');
const errors = require('@feathersjs/errors');

module.exports = {
  before: {
    all: [],
    // all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [
      async(hook) => {
        const { data , params } = hook;
        let hashPwd = bcrypt.hashSync(data.password, saltRounds);
        hook.data = Object.assign({},{
          username:data.username,
          password:hashPwd,
          subscriberId: data.subscriberId
        })
      }
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [
      local.hooks.protect('password')
    ],
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
