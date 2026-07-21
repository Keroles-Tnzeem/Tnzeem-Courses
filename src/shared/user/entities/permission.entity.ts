import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('permissions')
export class PermissionEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;   // e.g. 'leads.assign', 'courses.create', 'users.manage'

    @Column()
    module: string; // 'leads' | 'courses' | 'trainers' | 'students' | 'users' | 'roles'

    @Column({ type: 'json', nullable: true })
    description: { en: string; ar: string };
}
