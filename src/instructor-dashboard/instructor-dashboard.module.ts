import { Module } from '@nestjs/common';
import { InstructorCoursesModule } from './courses/courses.module';
import { InstructorRoundsModule } from './rounds/rounds.module';
import { InstructorSessionsModule } from './sessions/sessions.module';
import { InstructorEnrollmentsModule } from './enrollments/enrollments.module';
import { InstructorMenuModule } from './menu/menu.module';
import { InstructorStudentsModule } from './students/students.module';

@Module({
  imports: [
    InstructorCoursesModule,
    InstructorRoundsModule,
    InstructorSessionsModule,
    InstructorEnrollmentsModule,
    InstructorMenuModule,
    InstructorStudentsModule,
  ],
})
export class InstructorDashboardModule {}
