import { UserTypeEnum } from '../../../../shared/user/enums/user-type.enum';

export class StaffResponse {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    userType: UserTypeEnum;
    permissions: string[];

    static from(user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        userType: UserTypeEnum;
        userPermissions?: { permission: { name: string } }[];
    }): StaffResponse {
        const res = new StaffResponse();
        res.id          = user.id;
        res.firstName   = user.firstName;
        res.lastName    = user.lastName;
        res.email       = user.email;
        res.userType    = user.userType;
        res.permissions = user.userPermissions?.map((up) => up.permission.name) ?? [];
        return res;
    }
}
