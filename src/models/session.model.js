// session-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const session = new Schema({
    token: { type: String, required: true },
    subscriberId: { type: String, required: true },
    deviceId: { type: String, required: false }
  }, {
    timestamps: true
  });

  return mongooseClient.model('session', session);
};
