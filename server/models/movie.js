// user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Movie = new Schema({
  title: {
    type: String,
    required: true
  },
  genre: {
    type: String,
    required: true
  },
  actor: String,
  image: String
});

module.exports = mongoose.model('movies', Movie);