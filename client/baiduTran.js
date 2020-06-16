const request = require('request');
const crypto = require('crypto');
const {baiduAppId, baiduAppSecret, seq} = require('../env');

const signRequest = (q, salt) => {
    let content = baiduAppId + q + salt + baiduAppSecret;
    return crypto.createHash('md5').update(content).digest('hex');
};

const baiduTran = (q = 'apple', to = 'zh') => {
    let salt = new Date().getTime().toFixed(0);
    let sign = signRequest(q, salt);
    return new Promise(function (resolve, reject) {
        request.post('https://fanyi-api.baidu.com/api/trans/vip/translate', {
            'json': true,
            form: {'appid': baiduAppId, 'from': 'auto', q, to, salt, sign},
        }, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};
exports.baiduTran = baiduTran;




