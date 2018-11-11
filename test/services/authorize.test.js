const assert = require('assert');
const app = require('../../api/app');

describe('\'authorize\' service', () => {
  it('registered the service', () => {
    const service = app.service('authorize/subscribers');

    assert.ok(service, 'Registered the service');
  });
});
