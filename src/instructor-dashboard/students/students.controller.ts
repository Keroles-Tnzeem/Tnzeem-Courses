import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InstructorStudentsService } from './students.service';
import { QueryStudentRequest } from './dto/requests/query-student.request';
import { PaginationResponseDto } from '../../common/dto/responses/pagination.response';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TrainerGuard } from '../../common/guards/trainer.guard';
import { Trainer } from '../../common/decorators/trainer.decorator';
import { Lang } from '../../common/decorators/lang.decorator';
import { JwtPayload } from '../../shared/auth/services/jwt.service';

@ApiTags('Instructor Dashboard / Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TrainerGuard)
@Controller('instructor-dashboard/students')
export class InstructorStudentsController {
  constructor(private readonly studentsService: InstructorStudentsService) {}

  @Get()
  @ApiOperation({ summary: 'List students through their orders' })
  @ApiResponse({ status: 200, type: PaginationResponseDto })
  async findAll(
    @Trainer() trainer: JwtPayload,
    @Query() query: QueryStudentRequest,
    @Lang() lang: string,
  ) {
    return this.studentsService.findAll(trainer.sub, query, lang);
  }
}
