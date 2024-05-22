import fs from 'fs';
import path from 'path';
// import data from './cache-translated/css-data.json';
import { readFilesInDirectory } from './utils/readFilesInDirectory';
import baseData from './data/browsers.css-data.json';

async function main() {
    console.log('start');
    const reg = /css-data-chunk-(\d+)\.json/;
    const fileList = await (await readFilesInDirectory(path.join(__dirname, './cache-translated'))).filter(i => reg.test(i));

    for (const file of fileList) {
        const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
        for (const key in data) {
            const item = (data as Record<string, string>)[key];
            const keys = key.split('.');
            keys.reduce((map, key, index) => {
                if (index === keys.length - 1) {
                    (map as any)[key] = item;
                }
                return (map as any)[key];
            }, baseData);
        }
     }
    fs.writeFileSync(
        path.join(__dirname, '../data/css-data.json'),
        JSON.stringify(baseData, null, 2),
    );
    console.log('done');
}

main();
