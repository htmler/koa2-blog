const router = require('koa-router')()
const File = require('../models/File')
const fs = require('fs')
const path = require('path')
const markdown = require("markdown").markdown;
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
router.get('/fileAmuseList', async (ctx, next) => {
  const result = await File.find({
    $or: [
      { tag: 'music' },
      { tag: 'video' },
    ],
  }, function (err, data) {
    if (err) {
      return err;
    } else {
      return data;
    }
  });
  ctx.body = result;
})
router.get('/fileHomeList', async (ctx, next) => {
  const params = ctx.query
  const result = await File.find({ tag: params.tag }, function (err, data) {
    if (err) {
      return err;
    } else {
      return data;
    }
  }).sort({ view: -1 });
  ctx.body = result;
})
router.get('/fileBannerList', async (ctx, next) => {
  const result = await File.find({ delivery: true }, function (err, data) {
    if (err) {
      return err;
    } else {
      return data;
    }
  }).limit(3);
  ctx.body = result;
})
router.get('/fileBannerList', async (ctx, next) => {
  const result = await File.find({ delivery: true }, function (err, data) {
    if (err) {
      return err;
    } else {
      return data;
    }
  }).limit(3);
  ctx.body = result;
})
router.get('/fileAmuseBannerList', async (ctx, next) => {
  const result = await File.find({
    $or: [
      { tag: 'music' },
      { tag: 'video' },
    ],
    delivery:true
  }, function (err, data) {
    if (err) {
      return err;
    } else {
      return data;
    }
  });
  ctx.body = result;
})

router.post('/fileSave', async (ctx, next) => {
  let obj = ctx.request.body;
  let file = new File(obj);
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
  console.log(file)
  const reader = fs.createReadStream(file.path);
  let filePath = path.join(__dirname, '../public/dist/static/img') + `/${file.name}`;
  const upStream = fs.createWriteStream(filePath);
  reader.pipe(upStream);
  ctx.body = {
    ...file,
    imgUrl: `http://localhost:3000/static/img/${file.name}`,
  };
})

module.exports = router
