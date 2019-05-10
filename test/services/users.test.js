const assert = require('assert');
const app = require('../../api/app');

describe('\'users\' service', () => {
  it('registered the service', () => {
    const service = app.service('portal/v1/users');

    assert.ok(service, 'Registered the service');
  });
});
