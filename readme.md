# Starter
````$xslt
yarn add --dev rs-i18n
rs-i18n -lan zh-CN
````

## Description
    1、deep merge to Add other i18n language json file
    2、Automatic translation using Baidu translation API
    3、debug mode format 
    4、In the process of international development, automatically merge and translate JSON files in other languages
## Step1 
    rs-i18n.env file or env-cmd -f ./config/dev.js 
create file rs-i18n.env
````
    RS_I18N_BAIDU_APP_ID=                    #百度翻译API AppID
    RS_I18N_BAIDU_APP_SECRET=                #百度翻译API 秘钥
    RS_I18N_LOCALES_DIR=./resource/locales   #基础文件夹路径 
    RS_I18N_BASE_LANGUAGE=en-US              #基础语言
    RS_I18N_TARGET_FILE_SUFFIX= '.json'      #文件后缀
    RS_I18N_DEBUG_FORMAT=__{%s}__            #debug模式模板

    RS_I18N_LAN_zh-CN=zh                     #百度API 目标语言参数转换 默认 zh-CH=>zh 可增加配置 RS_I18N_LAN_开头即可                     
   
````
## Step2

````
    rs-i18n -td -lan zh-CN
````
## help
````$xslt
rs-i18n -e
Usage: rs-i18n [options]
Options:
  -V, --version             output the version number
  -lan, --languages <type>  Target language, delimited
  -t, --translation         auto translation, e.g. zh-CN=>zh
  -d, --debug               debug mode format rs-i18n.env.FORMAT
  -e, --help                read more information
````
## 百度通用翻译API   https://api.fanyi.baidu.com
