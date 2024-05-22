import fs from 'fs';
import path from 'path';
import cssData from '@vscode/web-custom-data/data/browsers.css-data.json';
import htmlData from '@vscode/web-custom-data/data/browsers.html-data.json';

function main() {
    const baseFolder = path.join(__dirname, './data');
    fs.writeFileSync(path.join(baseFolder, 'browsers.css-data.json'), JSON.stringify(cssData, null, 4));
    fs.writeFileSync(path.join(baseFolder, 'browsers.html-data.json'), JSON.stringify(htmlData, null, 4));
}

main();