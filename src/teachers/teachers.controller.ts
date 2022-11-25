import { Controller, Get, HttpException, HttpStatus, Inject, LoggerService, NotFoundException, Param, Req, UseGuards } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBearerAuth, ApiExtraModels, ApiForbiddenResponse, ApiNotFoundResponse, 
	ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse, getSchemaPath } from '@nestjs/swagger'
import { plainToInstance, instanceToPlain } from 'class-transformer'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { hasRoles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { ReservationsService } from '../reservations/reservations.service'
import { ShowStudentDto } from '../shared/dtos/student.dto'
import { ShowTimeslotWithLabAndStudentDto } from '../shared/dtos/timeslot.dto'
import { Role } from '../shared/enums/role.enum'
import { Reservation } from '../shared/models/reservation.entity'
import { Timeslot } from '../shared/models/timeslot.entity'
import { TimeslotService } from '../timeslots/timeslots.service'
import { TeacherDto } from '../shared/dtos/teacher.dto'
import { Teacher } from '../shared/models/teacher.entity'
import { TeachersService } from './teachers.service'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { LoggedInUserDto } from '../shared/dtos/user.dto'

@ApiTags('teachers')
@Controller('teachers')
@ApiExtraModels(ShowTimeslotWithLabAndStudentDto)
export class TeachersController {
	constructor(private readonly teachersService: TeachersService,
		private readonly timeslotsService:TimeslotService,
		private readonly reservationsService:ReservationsService,
		@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
	) 	{}

@hasRoles(Role.admin)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Returns all teachers. Admin access only.' })
@ApiOkResponse({schema:{type:'array', items:{$ref: getSchemaPath(TeacherDto)}}})
@ApiUnauthorizedResponse({description:'Invalid credentials.'})
@ApiForbiddenResponse({description:'No access allowed.'})
@ApiNotFoundResponse({description:'Teachers not found.'})
@Get()
	async getTeacherId(@Req() req): Promise<TeacherDto[]>{

		const teachers: Teacher[] = await this.teachersService.getAll()
		if(!teachers){
			throw new HttpException('Teachers not found.', HttpStatus.NOT_FOUND)
		}
		const teacherDtos: TeacherDto[] = teachers.map(teacher => plainToInstance(TeacherDto, 
			instanceToPlain(teacher),
			{excludeExtraneousValues:true}) )
		return teacherDtos
	}

@hasRoles(Role.teacher, Role.admin)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Returns all timeslots that are linked to this teacher.',
	description:`Returns all timeslots with course information, and for reserved timeslots, also returns student information. </br>
	Teachers can only use this function with their own teacher id. Admins can get timeslots for any teacher id.` })
@ApiOkResponse({schema:
	{
		type:'array',
		items:{$ref:getSchemaPath(ShowTimeslotWithLabAndStudentDto)}
	}
}
)
@ApiUnauthorizedResponse({description:'Invalid credentials.'})
@ApiNotFoundResponse({description:'Timeslots for teacher not found.'})
@ApiForbiddenResponse({description:'No access allowed.'})
@Get(':id/alltimeslots')
async getAllTimeslots(@Param('id') id :string, @Req() req){
	const loggedInUser:LoggedInUserDto = req.user
	if(loggedInUser.role === Role.teacher){
		//check if logged in teacher is requesting timeslots for themselves
		const teacher:Teacher = await this.teachersService.getOneByUserId(loggedInUser.id)
		if(teacher.id !== id){
			this.logger.log(`Teacher with id ${teacher.id} tried to access timeslots for teacher with id ${id}`)
			throw new HttpException('You don\'t have access to this function', HttpStatus.FORBIDDEN)
		}
	}
	//get timeslots for this teacher with lab and course relations
	//we don't get this through the reservations respository 'cus then we wouldn't get the unreserved timeslots
	const timeslots:Timeslot[] = await this.timeslotsService.getAllTimeslotsWithCourseByTeacherId(id)
	if(!timeslots){
		throw new NotFoundException(`Timeslots for teacher with id: ${id} not found.`)
	}
	const promises:Promise<ShowTimeslotWithLabAndStudentDto>[] = timeslots.map(async(timeslot:Timeslot) : Promise<ShowTimeslotWithLabAndStudentDto>=> {
		//map timeslot to dto
		const timeslotDto: ShowTimeslotWithLabAndStudentDto = plainToInstance(ShowTimeslotWithLabAndStudentDto, 
			instanceToPlain(timeslot),
			{excludeExtraneousValues:true})
		// get reservation with student relation for timeslot
		const reservation :Reservation = await this.reservationsService.getOneByTimeslotId(timeslot.id, false, true, true)
				
		if (reservation){
			//if a reservation is found, add student to timeslotDto
			const studentDto:ShowStudentDto = plainToInstance(ShowStudentDto, instanceToPlain(reservation.student), {excludeExtraneousValues:true})
			timeslotDto.student = studentDto
		}// we don't need an exception for when no reservation is found
						
		return new Promise((resolve, reject) => {resolve(timeslotDto)})
	})
	//wait for all mapping promisses to resolve and return results
	const timeslotDtos:ShowTimeslotWithLabAndStudentDto[] = await Promise.all(promises)
		.then((results) => {
			return results
		})
		// if mapping is finished and we have returned newly mapped timeslots, return these to user.
	return timeslotDtos
}
}
