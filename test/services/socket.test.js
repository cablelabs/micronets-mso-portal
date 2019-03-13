const assert = require('assert');
const app = require('../../api/app');

describe('\'socket\' service', () => {
  it('registered the service', () => {
    const service = app.service('portal/v1/socket');

    assert.ok(service, 'Registered the service');
  });
});
