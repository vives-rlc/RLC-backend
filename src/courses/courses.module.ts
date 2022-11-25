import { forwardRef, Module } from '@nestjs/common'
import { CoursesService } from './courses.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Course } from '../shared/models/course.entity'
import { CourseController } from './courses.controller'
import { FileModule } from '../shared/files.module'
import { StudentsModule } from '../students/students.module'
import { UsersModule } from '../users/users.module'
import { TeachersModule } from '../teachers/teachers.module'
import { ReservationsModule } from '../reservations/reservations.module'
import { MailService } from '../mailer/mail.service'
import { AuthModule } from '../auth/auth.module'

@Module({
	imports: [TypeOrmModule.forFeature([Course]), forwardRef(() => StudentsModule), forwardRef(() => TeachersModule), FileModule, 
		forwardRef(() =>UsersModule), forwardRef(() => ReservationsModule), AuthModule],
	controllers: [CourseController],
	providers: [CoursesService, MailService],
	exports: [CoursesService],
})
export class CoursesModule {}