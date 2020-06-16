const {seq, localesDir, baseLanguage, suffix, debugFormat} = require('./env');
const {toObj, toExpandJson} = require('./util');
const {baiduTran} = require('./client/baiduTran');
const fs = require('fs');
const path = require('path');
const tranJson = async (source = {}, target = {}, options = {
    transfer: false,
    to: 'zh',
    debug: false
}) => {
    const d1 = toObj('', source);
    const d2 = toObj('', target);
    for (const key of Object.keys(d1)) {
        const v = d2[key];
        if (v === undefined) {
            let value = d1[key];
            if (options.transfer) {
                let {body} = await baiduTran(value, options.to);
                if (body['trans_result']) {
                    if (options.debug) {
                        d2[key] = debugFormat.replace(/{%s}/g, body['trans_result'][0]['dst']);
                    } else {
                        d2[key] = body['trans_result'][0]['dst'];
                    }
                    console.log('trans_result: ', JSON.stringify(body));
                } else {
                    d2[key] = value;
                    console.log('translate err：', {key, value}, body);
                }
            } else {
                console.log('new Key: ', key, value);
                d2[key] = value;
            }
        }
    }
    return Object.keys(d2).reduce((data, key) => {
        if (key.indexOf(seq) < 0) {
            data = {...data, [key]: d2[key]};
        } else {
            data = {...data, ...toExpandJson(data, key.split(seq), data[key.split(seq)[0]], 0, d2[key])};
        }
        return data;
    }, {});
    // fs.writeFileSync('result.json', JSON.stringify(result, null, '\t'));
};
exports.tranJson = tranJson;
const getFileJson = (filePath) => {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath).toString();
        return JSON.parse(content);
    } else {
        return {};
    }
};
exports.getFileJson = getFileJson;

const listLocalesJson = (dir = localesDir, lan = baseLanguage, options = {}) => {
    let basePath = path.join(dir, lan);
    let fds = fs.readdirSync(basePath).filter((fileName) => {
        return fs.statSync(path.join(basePath, fileName)).isDirectory();
    }).reduce((arr, dirName) => {
        arr = arr.concat(listLocalesJson(path.join(basePath, dirName), '', options));
        return arr;
    }, []);
    let ffs = fs.readdirSync(basePath).filter((fileName) => {
        return !fs.statSync(path.join(basePath, fileName)).isDirectory() && fileName.endsWith(suffix);
    }).map(fileName => {
        return path.join(basePath, fileName);
    });
    return ffs.concat(fds);
};
exports.listLocalesJson = listLocalesJson;



