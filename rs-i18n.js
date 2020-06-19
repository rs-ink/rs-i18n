require('./init')
const pkg = require("./package.json");
const program = require('commander');
const logger = require("log4js").getLogger(pkg.name);
const fs = require("fs");
const path = require("path");

function commaSeparatedList(value, dummyPrevious) {
    return value.split(',');
}

program
    .version(pkg.version)
    .helpOption('-e, --help', 'read more information')
    .requiredOption('-lan, --languages <type>', 'Target language, delimited', commaSeparatedList)
    .option('-t, --translation', "auto translation, e.g. zh-CN=>zh")
    .option('-d, --debug', "debug mode format rs-i18n.env.FORMAT")
    .option('-f, --fromLanguage <type>', "force baseLanguage")

program.parse(process.argv);
const env = require("./env");

if (program.translation) {
    if (!(env.baiduAppId && env.baiduAppSecret)) {
        console.log("not exits rs-i18n.env.RS_I18N_BAIDU_APP_ID or rs-i18n.env.RS_I18N_BAIDU_APP_SECRET")
        process.exit(-1);
    } else {
        console.log("baidu appId: ", env.baiduAppId)
    }
}

if (env.localesDir) {
    console.log("target locales dir: ", env.localesDir);
} else {
    console.log("not exits rs-i18n.env.RS_I18N_LOCALES_DIR ");
    process.exit(-1)
}
let baseLanguage = env.baseLanguage;
if (program.fromLanguage) {
    baseLanguage = program.fromLanguage;
}


let languages = fs.readdirSync(env.localesDir).filter(f =>
    fs.statSync(path.join(env.localesDir, f)).isDirectory()
);
if (languages.length === 0) {
    console.log("")
    process.exit(-1);
} else {
    console.log("current Languages:", languages)
}


if (baseLanguage) {
    console.log("baseLanguage: ", baseLanguage);
} else {
    if (languages.length === 0) {
        console.log("")
        process.exit(-1);
    } else {
        baseLanguage = languages[0];
        console.log("baseLanguage", baseLanguage, " from currentLanguages[0]")
    }
}


if (program.debug) {
    console.log("debug mode, debug format: ", env.debugFormat);
}
if (program.translation) {
    console.log("translation mode")
}

console.log("\r\n")
const {listLocalesJson, getFileJson, tranJson} = require("./tran");
const util = require('./util');
let fss = listLocalesJson(env.localesDir, baseLanguage);


console.log("all locales json files: ", fss)
program.languages.forEach(lan => {
    console.log("target Language:" + lan + "=>" + env.getTargetTo(lan))
})

for (let filePath of fss) {
    let source = getFileJson(filePath);
    for (let lan of program.languages) {
        let targetFilePath = filePath.replace(baseLanguage, lan);
        let target = getFileJson(targetFilePath);
        tranJson(source, target, {
            transfer: program.translation,
            to: env.getTargetTo(lan),
            debug: program.debug
        }).then(data => {
            util.writeFileRecursive(targetFilePath, JSON.stringify(data, null, '\t'));
        });
    }
}
