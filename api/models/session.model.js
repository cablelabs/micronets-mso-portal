module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const session = new Schema({
    username: { type: String, required: true, primaryKey: true, unique:true, sparse: true },
    token: { type: String, required: true },
  }, {
    timestamps: true
  });

  return mongooseClient.model('session', session);
};