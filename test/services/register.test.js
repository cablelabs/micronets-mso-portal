const assert = require('assert');
const app = require('../../api/app');

describe('\'register\' service', () => {
  it('registered the service', () => {
    const service = app.service('portal/v1/register');

    assert.ok(service, 'Registered the service');
  });
});
