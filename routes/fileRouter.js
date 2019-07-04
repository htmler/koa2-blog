const router = require('koa-router')()
const Discuss = require('../models/discuss')
const File = require('../models/File')
const Content = require('../models/content')
const path = require('path')
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
router.get('/fileList', async (ctx, next) => {
    const params = ctx.query
    let result = await File.find({ tag: params.tag }, function (err, data) {
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
    let content = obj.content;
    delete obj.content;
    let file = new File(obj);
    const result = await file.save()
    let contentObj = {
        contentId: result.contentId,
        content: content
    }
    const contentResult = await new Content(contentObj).save()
    ctx.body = contentResult
})
router.post('/fileDetail', async (ctx, next) => {
    const obj = ctx.request.body;
    let contentResult = '';
    let result = '';
    const fileResult = await File.findOne({ _id: obj.id }, function (err, data) {
        if (err) {
            return err;
        } else {
            return data;
        }
    })
    if (fileResult.contentId) {
        contentResult = await Content.findOne({ contentId: fileResult.contentId }, function (err, data) {
            if (err) {
                return err;
            } else {
                return data;
            }
        })
        result = {
            ...fileResult._doc,
            content: contentResult.content,
        }
    } else {
        result = {
            ...fileResult._doc,
        }
    }
    ctx.body = result;
})
router.post('/fileEdit', async (ctx, next) => {
    let obj = ctx.request.body;
    let content = obj.content;
    delete obj.content;
    const result = await File.update({ _id: obj._id }, obj, function (err, data) {
        if (err) {
            return err;
        } else {
            return data;
        }
    })
    let contentObj = {
        content: content
    }
    const contentResult = await Content.update({ contentId: obj.contentId }, contentObj, function (err, data) {
        if (err) {
            return err;
        } else {
            return data;
        }
    })
    ctx.body = contentResult;
})
router.post('/fileUpload', async (ctx, next) => {
    client.useBucket('client-cq');
    let file;
    let result;
    if (ctx.request.files.file) {
        file = ctx.request.files.file;
        result = await client.put(file.name, file.path);
    } else {
        file = ctx.request.files.image;
        result = await client.put(file.name, file.path);
    }
    ctx.body = {
        ...file,
        imgUrl: result.url
    };
})
router.get('/fileRemove', async (ctx, next) => {
    const params = ctx.query
    const result = await File.remove({ _id: params.id }, function (err, data) {
        if (err) {
            return err;
        } else {
            return data;
        }
    })
    ctx.body = result;
})

module.exports = router
