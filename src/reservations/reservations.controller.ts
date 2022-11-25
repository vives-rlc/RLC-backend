import { Controller, Post, Body, HttpException, HttpStatus, UseGuards, Inject, LoggerService, Req } from '@nestjs/common'
import { ReservationsService } from './reservations.service'
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreateReservationDto, ReservationDto } from '../shared/dtos/reservation.dto'
import { TimeslotService } from '../timeslots/timeslots.service'
import { StudentsService } from '../students/students.service'
import { Reservation } from '../shared/models/reservation.entity'
import { plainToInstance, instanceToPlain } from 'class-transformer'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { LoggedInUserDto } from '../shared/dtos/user.dto'
import { Student } from '../shared/models/student.entity'
import { Timeslot } from '../shared/models/timeslot.entity'

@ApiTags('reservations')
@Controller('reservations')
export class ReservationsController {
	constructor(
		private readonly reservationsService: ReservationsService,
		private readonly timeslotService:TimeslotService,
		private readonly studentService:StudentsService,
		@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
	) {}
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiCreatedResponse({
		description: 'Your reservation has been successfully created.',
		type: ReservationDto,
	  })
	@ApiBadRequestResponse({description: 'Reservation couldn\'t be created'})
	@ApiNotFoundResponse({description:'Not found.'})
	@ApiOperation({summary:'Create a new reservation.'})
 	@Post()
	async create(@Body() createReservationDto: CreateReservationDto, @Req() req) :Promise<ReservationDto> {
		
		const loggedInUser:LoggedInUserDto = req.user
		
		//check if timeslot exists and isn't reserved yet
		const timeslot:Timeslot = await this.timeslotService.getOneByTimeslotId(createReservationDto.timeslot.id)
		if(!timeslot){
			this.logger.log(`User with id ${loggedInUser.id} tried to reserve an unexisting timeslot with id ${createReservationDto.timeslot.id}`)
			throw new HttpException('Timeslot not found.', HttpStatus.NOT_FOUND)
		}
		//timeslot exists
		if(timeslot.isReserved){
			this.logger.log(`User with id ${loggedInUser.id} tried to reserve a timeslot that is already reserved with id ${createReservationDto.timeslot.id}`)
			throw new HttpException('This timeslot is already reserved.', HttpStatus.BAD_REQUEST)
		}
		//timeslot isn't reserved yet
		//check if student exists
		const student:Student = await this.studentService.getOneByStudentId(createReservationDto.student.id)
		if (!student){
			this.logger.log(`User with id ${loggedInUser.id} tried to make a reservation for an unexisting student with id${createReservationDto.student.id}`)
			throw new HttpException('Student not found.', HttpStatus.NOT_FOUND)
		}
		//we're not checking wether or not the student already has a reservation for a certain lab, in case students want to practice more than once.
		//create reservation
		const newReservation:Reservation = await this.reservationsService.create(createReservationDto)
				
		if(!newReservation){ 
			throw new HttpException('Reservation couldn\'t be created', HttpStatus.BAD_REQUEST)
		}
		//if the reservation is successfully created
		//update timeslot so it no longer shows as unreserved
		const updateSucceeded:boolean = await this.timeslotService.updateTimeslotReservation(timeslot.id, true)
		if(!updateSucceeded) {
			throw new HttpException('Reservation couldn\'t be created', HttpStatus.BAD_REQUEST)
		}
		//map reservation entity to dto
		const reservationDto: ReservationDto = plainToInstance(
			ReservationDto,
			instanceToPlain(newReservation),
			{ excludeExtraneousValues: true },
		)
							
		return reservationDto	
	}

}
