var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//创建Schema
var fileSchema = new Schema({
    title:String,
    author:String,
    imgUrl:String,
    content:String,
    startTime:String,
    summary:String,
    isBanner:Boolean,
    link:String,
    keyWords:Array
});
module.exports = fileSchema;