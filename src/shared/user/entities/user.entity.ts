import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserTypeEnum } from '../enums/user-type.enum';
import { UserPermissionEntity } from './user-permission.entity';
import {AuditColumns} from "../../../common/entities/audit-columns";

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'first_name' })
    firstName: string;

    @Column({ name: 'last_name' })
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Exclude()
    @Column()
    password: string; // stored hashed (bcrypt)

    @Column({ name:'user_type', type: 'enum', enum: UserTypeEnum })
    userType: UserTypeEnum;

    @OneToMany(() => UserPermissionEntity, (up) => up.user, { cascade: true, eager: true })
    userPermissions?: UserPermissionEntity[];

    @Column(() => AuditColumns, { prefix: false })
    audit: AuditColumns;
}