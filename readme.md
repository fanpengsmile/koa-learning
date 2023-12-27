## 如何使用代理
### 正常接口返回，请在请求头Headers中设置以下信息（必须）：
```js
    'x-multi-proxy': `host:${host}:${port}`, // 这里写要代理的host以及port
    'x-bussiness-id': 'business', // 这里必须写，前期制作一个简单的校验，来判断用户是否有代理的权限
    // 如果后期机器被太多不认识的接口做代理，导致机器缓慢，这里可以做加密解密来验证代理权限
```
#### 下面是一个代理的例子：
```js
    axios({
        method: 'get',
        url: 'http://21.0.143.5/getTask', // 这是代理的域名，后面的url回添加到代理的地址上，比如getTask最后会访问http://${host}:${port}/getTask
        data: {},
        headers: {
            'x-multi-proxy': `host:${host}:${port}`, // 这里写要代理的host以及port
            'x-bussiness-id': 'business',
        }
    };)
```

### 如果是上传文件，必须在Headers中添加
```js
    'content-type': 'multipart/form-data',
```

### 如果是下载文件，必须在Headers中添加
```js
    'responsetype': 'arraybuffer',
```