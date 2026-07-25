import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PermissionsService } from './permissions.service';
import { PermissionResponse } from './dto/responses/permission.response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Lang } from '../../common/decorators/lang.decorator';
import { ApiResponseDto } from '../../common/dto/responses/api.response';
import { PaginationResponseDto } from '../../common/dto/responses/pagination.response';
import { PaginationRequest } from '../../common/dto/requests/pagination.request';

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
    async findAll(@Lang() lang: string, @Query() query: PaginationRequest) {
        const { data, total } = await this.permissionsService.findAll(query);
        const limit = query.limit || 10;
        const page = query.page || 1;

        return PaginationResponseDto.success(
            data.map(p => PermissionResponse.from(p, lang)),
            total,
            page,
            limit,
            this.i18n.t('common.success', { lang }),
        );
    }
}
