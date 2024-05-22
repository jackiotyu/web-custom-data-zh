import fs from 'fs';
import path from 'path';

const inputFile = path.join(__dirname, './cache-prepare/browsers.css-data.json');
const outputDir = path.join(__dirname, './cache-prepare/chunk');
const MAX_LENGTH = 500;

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

fs.readFile(inputFile, 'utf8', (err, data) => {
    if (err) {
        console.error('读取文件失败:', err);
        return;
    }
    let jsonObject: { [key: string]: any };
    try {
        jsonObject = JSON.parse(data);
    } catch (parseError) {
        console.error('解析JSON失败:', parseError);
        return;
    }
    const entries = Object.entries(jsonObject);
    let currentLength = 0;
    let currentChunk: { [key: string]: any } = {};
    let chunkIndex = 1;

    const saveChunk = (chunk: { [key: string]: any }) => {
        const filePath = path.join(outputDir, `css-data-chunk-${chunkIndex}.json`);
        fs.writeFile(filePath, JSON.stringify(chunk, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('写入文件失败:', writeErr);
            } else {
                console.log(`成功写入文件: ${filePath}`);
            }
        });
    };
    for (const [key, value] of entries) {
        const entryLength = JSON.stringify({ [key]: value }).length;
        if (currentLength + entryLength > MAX_LENGTH) {
            saveChunk(currentChunk);
            currentChunk = {};
            currentLength = 0;
            chunkIndex++;
        }
        currentChunk[key] = value;
        currentLength += entryLength;
    }
    if (Object.keys(currentChunk).length > 0) {
        saveChunk(currentChunk);
    }
});
