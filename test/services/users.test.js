const assert = require('assert');
const app = require('../../src/app');

describe('\'devices\' service', () => {
  it('registered the service', () => {
    const service = app.service('users');

    assert.ok(service, 'Registered the service');
  });
});
