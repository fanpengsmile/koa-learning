const { judgeBlackList } = require('./util');
const FormData = require('form-data');
const fs = require('fs');
const FormStream = require('formstream');
const axios = require('axios');
const Scurl = require('@tencent/scurl');
const logge = require('./logger');
/**()
 * 代理的请求方式
 *
 * @param {*} ctx
 */
exports.proxyAxios = async (ctx, type) => {
    const result = await dealReq(ctx, ctx.request.query, type);
    if (ctx.request.header['responsetype'] === 'arraybuffer') {
        const buffer = Buffer.from(result);
        ctx.body = buffer;
    } else if (ctx.request.header['responsetype'] === 'blob' || ctx.request.header['responsetype'] === 'stream') {
        ctx.type = 'application/octet-stream';
        ctx.body = result;
    } else {
        ctx.body = result;
    }
};

function getIpPort(ctx) {
    const headers = ctx.request.headers;
    const proxtHost = headers['x-multi-proxy'];
    if (!proxtHost) {
        return {
            code: -2,
            msg: '请在header中添加转发地址，x-multi-proxy: `host:${host}:${port}`'
        };
    }
    try {
        const xposrtList = proxtHost.split(':');
        if (xposrtList[0] === 'host' && !isNaN(parseInt(xposrtList[1])) && !isNaN(parseInt(xposrtList[1]))) {
            return {
                code: 0,
                msg: 'success',
                ipPort: `${xposrtList[1]}:${xposrtList[2]}`
            };
        }
        return {
            code: -2,
            msg: '请在header中添加转发地址，x-multi-proxy: `host:${host}:${port}`',
        };
    } catch (error) {
        return {
            code: -2,
            msg: '请在header中添加转发地址，x-multi-proxy: `host:${host}:${port}`',
        };
    }

}

async function getParsedBody(ctx) {
    let { body } = ctx.request;
    if (body === undefined || body === null) {
        return undefined;
    }
    if (Buffer.isBuffer(body)) {
        return body;
    }
    const contentType = ctx.request.header['content-type'];
    if (contentType && contentType.indexOf('multipart/form-data') > -1) {
        const formData = new FormData();
        const { file } = ctx.request.files;
        const fileStream = fs.createReadStream(file.path);
        formData.append(file.filename, fileStream);
        return formData;
    }
    if (typeof body !== 'string' && contentType && contentType.indexOf('json') !== -1) {
        body = JSON.stringify(body);
    }
    return body;
}

const dealReq = async (ctx, data, type) => {
    // const noProxy = judgeBlackList(ctx);
    // if (noProxy) {
    //     return {
    //         code: -1,
    //         msg: '代理失败'
    //     };
    // }

    const { code, msg, ipPort } = getIpPort(ctx);
    if (code !== 0 || !ipPort) {
        return { code, msg };
    }

    const finalUrl = `http://${ipPort}${ctx.path}`;
    const parsedBody = await getParsedBody(ctx);
    console.log('===========Url=============');
    console.log(finalUrl);
    console.log('===========Body=============');
    console.log(parsedBody);
    const reqHeader = ctx.request.header;
    const contentType = reqHeader['content-type'];
    const newHeaders = {};
    Object.keys(reqHeader).forEach((name) => {
        if (name === 'content-type' || name === 'content-length') {
            return;
        }
        newHeaders[name] = reqHeader[name];
    });
    console.log('===========Hedaers=============')
    console.log(newHeaders);
    // newHeaders['content-type'] = 'application/octet-stream'
    const scurl = new Scurl();
    scurl.setInterceptInner(false);
    const opt = {
        method: type,
        url: finalUrl,
        data: parsedBody,
        httpAgent: scurl.hook(finalUrl),
        headers:
            // 如果是传的文件，headers需要特殊处理一下
            (contentType && contentType.indexOf('multipart/form-data')) > -1
                ? {
                    ...(new FormData()).getHeaders(),
                    ...newHeaders,
                }
                : reqHeader,
    };
    if (newHeaders['responsetype']) {
        opt.responseType = newHeaders['responsetype'];
    }
    console.log('===========opt=============')
    console.log(opt);
    let result;
    try {
        result = await axios(opt);
    } catch (error) {
        console.log(error);
        logge.error('[errHandler] [%s]  err=%j', ctx.state.id, {
            code: error.code,
            msg: 'errHandler',
            error: `message=${error?.message}; stack=${error?.stack}`,
        });
        ctx.body = error;
        return error;
    }
    Object.keys(result.headers).forEach((name) => {
        if (name === 'transfer-encoding') {
            return;
        }
        ctx.set(name, result.headers[name]);
    });
    console.log('===========result=============');
    console.log(result.body || result.data);
    return result.body || result.data;
};