const router = require('koa-router')()
const Discuss = require('../models/discuss')
const checkToken = require('../token/checkToken');
router.prefix('/api')
// 评论接口
//讨论保存
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
