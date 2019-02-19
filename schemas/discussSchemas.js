var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//创建Schema
var discussSchema = new Schema({
    username:String,
    date: String,
    content:String,
},{strict:false});
module.exports = discussSchema;