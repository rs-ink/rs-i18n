const log4js = require('log4js');
log4js.configure( {
    appenders: {
        ruleConsole: {type: 'console', pattern: '%d %p %c %f:%l %m%n'},
        ruleFile: {
            type: 'dateFile',
            filename: 'logs/rs-i18n-',
            pattern: 'yyyy-MM-dd.log',
            maxLogSize: 10 * 1000 * 1000,
            numBackups: 3,
            alwaysIncludePattern: true
        }
},
categories: {
    default: {appenders: ['ruleConsole', 'ruleFile'], level: 'info'}
}});
exports.logger = (name)=>{
    return log4js.getLogger(name||"");
}
