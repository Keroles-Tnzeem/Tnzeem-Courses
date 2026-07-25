import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    OneToMany,
    OneToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserTypeEnum } from '../enums/user-type.enum';
import { GenderEnum } from '../enums/gender.enum';
import { UserPermissionEntity } from './user-permission.entity';
import { TrainerInfoEntity } from './trainer-info.entity';
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

    @Column({ nullable: true })
    phone: string;

    @Column({ type: 'enum', enum: GenderEnum, nullable: true })
    gender: GenderEnum;

    @Column({ type: 'text', nullable: true })
    img: string;

    @Exclude()
    @Column()
    password: string; // stored hashed (bcrypt)

    @Column({ name:'user_type', type: 'enum', enum: UserTypeEnum })
    userType: UserTypeEnum;

    @OneToMany(() => UserPermissionEntity, (up) => up.user, { cascade: true, eager: true })
    userPermissions?: UserPermissionEntity[];

    @OneToOne(() => TrainerInfoEntity, trainerInfo => trainerInfo.user, { cascade: true })
    trainerInfo?: TrainerInfoEntity;

    @Column(() => AuditColumns, { prefix: false })
    audit: AuditColumns;
}