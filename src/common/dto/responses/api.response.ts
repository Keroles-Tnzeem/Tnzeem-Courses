export class ApiResponseDto<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: any;
    
    constructor(success: boolean, message?: string, data?: T, error?: any) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.error = error;
    }

    static success<T>(data: T, message?: string): ApiResponseDto<T> {
        return new ApiResponseDto<T>(true, message, data);
    }

    static fail<T>(error: any, message?: string): ApiResponseDto<T> {
        return new ApiResponseDto<T>(false, message, undefined, error);
    }
}
