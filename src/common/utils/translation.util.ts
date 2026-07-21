export function getTranslatedString(data: any, lang: string = 'en'): string {
    const shortLang = lang.split('-')[0];
    
    let obj = data;
    
    while (typeof obj === 'string') {
        try { 
            const parsed = JSON.parse(obj);
            if (typeof parsed !== 'object' || parsed === null) {
                break;
            }
            obj = parsed;
        } catch (e) { 
            break; 
        }
    }

    if (obj && typeof obj === 'object') {
        return obj[shortLang] ?? obj['en'] ?? obj['ar'] ?? '';
    }
    
    return '';
}
