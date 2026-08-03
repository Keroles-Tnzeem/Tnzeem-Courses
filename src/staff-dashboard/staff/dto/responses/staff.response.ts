import { UserTypeEnum } from '../../../../shared/user/enums/user-type.enum';
import { GenderEnum } from '../../../../shared/user/enums/gender.enum';

export class StaffResponse {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    gender?: GenderEnum;
    userType: UserTypeEnum;
    permissions: string[];

    static from(user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        gender?: GenderEnum;
        userType: UserTypeEnum;
        userPermissions?: { permission: { name: string } }[];
    }): StaffResponse {
        const res = new StaffResponse();
        res.id          = user.id;
        res.firstName   = user.firstName;
        res.lastName    = user.lastName;
        res.email       = user.email;
        res.phone       = user.phone;
        res.gender      = user.gender;
        res.userType    = user.userType;
        res.permissions = user.userPermissions?.map((up) => up.permission.name) ?? [];
        return res;
    }
}
