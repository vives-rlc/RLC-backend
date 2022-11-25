import { Module } from '@nestjs/common'
import { TimeslotsModule } from 'src/timeslots/timeslots.module'
import { CoursesModule } from '../../courses/courses.module'
import { ReservationsModule } from '../../reservations/reservations.module'
import { StudentsModule } from '../../students/students.module'
import { TeachersModule } from '../../teachers/teachers.module'
import { UsersModule } from '../../users/users.module'
import { Seeder } from './seeder.service'

/**
 * Import and provide seeder classes.
 *
 * @module
 */
@Module({
	imports: [UsersModule, TeachersModule, StudentsModule, CoursesModule, ReservationsModule, TimeslotsModule],
	providers: [Seeder],
	exports:[Seeder]
})
export class SeederModule {}