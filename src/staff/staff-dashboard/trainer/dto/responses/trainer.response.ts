import { UserEntity } from '../../../../../shared/user/entities/user.entity';
import { GenderEnum } from '../../../../../shared/user/enums/gender.enum';
import { buildUserImageUrl } from '../../../../../common/utils/user-image.util';

export class TrainerResponse {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    gender?: GenderEnum;
    img: string;
    age?: number;
    numExperience?: number;
    experience?: string;
    numCourses?: number;

    static from(user: UserEntity): TrainerResponse {
        const response = new TrainerResponse();
        response.id = user.id;
        response.firstName = user.firstName;
        response.lastName = user.lastName;
        response.email = user.email;
        response.phone = user.phone;
        response.gender = user.gender;
        response.img = buildUserImageUrl(user.img);

        if (user.trainerInfo) {
            response.age = user.trainerInfo.age;
            response.numExperience = user.trainerInfo.numExperience;
            response.experience = user.trainerInfo.experience;
            response.numCourses = user.trainerInfo.numCourses;
        }
        return response;
    }
}
