export function parseJson <T = Record<string, any>>(value: unknown):T {
    if(value == null) {
        return {} as T
    }

    if(typeof value === 'object') {
        return value as T;
    }

    try {
        return JSON.parse(value as string) as T;
    } catch {
        return {} as T;
    }
}