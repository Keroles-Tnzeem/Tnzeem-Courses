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
        { name: 'students.create', module: 'students', description: { en: 'Create Student', ar: 'إنشاء طالب' } },
        { name: 'students.update', module: 'students', description: { en: 'Update Student', ar: 'تحديث طالب' } },
        { name: 'students.delete', module: 'students', description: { en: 'Delete Student', ar: 'حذف طالب' } },
        { name: 'students.assign', module: 'students', description: { en: 'Assign Staff to Student', ar: 'إسناد موظف إلى طالب' } },
        { name: 'users.view', module: 'users', description: { en: 'View Staff', ar: 'عرض الموظفين' } },
        { name: 'users.create', module: 'users', description: { en: 'Create Staff', ar: 'إنشاء موظف' } },
        { name: 'users.update', module: 'users', description: { en: 'Update Staff', ar: 'تحديث موظف' } },
        { name: 'users.delete', module: 'users', description: { en: 'Delete Staff', ar: 'حذف موظف' } },
        { name: 'roles.view', module: 'roles', description: { en: 'View Roles/Permissions', ar: 'عرض الصلاحيات' } },
        { name: 'roles.manage', module: 'roles', description: { en: 'Manage Roles/Permissions', ar: 'إدارة الصلاحيات' } },
        { name: 'course-categories.view', module: 'course-categories', description: { en: 'View Course Categories', ar: 'عرض تصنيفات الدورات' } },
        { name: 'course-categories.create', module: 'course-categories', description: { en: 'Create Course Category', ar: 'إنشاء تصنيف دورة' } },
        { name: 'course-categories.update', module: 'course-categories', description: { en: 'Update Course Category', ar: 'تحديث تصنيف دورة' } },
        { name: 'course-categories.delete', module: 'course-categories', description: { en: 'Delete Course Category', ar: 'حذف تصنيف دورة' } },
        { name: 'sources.view', module: 'sources', description: { en: 'View Sources', ar: 'عرض المصادر' } },
        { name: 'sources.create', module: 'sources', description: { en: 'Create Source', ar: 'إنشاء مصدر' } },
        { name: 'sources.update', module: 'sources', description: { en: 'Update Source', ar: 'تحديث مصدر' } },
        { name: 'sources.delete', module: 'sources', description: { en: 'Delete Source', ar: 'حذف مصدر' } },
        { name: 'rounds.view', module: 'rounds', description: { en: 'View Rounds', ar: 'عرض الجولات' } },
        { name: 'rounds.create', module: 'rounds', description: { en: 'Create Round', ar: 'إنشاء جولة' } },
        { name: 'rounds.update', module: 'rounds', description: { en: 'Update Round', ar: 'تحديث جولة' } },
        { name: 'rounds.delete', module: 'rounds', description: { en: 'Delete Round', ar: 'حذف جولة' } },
        { name: 'round-sessions.view', module: 'round-sessions', description: { en: 'View Round Sessions', ar: 'عرض جلسات الجولة' } },
        { name: 'round-sessions.create', module: 'round-sessions', description: { en: 'Create Round Session', ar: 'إنشاء جلسة جولة' } },
        { name: 'round-sessions.update', module: 'round-sessions', description: { en: 'Update Round Session', ar: 'تحديث جلسة جولة' } },
        { name: 'round-sessions.delete', module: 'round-sessions', description: { en: 'Delete Round Session', ar: 'حذف جلسة جولة' } }
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
