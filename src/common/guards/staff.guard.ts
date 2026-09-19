import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { JwtPayload } from '../../shared/auth/services/jwt.service';
import { UserTypeEnum } from '../../shared/user/enums/user-type.enum';

const STAFF_TYPES: UserTypeEnum[] = [
  UserTypeEnum.ADMIN,
  UserTypeEnum.SALES,
  UserTypeEnum.SUPPORT,
];

/**
 * Guard to ensure the authenticated user is a staff member (admin / sales / support).
 * Usage:
 *   @UseGuards(JwtAuthGuard, StaffGuard)
 */
@Injectable()
export class StaffGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest<{ user: JwtPayload }>().user;

    if (!user || !STAFF_TYPES.includes(user.userType)) {
      const i18n = I18nContext.current();
      const message = i18n
        ? i18n.t('errors.ONLY_STAFF')
        : 'Only staff can perform this action';
      throw new ForbiddenException(message);
    }

    return true;
  }
}
