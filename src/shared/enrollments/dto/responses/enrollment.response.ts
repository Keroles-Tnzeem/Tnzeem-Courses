import { ApiProperty } from '@nestjs/swagger';
import { EnrollmentEntity } from '../../entities/enrollment.entity';
import { EnrollmentStatusEnum } from '../../enums/enrollment-status.enum';

class StudentNestedResponse {
    @ApiProperty({ example: 1 })
    id: number;
    @ApiProperty({ example: 'John' })
    firstName: string;
    @ApiProperty({ example: 'Doe' })
    lastName: string;
    @ApiProperty({ example: '+966501234567' })
    phone: string;
}

class RoundNestedResponse {
    @ApiProperty({ example: 5 })
    id: number;
    @ApiProperty({ example: 2 })
    roundNumber: number;
    @ApiProperty({ example: '2025-01-15T00:00:00Z' })
    startDate: Date;
}

export class EnrollmentResponse {
    @ApiProperty({ example: '01J4ZB4XYZQWERYT1234567890' })
    id: string;

    @ApiProperty({ example: 1 })
    studentId: number;

    @ApiProperty({ example: 5 })
    roundId: number;

    @ApiProperty({ example: '01J4ZB4XYZQWERYT1234567891', required: false })
    orderId?: string;

    @ApiProperty({ enum: EnrollmentStatusEnum, example: EnrollmentStatusEnum.ACTIVE })
    status: EnrollmentStatusEnum;

    @ApiProperty({ example: 'CERT-A1B2C3D4E5', required: false })
    certificateSerialNum?: string;

    @ApiProperty({ example: '2024-08-11T12:00:00Z' })
    createdAt: Date;

    @ApiProperty({ example: '2024-08-11T12:00:00Z' })
    updatedAt: Date;

    // Nested relations
    @ApiProperty({ type: StudentNestedResponse, required: false })
    student?: StudentNestedResponse;

    @ApiProperty({ type: RoundNestedResponse, required: false })
    round?: RoundNestedResponse;

    static from(enrollment: EnrollmentEntity): EnrollmentResponse {
        const response = new EnrollmentResponse();

        response.id = enrollment.id;
        response.studentId = enrollment.studentId;
        response.roundId = enrollment.roundId;
        response.orderId = enrollment.orderId;
        response.status = enrollment.status;
        response.certificateSerialNum = enrollment.certificateSerialNum;
        response.createdAt = enrollment.audit?.createdAt;
        response.updatedAt = enrollment.audit?.updatedAt;

        if (enrollment.student) {
            response.student = {
                id: enrollment.student.id,
                firstName: enrollment.student.firstName,
                lastName: enrollment.student.lastName,
                phone: enrollment.student.phone,
            };
        }

        if (enrollment.round) {
            response.round = {
                id: enrollment.round.id,
                roundNumber: enrollment.round.roundNumber,
                startDate: enrollment.round.startDate,
            };
        }

        return response;
    }
}
