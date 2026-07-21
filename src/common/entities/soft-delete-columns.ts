import {DeleteDateColumn} from "typeorm";

export class SoftDeleteColumns {
    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;
}