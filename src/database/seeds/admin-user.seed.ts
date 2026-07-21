import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../shared/user/entities/user.entity';
import { UserTypeEnum } from '../../shared/user/enums/user-type.enum';
import { PermissionEntity } from '../../shared/user/entities/permission.entity';
import { UserPermissionEntity } from '../../shared/user/entities/user-permission.entity';

export const seedAdminUserAndPermissions = async (dataSource: DataSource) => {
    const userRepository = dataSource.getRepository(UserEntity);
    const permissionRepository = dataSource.getRepository(PermissionEntity);
    const userPermissionRepository = dataSource.getRepository(UserPermissionEntity);

    console.log('Seeding Permissions...');

    const defaultPermissions = [
        { name: 'leads.view', module: 'leads', description: { en: 'View Leads', ar: 'عرض العملاء المحتملين' } },
        { name: 'leads.assign', module: 'leads', description: { en: 'Assign Leads', ar: 'إسناد العملاء المحتملين' } },
        { name: 'leads.update_status', module: 'leads', description: { en: 'Update Lead Status', ar: 'تحديث حالة العميل المحتمل' } },
        { name: 'courses.view', module: 'courses', description: { en: 'View Courses', ar: 'عرض الدورات' } },
        { name: 'courses.create', module: 'courses', description: { en: 'Create Course', ar: 'إنشاء دورة' } },
        { name: 'courses.update', module: 'courses', description: { en: 'Update Course', ar: 'تحديث دورة' } },
        { name: 'courses.delete', module: 'courses', description: { en: 'Delete Course', ar: 'حذف دورة' } },
        { name: 'trainers.view', module: 'trainers', description: { en: 'View Trainers', ar: 'عرض المدربين' } },
        { name: 'trainers.create', module: 'trainers', description: { en: 'Create Trainer', ar: 'إنشاء مدرب' } },
        { name: 'trainers.update', module: 'trainers', description: { en: 'Update Trainer', ar: 'تحديث مدرب' } },
        { name: 'trainers.delete', module: 'trainers', description: { en: 'Delete Trainer', ar: 'حذف مدرب' } },
        { name: 'students.view', module: 'students', description: { en: 'View Students', ar: 'عرض الطلاب' } },
        { name: 'students.update', module: 'students', description: { en: 'Update Student', ar: 'تحديث طالب' } },
        { name: 'users.view', module: 'users', description: { en: 'View Staff', ar: 'عرض الموظفين' } },
        { name: 'users.create', module: 'users', description: { en: 'Create Staff', ar: 'إنشاء موظف' } },
        { name: 'users.update', module: 'users', description: { en: 'Update Staff', ar: 'تحديث موظف' } },
        { name: 'users.delete', module: 'users', description: { en: 'Delete Staff', ar: 'حذف موظف' } },
        { name: 'roles.view', module: 'roles', description: { en: 'View Roles/Permissions', ar: 'عرض الصلاحيات' } },
        { name: 'roles.manage', module: 'roles', description: { en: 'Manage Roles/Permissions', ar: 'إدارة الصلاحيات' } }
    ];

    const savedPermissions: PermissionEntity[] = [];

    for (const permData of defaultPermissions) {
        let perm = await permissionRepository.findOne({ where: { name: permData.name } });
        if (!perm) {
            perm = permissionRepository.create(permData);
            await permissionRepository.save(perm);
        } else {
            // Update existing permissions with description
            perm.description = permData.description;
            await permissionRepository.save(perm);
        }
        savedPermissions.push(perm);
    }

    console.log('Seeding Admin User...');

    let admin = await userRepository.findOne({ where: { email: 'admin@tnzeem.com' } });
    if (!admin) {
        admin = userRepository.create({
            firstName: 'Super',
            lastName: 'Admin',
            email: 'admin@tnzeem.com',
            password: await bcrypt.hash('admin123', 10),
            userType: UserTypeEnum.ADMIN
        });
        await userRepository.save(admin);
    }

    console.log('Attaching Permissions to Admin...');

    for (const perm of savedPermissions) {
        const existingRelation = await userPermissionRepository.findOne({
            where: { user: { id: admin.id }, permission: { id: perm.id } }
        });

        if (!existingRelation) {
            const relation = userPermissionRepository.create({
                user: admin,
                permission: perm
            });
            await userPermissionRepository.save(relation);
        }
    }

    console.log('Seeding Complete!');
};
