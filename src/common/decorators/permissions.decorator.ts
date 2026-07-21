import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to declare required permissions on a controller or route handler.
 *
 * Usage:
 *   @Permissions('leads.view', 'leads.assign')
 *   @UseGuards(JwtAuthGuard, PermissionsGuard)
 *   findAll() { ... }
 */
export const Permissions = (...permissions: string[]) =>
    SetMetadata(PERMISSIONS_KEY, permissions);
