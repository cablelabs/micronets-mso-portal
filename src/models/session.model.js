// session-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const session = new Schema({
        id: { type: String, required: true,  unique: true, primaryKey: true },
        devices:[{
            deviceId: { type: String, required: true },
            clientId: { type: String, required: true },
            macAddress: { type: String, required: true }
          }]
  }, {
    timestamps: true
  });

  return mongooseClient.model('session', session);
};
