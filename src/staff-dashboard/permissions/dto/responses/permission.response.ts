import { getTranslatedString } from '../../../../common/utils/translation.util';

export class PermissionResponse {
    id: number;
    name: string;
    module: string;
    description: string;

    static from(
        p: { id: number; name: string; module: string; description?: any },
        lang: string = 'en',
    ): PermissionResponse {
        const res = new PermissionResponse();
        res.id          = p.id;
        res.name        = p.name;
        res.module      = p.module;
        res.description = getTranslatedString(p.description, lang);

        return res;
    }
}
