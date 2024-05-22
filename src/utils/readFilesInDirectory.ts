import { promises as fs } from 'fs';
import * as path from 'path';

export async function readFilesInDirectory(dir: string): Promise<string[]> {
    const files: string[] = [];
    const list = await fs.readdir(dir, { withFileTypes: true });
    for (const file of list) {
        const filePath = path.join(dir, file.name);
        if (file.isFile()) {
            files.push(filePath);
        }
    }
    return files;
}