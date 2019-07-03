const router = require('koa-router')()
const User = require('../models/user')
const fs = require('fs')
const createToken = require('../token/createToken');
const os = require('os');
const objectIdToTimestamp = require('objectid-to-timestamp');
const checkToken = require('../token/checkToken');
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

module.exports = router
