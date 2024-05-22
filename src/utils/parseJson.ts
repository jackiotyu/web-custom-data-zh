const jsonReg = /{[^]*}/;

export function parseJson(text: string) {
    if (!text) return null;
    const match = text.match(jsonReg);
    if (match) {
        const jsonStr = match[0];
        try {
            const jsonObj = JSON.parse(jsonStr);
            return jsonObj;
        } catch (e) {
            console.error('Invalid JSON:', e);
            return null;
        }
    } else {
        console.log('No JSON found');
        return null;
    }
}
