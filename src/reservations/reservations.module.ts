import { forwardRef, Module } from '@nestjs/common'
import { ReservationsService } from './reservations.service'
import { ReservationsController } from './reservations.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Reservation } from '../shared/models/reservation.entity'
import { StudentsModule } from '../students/students.module'
import { TimeslotsModule } from '../timeslots/timeslots.module'

@Module({
	imports:[TypeOrmModule.forFeature([Reservation]), forwardRef(() =>TimeslotsModule),forwardRef(() => StudentsModule)],
	controllers: [ReservationsController],
	providers: [ReservationsService],
	exports:[ReservationsService]
})
export class ReservationsModule {}
