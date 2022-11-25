import { forwardRef, Module } from '@nestjs/common'
import { StudentsService } from './students.service'
import { StudentsController } from './students.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Student } from '../shared/models/student.entity'
import { Course } from '../shared/models/course.entity'
import { ReservationsModule } from '../reservations/reservations.module'
import { UsersModule } from '../users/users.module'
import { TeachersModule } from '../teachers/teachers.module'
import { CoursesModule } from '../courses/courses.module'

@Module({
	imports:[TypeOrmModule.forFeature([Student, Course]), forwardRef(() => TeachersModule), forwardRef(() => ReservationsModule), forwardRef(() => UsersModule), forwardRef(() => CoursesModule)],
	controllers: [StudentsController],
	providers: [StudentsService],
	exports:[StudentsService]
})
export class StudentsModule {}
