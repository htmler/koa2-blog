var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//创建Schema
var fileSchema = new Schema({
    title:String,
    author:String,
    date1:String,
    desc:String,
    delivery:Boolean,
    type:Array,
    imageUrl:String,
    avater:String,
    contentId:Number,
    tag:String
},{strict:false});
module.exports = fileSchema;