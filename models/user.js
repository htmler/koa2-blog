var mongoose = require('mongoose');
var userSchemas = require('../schemas/userSchemas');
//创建model，这个地方的ch_user对应mongodb数据库中ch_users的conllection。
//mongoose会自动改成复数，如模型名：xx―>xxes, kitten―>kittens, money还是money
var user = mongoose.model('blog_users',userSchemas);
module.exports = user;