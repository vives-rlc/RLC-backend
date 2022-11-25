import { forwardRef, Module } from '@nestjs/common'
import { LabsService } from './labs.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Lab } from '../shared/models/lab.entity'
import { LabController } from './labs.controller'
import { Connection } from '../shared/models/connection.entity'
import { Timeslot } from '../shared/models/timeslot.entity'
import { TimeslotService } from '../timeslots/timeslots.service'
import { CoursesModule } from '../courses/courses.module'
import { UsersModule } from '../users/users.module'
import { ReservationsModule } from '../reservations/reservations.module'
import { TeachersModule } from '../teachers/teachers.module'


@Module({
	imports: [TypeOrmModule.forFeature([Lab, Connection, Timeslot]), forwardRef(() =>CoursesModule), forwardRef(() => UsersModule), forwardRef(() =>ReservationsModule), 
	 forwardRef(() => TeachersModule)],
	controllers: [LabController],
	providers: [LabsService, TimeslotService],
	exports: [LabsService],
})
export class LabsModule {}