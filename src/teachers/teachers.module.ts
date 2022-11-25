import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ReservationsModule } from '../reservations/reservations.module'
import { TimeslotsModule } from '../timeslots/timeslots.module'
import { UsersModule } from '../users/users.module'
import { Teacher } from '../shared/models/teacher.entity'
import { TeachersController } from './teachers.controller'
import { TeachersService } from './teachers.service'

@Module({//forward ref to avoid circular dependency issues with usersmodule and teachers module
	imports:[TypeOrmModule.forFeature([Teacher]), 
		forwardRef(() =>UsersModule), 
		forwardRef(() =>TimeslotsModule), 
		forwardRef(() =>ReservationsModule)], //usersmodule needs to be imported to use the hasroles() guard
	controllers: [TeachersController],
	providers: [TeachersService],
	exports:[TeachersService]
})
export class TeachersModule {}
