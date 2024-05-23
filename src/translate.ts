import translator from './pptr';
import path from 'path';
import fs from 'fs/promises';
import { AsyncQueue } from './utils/asyncQueue';
import { parseJson } from './utils/parseJson';
import { readFilesInDirectory } from './utils/readFilesInDirectory';
import { fileExist } from './utils/fileExist';

const queue = new AsyncQueue(5);
const cache = {};

async function translate(jsonStr: string) {
    const { close, send } = await translator.createChat(`你是一个专业的前端专家，现在帮我把一份英文css属性描述的json文档翻译成中文，不需要改变json的key，key保持原样。只需要翻译后的内容`);
    try {
        const str = await send(JSON.stringify(jsonStr));
        close();
        return str;
    } catch (error) {
        console.log(error);
        return '';
    } finally {
        close();
    }
}

async function addTask(filepath: string) {
    queue.enqueue(async () => {
        const outFilepath = path.join(__dirname, `./cache-translated/${path.basename(filepath)}`);
        const exist = await fileExist(outFilepath);
        if (exist) {
            console.log('文件已存在,跳过', outFilepath);
            return;
        }
        const jsonStr = await fs.readFile(filepath, 'utf-8');
        if (!jsonStr) return addTask(filepath);
        console.log('读取', filepath, jsonStr.length);
        const res = await translate(jsonStr);
        const jsonData = parseJson(res);
        if (!jsonData) return;
        Object.assign(cache, jsonData);
        console.log('写入', outFilepath);
        fs.writeFile(outFilepath, JSON.stringify(jsonData, null, 2));
    });
}

async function main() {
    console.log('start');
    const jsonFileList = await readFilesInDirectory(path.join(__dirname, './cache-prepare/chunk'));
    if (!jsonFileList) {
        console.log('没有数据');
        return;
    }
    await Promise.all(jsonFileList.map((filepath) => addTask(filepath)));
    await new Promise(r => queue.onIdle(r));
    fs.writeFile(path.join(__dirname, `./cache-translated/css-data.json`), JSON.stringify(cache, null, 2));
    console.log('end');
}
main();
