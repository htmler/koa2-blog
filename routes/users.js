const router = require('koa-router')()
const File = require('../models/File')
const User = require('../models/user')
const Discuss = require('../models/discuss')
const fs = require('fs')
const path = require('path')
const markdown = require("markdown").markdown;
const createToken = require('../token/createToken');
const sha1 = require('sha1');
const moment = require('moment');
const os = require('os');
const objectIdToTimestamp = require('objectid-to-timestamp');
const checkToken = require('../token/checkToken');
let OSS = require('ali-oss');
let client = new OSS({
  region: 'oss-cn-beijing',
  //云账号AccessKey有所有API访问权限，建议遵循阿里云安全最佳实践，部署在服务端使用RAM子账号或STS，部署在客户端使用STS。
  accessKeyId: 'LTAIp7UWQxgZaE81',
  accessKeySecret: 'fZgBLurtYpcVFtqAV1O1KRWlsLN6Yp',
  bucket: 'client-cq',
});
router.prefix('/api')
router.post('/system', async (ctx, next) => {
  let { parseInt } = Number;
  let { freemem, cpus, hostname, platform, release, totalmem, type, constants } = os;
  let total = parseInt(totalmem() / 1024 / 1024);
  let num = parseInt(freemem() / 1024 / 1024);
  let percentage = parseInt((num / total) * 100);
  ctx.body = {
    hostname: hostname(),
    platform: platform(),
    release: release(),
    percentage,
    type: type(),
    totalmem: `${total}MB`,
    freemem: `${num}MB`,
    constants: constants.SIGTRAP ? '1' : '0',
    cpu: cpus()
  }
});
router.post('/register', async (ctx, next) => {
  let obj = ctx.request.body;
  let username = obj.username;
  obj = {
    ...obj,
    token: createToken(username)
  }
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
router.get('/status', checkToken, async (ctx, next) => {
  ctx.body = {
    isSuccess: true
  };
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
router.get('/HotList', async (ctx, next) => {
  const result = await File.find().sort({ view: -1 }).limit(3);
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
  client.useBucket('client-cq');
  let file;
  let result;
  if(ctx.request.files.file){
    file = ctx.request.files.file;
    result = await client.put(file.name, file.path);
  }else{
    file = ctx.request.files.image;
    result = await client.put(file.name, file.path);
  }
  ctx.body = {
    ...file,
    imgUrl:result.url
  };
})
// 用户接口
router.get('/userInfo', checkToken, async (ctx, next) => {
  const params = ctx.query
  const result = await User.findOne({ username: params.username }, function (err, data) {
    if (err) {
      return err;
    } else {
      return data;
    }
  });
  ctx.body = result;
})
// 评论接口
router.post('/discussSave', checkToken, async (ctx, next) => {
  let obj = ctx.request.body;
  let discuss = new Discuss(obj);
  let result = await discuss.save((err, data) => {
    if (err) {
      return err
    } else {
      return data
    }
  })
  ctx.body = result
})
router.get('/discussList', async (ctx, next) => {
  let result = await Discuss.find((err, data) => {
    if (err) {
      return err
    } else {
      return data
    }
  })
  ctx.body = result
})

module.exports = router
