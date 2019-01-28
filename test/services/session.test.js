const assert = require('assert');
const app = require('../../src/app');

describe('\'session\' service', () => {
  it('registered the service', () => {
    const service = app.service('portal/session');
    assert.ok(service, 'Registered the service');
  });
});
