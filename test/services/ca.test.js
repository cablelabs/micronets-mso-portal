const assert = require('assert');
const app = require('../../src/app');

describe('\'ca\' service', () => {
  it('registered the service', () => {
    const service = app.service('ca/csrt');

    assert.ok(service, 'Registered the service');
  });
});
