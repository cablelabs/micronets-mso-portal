const assert = require('assert');
const app = require('../../api/app');

describe('\'status\' service', () => {
  it('registered the service', () => {
    const service = app.service('onboarding/dpp/status');

    assert.ok(service, 'Registered the service');
  });
});
