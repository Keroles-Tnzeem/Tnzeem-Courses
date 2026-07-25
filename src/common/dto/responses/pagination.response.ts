export class PaginationResponseDto<T> {
    success: boolean;
    message?: string;
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    
    constructor(success: boolean, data: T[], total: number, page: number, limit: number, message?: string) {
        this.success = success;
        this.data = data;
        this.message = message;
        this.meta = {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    static success<T>(data: T[], total: number, page: number, limit: number, message?: string): PaginationResponseDto<T> {
        return new PaginationResponseDto<T>(true, data, total, page, limit, message);
    }
}
