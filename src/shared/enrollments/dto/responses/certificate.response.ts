import { ApiProperty } from '@nestjs/swagger';
import { EnrollmentEntity } from '../../entities/enrollment.entity';
import { parseJson } from '../../../../common/helpers/parse-json.helper';

class CertificateStudentResponse {
    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;
}

class CertificateRoundResponse {
    @ApiProperty()
    roundNumber: number;

    @ApiProperty()
    startDate: Date;

    @ApiProperty()
    endDate: Date;
}

class CertificateTrainerResponse {
    @ApiProperty({ required: false })
    firstName?: string;

    @ApiProperty({ required: false })
    lastName?: string;
}

class CertificateCourseResponse {
    @ApiProperty()
    name: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    level: string;

    @ApiProperty()
    durationHours: number;

    @ApiProperty()
    certificateLink: string;
}

export class CertificateResponse {
    @ApiProperty({ type: CertificateStudentResponse })
    student: CertificateStudentResponse;

    @ApiProperty({ type: CertificateRoundResponse })
    round: CertificateRoundResponse;

    @ApiProperty({ type: CertificateTrainerResponse })
    trainer: CertificateTrainerResponse;

    @ApiProperty({ type: CertificateCourseResponse })
    course: CertificateCourseResponse;

    static fromEntity(entity: EnrollmentEntity, appUrl: string, lang = 'en'): CertificateResponse {
        const response = new CertificateResponse();

        if (entity.student) {
            response.student = {
                firstName: entity.student.firstName,
                lastName: entity.student.lastName,
            };
        }

        if (entity.round) {
            response.round = {
                roundNumber: entity.round.roundNumber,
                startDate: entity.round.startDate,
                endDate: entity.round.endDate,
            };

            const course = entity.round.course;
            if (course) {
                response.trainer = {
                    firstName: course.trainer?.firstName,
                    lastName: course.trainer?.lastName,
                };

                const nameObj = parseJson<Record<string, string>>(course.name as any) || course.name || {};
                const descObj = parseJson<Record<string, string>>(course.description as any) || course.description || {};

                response.course = {
                    name: nameObj[lang] ?? nameObj['en'] ?? course.name,
                    description: descObj[lang] ?? descObj['en'] ?? course.description,
                    level: course.level,
                    durationHours: course.durationHours,
                    certificateLink: `${appUrl}/public/templates/certificate.html`,
                };
            }
        }

        return response;
    }
}
