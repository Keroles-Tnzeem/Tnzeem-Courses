import { Transform } from 'class-transformer';
import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

@ValidatorConstraint({ name: 'isSaudiPhoneNumber', async: false })
export class IsSaudiPhoneNumberConstraint implements ValidatorConstraintInterface {
    validate(value: string) {
        if (typeof value !== 'string') return false;
        return /^0?5\d{8}$/.test(value);
    }

    defaultMessage(validationArguments?: any): string {
        return i18nValidationMessage('validation.INVALID_SAUDI_PHONE')(validationArguments);
    }
}

export function IsSaudiPhoneNumber(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        // Store one canonical form (no leading 0) so 05xxxxxxxx and 5xxxxxxxx are the same user.
        Transform(({ value }) => (typeof value === 'string' ? normalizeSaudiPhone(value.trim()) : value))(object, propertyName);

        registerDecorator({
            target: object.constructor,
            propertyName,
            options: {
                message: i18nValidationMessage('validation.INVALID_SAUDI_PHONE'),
                ...validationOptions,
            },
            constraints: [],
            validator: IsSaudiPhoneNumberConstraint,
        });
    };
}

export function normalizeSaudiPhone(phone: string): string {
    return phone.startsWith('0') ? phone.slice(1) : phone;
}