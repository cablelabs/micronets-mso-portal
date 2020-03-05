const assert = require('assert');
const app = require('../../api/app');

describe('\'onboarding\' service', () => {
  it('registered the service', () => {
    const service = app.service('onboarding/dpp');

    assert.ok(service, 'Registered the service');
  });
});
