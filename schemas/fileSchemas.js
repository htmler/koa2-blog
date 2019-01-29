var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//创建Schema
var fileSchema = new Schema({
    title:String,
    author:String,
    content:String,
    date1:String,
    desc:String,
    delivery:Boolean,
    type:Array,
    tag:String
});
module.exports = fileSchema;