const assert = require('assert');
const app = require('../../src/app');

describe('\'certificates\' service', () => {
  it('registered the service', () => {
    const service = app.service('ca/cert');

    assert.ok(service, 'Registered the service');
  });
});
