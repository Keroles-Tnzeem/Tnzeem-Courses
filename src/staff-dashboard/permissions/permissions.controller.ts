import { Controller, Get, UseGuards } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PermissionsService } from './permissions.service';
import { PermissionResponse } from './dto/responses/permission.response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Lang } from '../../common/decorators/lang.decorator';
import { ApiResponseDto } from '../../common/dto/responses/api.response';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('staff-dashboard/permissions')
export class PermissionsController {
    constructor(
        private readonly permissionsService: PermissionsService,
        private readonly i18n: I18nService,
    ) { }

    // GET /staff-dashboard/permissions
    @Permissions('roles.view')
    @Get()
    async findAll(@Lang() lang: string) {
        const data = await this.permissionsService.findAll();

        return ApiResponseDto.success(
            data.map(p => PermissionResponse.from(p, lang)),
            this.i18n.t('common.success', { lang }),
        );
    }
}
