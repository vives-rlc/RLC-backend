import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Timeslot } from '../shared/models/timeslot.entity'
import { TimeslotService } from './timeslots.service'
import { TimeslotsController } from './timeslots.controller'
import { StudentsModule } from '../students/students.module'
import { ReservationsModule } from '../reservations/reservations.module'
import { UsersModule } from '../users/users.module'
import { AuthModule } from '../auth/auth.module'
import { TeachersModule } from '../teachers/teachers.module'
import { LabsModule } from '../labs/labs.module'

@Module({
	imports:[TypeOrmModule.forFeature([Timeslot]),  
		forwardRef(() =>ReservationsModule), 
		forwardRef(() => AuthModule),
		forwardRef(() =>UsersModule),
		forwardRef(() => TeachersModule),
		forwardRef(() => LabsModule) ],
	providers:[TimeslotService],
	exports:[TimeslotService],
	controllers: [TimeslotsController]
})
export class TimeslotsModule {}
