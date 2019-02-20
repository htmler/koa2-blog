const router = require('koa-router')()
const File = require('../models/File')
const User = require('../models/user')
const fs = require('fs')
const path = require('path')
const markdown = require("markdown").markdown;
const createToken = require('../token/createToken');
const sha1 = require('sha1');
const moment = require('moment');
const objectIdToTimestamp = require('objectid-to-timestamp');
const checkToken = require('../token/checkToken');
router.prefix('/api')
router.post('/register', async (ctx, next) => {
  let obj = ctx.request.body;
  let username = obj.username;
  // obj = {
  //   ...obj,
  //   // create_time: moment(objectIdToTimestamp(obj._id)).format('YYYY-MM-DD HH:mm:ss')
  // }
  console.log(obj);
  let findResult = await User.find({ username: obj.username }, function (err, data) {
    if (err) {
      return err;
    } else {
      return data;
    }
  })
  if (findResult.length > 1) {
    ctx.body = {
      errMessage: '该用户名已存在',
      status: false
    }
  } else {
    let user = new User(obj);
    let result = await user.save((err, data) => {
      if (err) {
        return err
      } else {
        return data
      }
    })
    ctx.body = {
      ...result,
      status: true
    }
  }
})
router.get('/login', async (ctx, next) => {
  const params = ctx.query
  let result = await User.findOne({ username: params.username }, function (err, data) {
    if (err) {
      return err;
    } else {
      return data;
    }
  })
  if (!result) {
    ctx.body = {
      errMessage: '该用户不存在',
      status: false
    }
  } else {
    let result = await User.findOne({ username: params.username, password: params.password }, function (err, data) {
      if (err) {
        return err;
      } else {
        return data;
      }
    })
    if (!result) {
      ctx.body = {
        errMessage: '密码输入不正确',
        status: false
      }
    } else {
      let token = createToken(params.username);
      result.token = token;
      let upDoc = await User.update({ _id: result._id }, result, function (err, data) {
        if (err) {
          return err;
        } else {
          return data;
        }
      })
      if (result.username === 'system') {
        ctx.body = {
          ...result,
          isSystem: true,
          status: true
        }
      } else {
        ctx.body = {
          ...result,
          status: true
        }
      }
    }
  }
})
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
router.get('/fileHomeList',checkToken, async (ctx, next) => {
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
    delivery: true
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
