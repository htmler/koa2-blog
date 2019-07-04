var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//创建Schema
var contentSchema = new Schema({
    content:String,
    contentId:Number
});
module.exports = contentSchema;