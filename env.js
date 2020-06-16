const targetPrefix = "RS_I18N_LAN_"

const targetCache = Object.keys(process.env).filter(k => k.startsWith(targetPrefix)).reduce((cache, key) => {
    cache[key.replace(targetPrefix, "")] = process.env[key];
    return cache;
}, {});
console.log("baidu translation to: ", targetCache)
module.exports = {
    seq: '____',
    suffix: process.env.RS_I18N_TARGET_FILE_SUFFIX,
    baiduAppId: process.env.RS_I18N_BAIDU_APP_ID,
    baiduAppSecret: process.env.RS_I18N_BAIDU_APP_SECRET,
    localesDir: process.env.RS_I18N_LOCALES_DIR,
    baseLanguage: process.env.RS_I18N_BASE_LANGUAGE,
    debugFormat: process.env.RS_I18N_DEBUG_FORMAT,
    getTargetTo: (lan) => {
        let to = targetCache[lan]
        return (to === undefined || to === "") ? lan.split("-")[0] : to;
    },
};


