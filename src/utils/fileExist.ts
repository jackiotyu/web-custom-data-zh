import fs from 'fs/promises';

export async function fileExist(filepath: string) {
    try {
        const exist = (await fs.stat(filepath)).isFile();
        return exist;
    } catch {
        return false;
    }
}