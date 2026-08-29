import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { JwtPayload } from '../../shared/auth/services/jwt.service';
import { UserTypeEnum } from '../../shared/user/enums/user-type.enum';

/**
 * Guard to ensure the user is an instructor (TRAINER).
 * Usage:
 *   @UseGuards(JwtAuthGuard, TrainerGuard)
 */
@Injectable()
export class TrainerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest<{ user: JwtPayload }>().user;

    if (!user || user.userType !== UserTypeEnum.TRAINER) {
      const i18n = I18nContext.current();
      const message = i18n
        ? i18n.t('errors.ONLY_INSTRUCTORS')
        : 'Only instructors can perform this action';
      throw new ForbiddenException(message);
    }

    return true;
  }
}
