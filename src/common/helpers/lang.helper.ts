import { I18nContext } from 'nestjs-i18n';

export function getLang(): string {
    return I18nContext.current()?.lang ?? 'en';
}

/** Translate outside of services that inject I18nService (guards, strategies). Falls back to `fallback` when no request context exists. */
export function translate(key: string, fallback: string): string {
    const i18n = I18nContext.current();
    return i18n ? i18n.t(key) : fallback;
}
