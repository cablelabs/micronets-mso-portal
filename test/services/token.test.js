const assert = require('assert');
const app = require('../../src/app');

describe('\'token\' service', () => {
  it('registered the service', () => {
    const service = app.service('portal/token');

    assert.ok(service, 'Registered the service');
  });
});
