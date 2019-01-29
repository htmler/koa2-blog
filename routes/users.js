const router = require('koa-router')()
const File = require('../models/File')
router.prefix('/api')

router.get('/fileList', async (ctx, next) => {
      const result  = await  File.find()
      ctx.body = result;
})

router.post('/fileSave', async (ctx, next) => {
  let obj = ctx.request.body;
  let file  = new File(obj);
  console.log(file)
  let result  = await file.save((err,data) =>{
    if(err){
      return err
    }else{
      return data
    }
  })
  ctx.body = result
})
router.get('/user', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})

module.exports = router
