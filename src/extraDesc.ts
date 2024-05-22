import fs from 'fs';
import path from 'path';
import cssData from './data/browsers.css-data.json';
import htmlData from './data/browsers.html-data.json';

const baseFolder = path.join(__dirname, './cache-prepare');
const outCssDataPath = path.join(baseFolder, 'browsers.css-data.json');
const outHtmlDataPath = path.join(baseFolder, 'browsers.html-data.json');

function extraCssData() {
    let jsonData: Record<string, string> = {};
    for (const key in cssData.atDirectives) {
        const value = cssData.atDirectives[key];
        if (value.description) {
            jsonData[`atDirectives.${key}.description`] = value.description;
        }
    }
    for (const key in cssData.pseudoClasses) {
        const value = cssData.pseudoClasses[key];
        if (value.description) {
            jsonData[`pseudoClasses.${key}.description`] = value.description;
        }
    }
    for (const key in cssData.pseudoElements) {
        const value = cssData.pseudoElements[key];
        if (value.description) {
            jsonData[`pseudoElements.${key}.description`] = value.description;
        }
    }
    for (const key in cssData.properties) {
        const value = cssData.properties[key];
        if (value.description) {
            jsonData[`properties.${key}.description`] = value.description;
        }
        if (value.values) {
            for (const innerKey in value.values) {
                const innerValue = value.values[innerKey];
                const description = (innerValue as { description?: string }).description;
                if (description) {
                    jsonData[`properties.${key}.values.${innerKey}.description`] = description;
                }
            }
        }
    }
    fs.writeFileSync(outCssDataPath, JSON.stringify(jsonData, null, 2));
}

function extraHtmlData() {
    let jsonData: Record<string, string> = {};
    for (const key in htmlData.tags) {
        const item = htmlData.tags[key];
        if (typeof item.description === 'string') {
            jsonData[`tags.${key}.description`] = item.description;
        } else if (typeof item.description === 'object') {
            const value = item.description.value;
            jsonData[`tags.${key}.description.value`] = value;
        }
        if (item.attributes) {
            for (const index in item.attributes) {
                const innerItem = item.attributes[index];
                if (typeof innerItem.description === 'string') {
                    jsonData[`tags.${key}.attributes.${index}.description`] = innerItem.description;
                } else if (typeof innerItem.description === 'object') {
                    const value = innerItem.description.value;
                    jsonData[`tags.${key}.attributes.${index}.description.value`] = value;
                }
            }
        }
    }
    for (const key in htmlData.globalAttributes) {
        const item = htmlData.globalAttributes[key];
        if (typeof item.description === 'object') {
            const value = item.description.value;
            jsonData[`globalAttributes.${key}.description.value`] = value;
        }
    }
    for (const key in htmlData.valueSets) {
        const item = htmlData.valueSets[key];
        if (item.values) {
            for (const index in item.values) {
                const innerItem = item.values[index] as { description?: { value: string } };
                if (typeof innerItem.description === 'object') {
                    const value = innerItem.description.value;
                    jsonData[`valueSets.${key}.values.${index}.description.value`] = value;
                }
            }
        }
    }
    fs.writeFileSync(outHtmlDataPath, JSON.stringify(jsonData, null, 2));
}

function main() {
    console.log('start');
    extraCssData();
    extraHtmlData();
    console.log('done');
}
main();
