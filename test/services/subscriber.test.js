const assert = require('assert');
const app = require('../../src/app');

describe('\'subscriber\' service', () => {
  it('registered the service', () => {
    const service = app.service('internal/subscriber');
    assert.ok(service, 'Registered the service');
  });
});
