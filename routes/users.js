const router = require('koa-router')()
const File = require('../models/File')
router.prefix('/users')

router.get('/', function (ctx, next) {
  let file  = new File({
    title:'如何成功的写文章',
    author:'陈前',
    imgUrl:'www.baidu.com',
    content:'简单点',
    startTime:'2018-03-08',
    summary:'简介',
    isBanner:false,
    link:'www.baidu.com',
    keyWords:[
      '原创',
      '转载'
    ]
  });
  file.save((err) =>{
    console.log('保存成功');
  })
})

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})

module.exports = router
