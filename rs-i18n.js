require('./init')
const pkg = require("./package.json");
const program = require('commander');
const logger =require("./logger").logger("rs-i18n[main]");
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
    .option('-i, --info', "show verbose info file and line code")
    .option('-f, --fromLanguage <type>', "force baseLanguage")

program.parse(process.argv);
const env = require("./env");

if (program.translation) {
    if (!(env.baiduAppId && env.baiduAppSecret)) {
        logger.error("not exits rs-i18n.env.RS_I18N_BAIDU_APP_ID or rs-i18n.env.RS_I18N_BAIDU_APP_SECRET")
        process.exit(-1);
    } else {
        logger.info("baidu appId: ", env.baiduAppId)
    }
}

if (env.localesDir) {
    logger.info("target locales dir: ", env.localesDir);
} else {
    logger.error("not exits rs-i18n.env.RS_I18N_LOCALES_DIR ");
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
    logger.info("current Languages:", languages)
}


if (baseLanguage) {
    logger.info("baseLanguage: ", baseLanguage);
} else {
    if (languages.length === 0) {
        console.log("")
        process.exit(-1);
    } else {
        baseLanguage = languages[0];
        logger.info("baseLanguage", baseLanguage, " from currentLanguages[0]")
    }
}


if (program.debug) {
    logger.info("debug mode, debug format: ", env.debugFormat);
}
if (program.translation) {
    logger.info("translation mode")
}

console.log("\r\n")
const {listLocalesJson, getFileJson, tranJson} = require("./tran");
const util = require('./util');
let fss = listLocalesJson(env.localesDir, baseLanguage);


logger.info("all locales json files: ", fss)
program.languages.forEach(lan => {
    logger.info("target Language: " + lan + " => " + env.getTargetTo(lan))
})

for (let lan of program.languages) {
    for (let filePath of fss) {
        let source = getFileJson(filePath);
        let targetFilePath = filePath.replace(baseLanguage, lan);
        let target = getFileJson(targetFilePath);
        tranJson(source, target, {
            transfer: program.translation,
            from: env.getTargetTo(baseLanguage),
            to: env.getTargetTo(lan),
            debug: program.debug,
            arrayResult: program.info
        }).then(data => {
            if (program.info) {
                let content = JSON.stringify(util.ExpandJson({...data[1], ...data[2]}), null, "\t");
                util.writeFileRecursive(targetFilePath, content);
                let arr = content.split("\n");
                Object.keys(data[2]).forEach(item => {
                    let v0 = data[0][item];
                    let v = data[2][item];
                    let key = item.split(env.seq).slice(-1).join("") + `": "` + v + `"`
                    let line = getLineNumber(arr,key)
                    logger.info("./" + targetFilePath.replace(/\\/g,"/") + ":" + line + "\t" + v0 + "\t===>>>\t" + v)
                })
            } else {
                util.writeFileRecursive(targetFilePath, JSON.stringify(util.ExpandJson(data), null, '\t'));
            }
        });
    }
}
const getLineNumber = (contents,target)=>{
   return contents.reduce((line,item,index)=>{
        if(line === -1){
            if(item.indexOf(target)!==-1){
                line=index+1;
            }
        }
        return line;
    },-1);
}
