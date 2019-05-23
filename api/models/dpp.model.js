// dpp-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const dpp = new Schema({
    username: { type: String, required: true, primaryKey: true, unique:true, sparse: true },
    token: { type: String, required: true },
  }, {
    timestamps: true
  });

  return mongooseClient.model('dpp', dpp);
};
