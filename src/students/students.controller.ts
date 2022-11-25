import {
	Controller,
	Get,
	Param,
	UseGuards,
	Req,
	HttpException,
	HttpStatus,
	Inject,
	LoggerService,
} from '@nestjs/common'
import { ApiBadRequestResponse, ApiBearerAuth, 
	ApiExtraModels, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, 
	ApiTags, ApiUnauthorizedResponse, getSchemaPath } from '@nestjs/swagger'
import { instanceToPlain, plainToInstance } from 'class-transformer'
import { Student } from '../shared/models/student.entity'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ReservationsService } from '../reservations/reservations.service'
import { ShowFutureReservationDto } from '../shared/dtos/reservation.dto'
import { Role } from '../shared/enums/role.enum'
import { Reservation } from '../shared/models/reservation.entity'

import { StudentsService } from './students.service'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { LoggedInUserDto } from '../shared/dtos/user.dto'
import { Teacher } from '../shared/models/teacher.entity'
import { TeachersService } from '../teachers/teachers.service'
import { CoursesService } from '../courses/courses.service'
import { Course } from '../shared/models/course.entity'

@ApiTags('students')
@ApiExtraModels(ShowFutureReservationDto)
@Controller('students')
export class StudentsController {
	constructor(
    private readonly studentsService: StudentsService,
	private readonly teachersService:TeachersService,
    private readonly reservationsService: ReservationsService,
	private readonly coursesService:CoursesService,
	@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
	) {}
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({description:'Future reservations for student.', 
  	schema: {
  		type:'array', 
  		items: {$ref: getSchemaPath(ShowFutureReservationDto)}
  	}})
  @ApiBadRequestResponse({description:'Could not find future reservations for this student.'})
  @ApiForbiddenResponse({description:'Access forbidden.'})
  @ApiUnauthorizedResponse({description:'Invalid credentials.'})
  @ApiNotFoundResponse({description:'Reservations not found.'})
  @ApiOperation({summary:'Get all future reservations for this student.', 
  	description:'Only logged in students can view reservations and they can only view their own reservations. '})
  @Get(':id/myfuturereservations') //we can't put this under reservations/myfuturereservations 'cus it will be seen as /reservations/id
	async getFutureReservationsForStudent(
    @Param('id') id:string,
    @Req() req,
	): Promise<ShowFutureReservationDto[]> {
		const loggedInUser:LoggedInUserDto = req.user
		//check if student exists by studentId
		const student:Student = await this.studentsService.getOneByStudentId(id) //
		if (!student){
			this.logger.log(`User with id ${loggedInUser.id} tried to find future reservations for an unexisting student with id ${id}`)
			throw new HttpException('Student not found.', HttpStatus.NOT_FOUND)
		}
		if (loggedInUser.role === Role.student) {
			//check if student that sent request is same student that wants reservations
			const loggedInStudent:Student = await this.studentsService.getOneByUserId(
				loggedInUser.id,
			)
			if (loggedInStudent.id !== student.id) {
				this.logger.log(`Student with id ${loggedInStudent.id} tried to access reservations for student with id ${student.id}`)
				throw new HttpException(
					'You don\'t have access to this function.',
					HttpStatus.FORBIDDEN,
				)
			}
		}else if (loggedInUser.role === Role.teacher){
			const loggedInTeacher:Teacher = await this.teachersService.getOneByUserId(loggedInUser.id)
			const course:Course = await this.coursesService.getOneByTeacherIdAndStudentId({teacherId:loggedInTeacher.id, studentId:id})
			if(!course){
				this.logger.log(`Teacher with id ${loggedInTeacher.id} tried to access reservations for student with id ${id}, but has no course with this student present.`)
				throw new HttpException(
					'You don\'t have access to this function.',
					HttpStatus.FORBIDDEN,
				)
			}
		}
		//rest of code is same, regardless of role
		//get future reservations for this student
		const reservations: Reservation[] = await this.reservationsService.getAllFutureReserationsForStudent( student.id)
		if(!reservations){
			throw new HttpException(
				'Reservations not found.',
				HttpStatus.NOT_FOUND
			)
		}
		const reservationDtos: ShowFutureReservationDto[] = reservations.map((reservation) => plainToInstance(
			ShowFutureReservationDto, 
			instanceToPlain(reservation),
			{
              					excludeExtraneousValues: true,
              				},
              				),
		)
		return reservationDtos
	
	}
}
