import { registerAs } from '@nestjs/config';

export default registerAs('i18n', () => ({
    fallbackLanguage: 'en',
    formatter: 'i18n-message-format',
}));
