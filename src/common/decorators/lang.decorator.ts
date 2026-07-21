import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

export const Lang = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        
        // Prioritize x-lang header, then fallback to i18n context or default 'en'
        const rawLang = (request.headers['x-lang'] as string) || I18nContext.current()?.lang || 'en';
        
        // If multiple languages are sent (e.g., 'en, ar'), only take the first one
        const lang = rawLang.split(',')[0].trim();
        
        return lang;
    },
);
