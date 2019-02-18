var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//创建Schema
var countSchema = new Schema({
    view
},{strict:false});
module.exports = countSchema;