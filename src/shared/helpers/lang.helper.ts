import { I18nContext } from 'nestjs-i18n';

export function getLang(): string {
    return I18nContext.current()?.lang ?? 'en';
}
