import {UserTypeEnum} from "../../enums/user-type.enum";
import {RoleResponse} from "./role.response";
import {TrainerProfileResponse} from "./trainer-profile.response";
import {StudentProfileResponse} from "./student-profile.response";

export class UserDataResponse {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    img: string;
    userType: UserTypeEnum;

    permissions?: string[];

    // only present for userType === 'trainer'
    trainerProfile?: TrainerProfileResponse;

    // only present for userType === 'student'
    studentProfile?: StudentProfileResponse;
}