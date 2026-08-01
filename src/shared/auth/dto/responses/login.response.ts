import {UserDataResponse} from "../../../user/dto/responses/user-data.response";

export class LoginResponse{
    accessToken: string;
    refreshToken: string;
    expireIn: number;
    url?: string;
    user: UserDataResponse
}