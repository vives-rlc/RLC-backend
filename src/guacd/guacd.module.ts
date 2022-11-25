import { Module } from '@nestjs/common'
import { ReservationsModule } from '../reservations/reservations.module'
import { TimeslotsModule } from '../timeslots/timeslots.module'
import { GuacdController } from './guacd.controller'
import { GuacdService } from './guacd.service'

@Module({
	imports:[ReservationsModule, TimeslotsModule],
	controllers:[GuacdController],
	providers:[GuacdService]

})
export class GuacdModule {}
