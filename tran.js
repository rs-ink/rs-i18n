const {seq, localesDir, baseLanguage, suffix, debugFormat} = require('./env');
const {toObj, ExpandJson} = require('./util');
const {baiduTran} = require('./client/baiduTran');
const fs = require('fs');
const path = require('path');

const translationFormat = (value, debug) => {
    if (!debug || debugFormat === "" || debugFormat === undefined) {
        return value
    } else {
        return debugFormat.replace(/{%s}/g, value);
    }
}

const tranJson = async (source = {}, target = {}, options = {
    transfer: false,
    from: "auto",
    to: 'zh',
    debug: false,
    arrayResult: false
}) => {
    const d1 = toObj('', source);
    const d2 = toObj('', target);

    const result = {};
    for (const key of Object.keys(d1)) {
        const v = d2[key];
        if (v === undefined) {
            let value = d1[key];
            if (options.transfer) {
                let {body} = await baiduTran({q: value, from: options.from, to: options.to});
                if (body['trans_result']) {
                    result[key] = translationFormat(body['trans_result'][0]['dst'], options.debug)
                    console.log('trans_result: ', JSON.stringify(body));
                } else {
                    result[key] = value;
                    console.log('translate err：', {key, value}, body);
                }
            } else {
                console.log('new Key: ', key, "\t=>\t", value);
                result[key] = value;
            }
        }
    }
    if (!options.arrayResult) {
        return {...d2, ...result};
    } else {
        return [d1, d2, result];
    }
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



