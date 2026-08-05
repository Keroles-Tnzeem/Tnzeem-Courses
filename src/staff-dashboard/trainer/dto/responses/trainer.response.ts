import { UserEntity } from '../../../../shared/user/entities/user.entity';
import { GenderEnum } from '../../../../shared/user/enums/gender.enum';

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
        const appUrl = process.env.APP_URL || 'http://localhost:3000';
        const imgPath = user.img || '/images/empty-user.jpeg';
        response.img = imgPath.startsWith('http') ? imgPath : `${appUrl}${imgPath}`;

        if (user.trainerInfo) {
            response.age = user.trainerInfo.age;
            response.numExperience = user.trainerInfo.numExperience;
            response.experience = user.trainerInfo.experience;
            response.numCourses = user.trainerInfo.numCourses;
        }
        return response;
    }
}
