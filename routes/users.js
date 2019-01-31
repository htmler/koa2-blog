const router = require('koa-router')()
const File = require('../models/File')
const fs = require('fs')
const path  = require('path')
router.prefix('/api')

router.get('/fileList', async (ctx, next) => {
  const params = ctx.query
  const result = await File.find({ tag: params.tag }, function (err, data) {
    if (err) {
      return err;
    } else {
      return data;
    }
  })
  ctx.body = result;
})

router.post('/fileSave', async (ctx, next) => {
  let obj = ctx.request.body;
  let file = new File(obj);
  console.log(file)
  let result = await file.save((err, data) => {
    if (err) {
      return err
    } else {
      return data
    }
  })
  ctx.body = result
})
router.post('/fileDetail', async (ctx, next) => {
  const obj = ctx.request.body;
  const result = await File.findOne({ _id: obj.id }, function (err, data) {
    if (err) {
      return err;
    } else {
      return data;
    }
  })
  ctx.body = result;
})
router.post('/fileEdit', async (ctx, next) => {
  const obj = ctx.request.body;
  console.log(obj);
  const result = await File.update({ _id: obj._id }, obj, function (err, data) {
    if (err) {
      return err;
    } else {
      return data;
    }
  })
  ctx.body = result;
})
router.post('/fileUpload', async (ctx, next) => {
  const file = ctx.request.files.file;
  const reader = fs.createReadStream(file.path);
  let filePath = path.join(__dirname, '../public/images') + `/${file.name}`;
  const upStream = fs.createWriteStream(filePath);
  reader.pipe(upStream);
  ctx.body = {
    ...file,
    imgUrl:`/public/images/${file.name}`
  };
})

module.exports = router
