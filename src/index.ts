import { mkdirSync, readdirSync, statSync, writeFile } from 'fs'
import { join } from 'path'
import { ApiItem, CategoryItem, Property, PropertyArray, PropertyObject } from './modules/IYapi';

let globalNumber = 360000;
let unKnowLetIndex = 0;
const baseTypes = ['string', 'number', , 'integer', 'boolean']
const unionTypes = ['array', 'object']
const [STRING, NUMBER, INTEGER, BOOLEAN, ARRAY, OBJECT] = ['string', 'number', 'integer', 'boolean', 'array', 'object']

/**
 * 生成interface名字
 * @returns 
 */
function getNewTypeName() {
    ++globalNumber
    return `Interface_${globalNumber.toString(36)}`;
}




/**
 * 获取 asset/input下所有的json文件
 * @returns 
 */
function getJsonFiles() {
    let jsonFiles: string[] = []
    function findJsonFileFromDir(dirPath = join(__dirname, '../assets/input')) {
        let newPaths = readdirSync(dirPath);
        newPaths.forEach((newPath) => {
            let path = join(dirPath, newPath);
            let stat = statSync(path);
            if (stat.isDirectory()) {
                findJsonFileFromDir(path);
            }
            if (stat.isFile() && newPath.endsWith('.json')) {
                jsonFiles.push(path);
            }
        })
    }
    findJsonFileFromDir()
    return jsonFiles;
}


function main() {
    getJsonFiles().forEach(jsonFilePath => {

        // 解析得yapi接口信息
        let yapiApiData = require(jsonFilePath) as CategoryItem[];
        let outPutDir = join(__dirname, '../assets/output');

        yapiApiData.forEach(apiGroup => {
            let groupPath = join(outPutDir, apiGroup.name);

            // 生成文件夹目录
            mkdirSync(groupPath, {
                recursive: true
            })

            // 生成文件
            apiGroup.list.forEach((api, index) => {
                genContentAndWrite(api, groupPath, index)
            })
        })
    })
}

const isObject = (value: any) => Object.prototype.toString.call(value);
function genContentAndWrite(value: ApiItem, dirName: string, index: number) {
    if (!isObject(value)) return;
    let resultStr = '';// 最终输出内容
    let {
        req_body_other,
        res_body
    } = value;

    let reqObject, respObject

    // 部分接口可能返回的不是json
    try {
        reqObject = JSON.parse(req_body_other) as (PropertyArray | PropertyObject)
        if (!isObject(reqObject)) reqObject = null;

    } catch (error) { }

    try {
        respObject = JSON.parse(res_body) as (PropertyArray | PropertyObject)
        if (!isObject(reqObject)) respObject = null;
    } catch { }

    try {

        if (reqObject) {
            resultStr += `\n${getContent(reqObject, `ReqData_${unKnowLetIndex++}`, '请求实体')}`
        }

        if (respObject) {
            resultStr += `\n${getContent(respObject, `RespData_${unKnowLetIndex++}`, '返回实体')}`
        }


        writeFile(
            join(dirName || '', `${value.title ? value.title.replace('\/', '.') : 'index_' + index}.ts`),
            resultStr, (e) => {
                if (e) {
                    console.log(e)
                }
            })
    } catch (error) {
        console.log("????", error)
    }
}

/**
 * 生成注释
 * @param description 
 * @returns 
 */
function genMark(description: string) {
    return `\n\n\t/**\n\t * ${description || 'yapi暂无描述'}\n\t */`
}

/**
 * 格式化基础类型
 * @param type 
 * @returns 
 */
function formatBaseType(type?: string) {
    if (baseTypes.includes(type) && type !== INTEGER) return type;
    return 'number';
}


function getContent(item: Property, name: string, remark: string) {

    let interfaceDes = ''
    function innerFn(item: Property, name: string, remark: string) {

        if (typeof item !== 'object') {
            return interfaceDes += `export type ${name || getNewTypeName()} = ${item}`
        }

        let { type, description } = item;

        // OBJECT类型需要动态生成一个interface
        if (type == OBJECT) {
            let keyDes = '';
            let { properties, required } = (item as PropertyObject);
            let nameForNewInterface = name || getNewTypeName();

            if (!Array.isArray(required)) required = []
            // 记录properties item 属性
            Object.keys(properties).forEach(key => {

                let property = properties[key];

                // 基础类型
                if (baseTypes.includes(property.type)) {
                    keyDes += `${genMark(property.description)}\n\t${key}${key}${required?.includes(key) ? '' : '?'}: ${formatBaseType(property.type)};`;
                } else {
                    let nameForNextInterface = getNewTypeName();
                    keyDes += `${genMark(property.description)}\n\t${key}${required?.includes(key) ? '' : '?'}: ${nameForNextInterface};`;
                    innerFn(property, nameForNextInterface, property.description || `对象${key}的实体`);
                }
            })
            return interfaceDes += `\n\n/**\n * ${remark || ''}\n */\ninterface ${nameForNewInterface} {${keyDes}\n}\n`
        }

        if (type == ARRAY) {
            let keyDes = '';
            let { items } = (item as PropertyArray);
            let typeName = name || getNewTypeName()
            if (baseTypes.includes(items.type)) {
                keyDes = formatBaseType(items.type) || '未知'
            } else {
                let nameForNext = getNewTypeName();
                keyDes = nameForNext
                innerFn(items, nameForNext, items.description || `数组${name}的Item实体`)
            }

            return interfaceDes += `\n\n/**\n * ${description || 'yapi暂无描述'}\n */\ntype ${typeName}= ${keyDes}[]\n`
        }

        if (baseTypes.includes(item.type)) {
            return interfaceDes += `export type ${name || getNewTypeName()} = ${formatBaseType(item.type)}`
        }
    }

    try {
        innerFn(item, name, remark)
        return interfaceDes
    } catch (error) {
        console.log("genContent", error)
    }
}
main()
