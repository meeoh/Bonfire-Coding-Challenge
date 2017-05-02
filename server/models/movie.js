// user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Movie = new Schema({
  title: String
});

module.exports = mongoose.model('movies', Movie);