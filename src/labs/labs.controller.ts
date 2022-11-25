import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	HttpException,
	HttpStatus,
	UseGuards,
	Req,
	Put,
	NotFoundException,
	Inject,
	LoggerService,
	BadRequestException,
} from '@nestjs/common'
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiBody,
	ApiCreatedResponse,
	ApiExtraModels,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
	getSchemaPath,
} from '@nestjs/swagger'
import { plainToInstance, instanceToPlain } from 'class-transformer'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { Course } from '../shared/models/course.entity'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { hasRoles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { CoursesService } from '../courses/courses.service'
import { ReservationsService } from '../reservations/reservations.service'
import {
	CreateLabWithCourseIdDto,
	ShowLabDto,
	ShowLabWithConnectionAndReservationsDto,
	ShowLabWithConnectionDto,
	ShowLabWithTimeslotsAndConnectionDto,
	ShowLabWithTimeslotsDto,
	UpdateLabDto,
} from '../shared/dtos/lab.dto'
import { ShowStudentDto } from '../shared/dtos/student.dto'
import {
	ShowTimeslotWithStudentDto,
} from '../shared/dtos/timeslot.dto'
import { LoggedInUserDto } from '../shared/dtos/user.dto'
import { Role } from '../shared/enums/role.enum'
import { Lab } from '../shared/models/lab.entity'
import { Reservation } from '../shared/models/reservation.entity'
import { Timeslot } from '../shared/models/timeslot.entity'
import { TimeslotService } from '../timeslots/timeslots.service'
import { LabsService } from './labs.service'
import { Teacher } from '../shared/models/teacher.entity'
import { TeachersService } from '../teachers/teachers.service'

@ApiTags('labs')
@Controller('labs')
@ApiExtraModels(
	ShowLabWithConnectionAndReservationsDto,
	ShowLabWithTimeslotsAndConnectionDto,
)
export class LabController {
	constructor(
    private readonly labService: LabsService,
    private readonly timeslotService: TimeslotService,
    private readonly courseService: CoursesService,
    private readonly reservationService: ReservationsService,
	private readonly teachersService:TeachersService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
	) {}

  @hasRoles(Role.teacher, Role.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({
  	summary: 'Returns all labs.',
  	description: `Returns all labs for bassed on role of logged in user. </br>
		Admins can see all labs in application. </br>
		Teachers can only see the labs that are linked to them.
	`,
  })
  @ApiOkResponse({
  	schema: {
  		type: 'array',
  		items: { $ref: getSchemaPath(ShowLabDto) },
  	},
  })
  @ApiNotFoundResponse({ description: 'No labs found.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  @ApiNotFoundResponse({description:'No labs found.'})
  @Get()
	async getAllLabs(@Req() req): Promise<ShowLabDto[]> {
		const loggedInUser: LoggedInUserDto = req.user
		let labs:Lab[] = []
		if (loggedInUser.role === Role.teacher) {
			 labs = await this.labService.getAllLabsForTeacher(loggedInUser.id)
		} else if (loggedInUser.role === Role.admin) {
			labs = await this.labService.getAllLabs()
		}
		if (!labs) {
			throw new NotFoundException('No labs found.')
		}
		const labDtos: ShowLabDto[] = labs.map((lab) => {
			return plainToInstance(ShowLabDto, instanceToPlain(lab), {
				excludeExtraneousValues: true,
			})
		})
		return labDtos
	}

  @hasRoles(Role.teacher, Role.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiBody({ type: CreateLabWithCourseIdDto })
  @ApiCreatedResponse({
  	description: 'Your lab has been successfully created.',
  	type: ShowLabDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  @ApiForbiddenResponse({ description: 'No access allowed.' })
  @ApiBadRequestResponse({ description: 'Failed to create lab.' })
  @ApiNotFoundResponse({description:'Course not found.'})
  @ApiOperation({
  	summary: 'Add a lab to an existing course.',
  	description: `Admins can create labs for any course. </br>
		Teachers can only add labs to their own courses.`,
  })
  @Post()
  async createLab(
    @Body() createLabDto: CreateLabWithCourseIdDto,
    @Req() req,
  ): Promise<ShowLabDto> {
  	const loggedInUser:LoggedInUserDto = req.user
  	//check if course exists
  	const course: Course =
      await this.courseService.getOneWithTeacherRelationByCourseId(
      	createLabDto.course.id,
      )

  	if (!course) {
  		//course does not exist
  		throw new NotFoundException('Course not found.')
  	}

  	//if user that send request is a teacher
  	if (loggedInUser.role === Role.teacher) {
  		//check if teacher that send request is teacher that is linked to this course.
  		if (course.teacher.user.id !== loggedInUser.id) {
  			this.logger.log(
  				`Teacher with user id ${
  					loggedInUser.id
  				} tried to create lab ${JSON.stringify(
  					createLabDto,
  				)} for course linked to teacher with id ${course.teacher.user.id}`,
  			)
  			throw new HttpException(
  				`You don\'t have access to create a lab for course with id:${createLabDto.course.id}.`,
  				HttpStatus.FORBIDDEN,
  			)
  		}
  	}
  	//rest of teacher code equals admin code, so we continue from here without a seperation
  	//create lab
  	const createdLab: Lab = await this.labService.createLab(createLabDto)
  	if (!createdLab) {
  		throw new HttpException(
  			'Failed to create lab.',
  			HttpStatus.BAD_REQUEST,
  		)
  	}
  	const createdLabDto: ShowLabDto = plainToInstance(
  		ShowLabDto,
  		instanceToPlain(createdLab),
  		{
  			excludeExtraneousValues: true,
  		},
  	)
  	return createdLabDto
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
  	description: 'Lab detail info.',
  	schema: {
  		oneOf: [
  			{
  				$ref: getSchemaPath(ShowLabWithTimeslotsDto),
  			},
  			{
  				$ref: getSchemaPath(ShowLabWithConnectionAndReservationsDto),
  			},
  			{
  				$ref: getSchemaPath(ShowLabWithTimeslotsAndConnectionDto),
  			},
  		],
  	},
  })
  @ApiBadRequestResponse({ description: 'Failed to get lab.' })
  @ApiNotFoundResponse({ description: 'Lab not found.' })
  @ApiUnauthorizedResponse({ description: 'invalid Credentials.' })
  @ApiForbiddenResponse({ description: 'No access allowed.' })
  @ApiOperation({
  	summary:
      'Get more detailed info about a lab based on lab id and the user role.',
  })
  @Get(':id')
  async getLabByLabId(
    @Param('id') id: string,
    @Req() req,
  ): Promise<
    | ShowLabWithTimeslotsDto
    | ShowLabWithConnectionAndReservationsDto
    | ShowLabWithTimeslotsAndConnectionDto
  > {
  	const loggedInUser:LoggedInUserDto = req.user

  	if (loggedInUser.role === Role.student) {
  		//check if lab exists
  		const lab: Lab = await this.labService.getLabWithTeacherAndStudentsByLabId(id)
  		if (!lab) {
  			throw new HttpException(
  				`Could not find lab with id: ${id}`,
  				HttpStatus.NOT_FOUND,
  			)
  		}
		
  		//check if student is connected to this lab.
  		if (
  			!lab.course.students.find(
  				(student) => student.user.id === loggedInUser.id,
  			)
  		) {
  			throw new HttpException(
  				'You don\t have access to this lab.',
  				HttpStatus.FORBIDDEN,
  			)
  		}
  		//get unreserved timeslots
  		const timeslots: Timeslot[] =
        await this.timeslotService.getUnreservedTimeslotsByLabId(id)
  		if (!timeslots) {
  			throw new HttpException(
  				'Failed to get lab details.',
  				HttpStatus.BAD_REQUEST,
  			)
  		}
  		lab.timeslots = timeslots
  		const labDto:ShowLabWithTimeslotsDto = plainToInstance(
  			ShowLabWithTimeslotsDto,
  			instanceToPlain(lab),
  			{ excludeExtraneousValues: true },
  		)
  		return labDto
  	} else if (loggedInUser.role === Role.teacher) {
  		//Get lab with connection and all timeslots
  		const lab: Lab =
        await this.labService.getLabWithConnectionAndTimeslotsByLabId(id)
  		// we don't get reservations with all relations in one go (skipping the get lab step), because then we would get the lab again for every reservation
  		//this would not be optimally performant for the database
  		if (!lab) {
  			throw new HttpException(
  				`Could not find lab with id: ${id}`,
  				HttpStatus.NOT_FOUND,
  			)
  		}
  		//check if teacher is connected to this lab.
  		if (loggedInUser.id !== lab.course.teacher.user.id) {
  			this.logger.log(
  				`Teacher with user id ${loggedInUser.id} tried to access lab linked to course of teacher with user id ${lab.course.teacher.user.id}`,
  			)
  			throw new HttpException(
  				'You don\t have access to this lab.',
  				HttpStatus.FORBIDDEN,
  			)
  		}
  		//create the labDto first so we have room for our student in the timeslot
  		const labDto: ShowLabWithConnectionAndReservationsDto = plainToInstance(
  			ShowLabWithConnectionAndReservationsDto,
  			instanceToPlain(lab),
  			{ excludeExtraneousValues: true },
  		)

  		// get reservation with student relation for all timeslots and map timeslots
  		const promises: Promise<ShowTimeslotWithStudentDto>[] =
        labDto.timeslots.map(
        	async (
        		timeslot: ShowTimeslotWithStudentDto,
        	): Promise<ShowTimeslotWithStudentDto> => {
        		const reservation: Reservation =
              await this.reservationService.getOneByTimeslotId(
              	timeslot.id,
              	false,
              	true,
              	true,
              )
        		if (reservation) {
        			
        		const studentDto: ShowStudentDto = plainToInstance(
        			ShowStudentDto,
        			instanceToPlain(reservation.student),
        			{ excludeExtraneousValues: true },
        		)
        		timeslot.student = studentDto
        		}
        		return new Promise((resolve, reject) => {
        			resolve(timeslot)
        		})
        	},
        )
  		//wait for all mapping promisses to resolve and return results
  		const timeslots: ShowTimeslotWithStudentDto[] = await Promise.all(
  			promises,
  		).then((results) => {
  			return results
  		})

  		// if mapping is finished and we have returned newly mapped timeslots, add them to labDto and return labDto
  		if (timeslots) {
  			labDto.timeslots = timeslots
  			return labDto
  		}
  	} else if (loggedInUser.role === Role.admin) {
  		//user is admin
  		const lab:Lab = await this.labService.getLabWithConnectionAndTimeslotsByLabId(
  			id,
  		)
  		if (!lab) {
  			throw new HttpException(
  				`Could not find lab with id: ${id}`,
  				HttpStatus.NOT_FOUND,
  			)
  		}
  		const labDto:ShowLabWithTimeslotsAndConnectionDto = plainToInstance(
  			ShowLabWithTimeslotsAndConnectionDto,
  			instanceToPlain(lab),
  			{ excludeExtraneousValues: true },
  		)
  		return labDto
  	}
  }

  @hasRoles(Role.teacher, Role.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
  	description: 'Lab detail info.',
  	type: ShowLabWithConnectionDto,
  })
  @ApiBadRequestResponse({ description: 'Failed to update lab.' })
  @ApiForbiddenResponse({ description: 'No access allowed.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  @ApiNotFoundResponse({description:'No lab found.'})
  @ApiOperation({
  	summary: 'Update a lab with its connection.',
  	description: `Teachers can update a lab that belongs to one of their courses. </br>
		Admins can update any lab.`,
  })
  @Put(':id')
  async updateLabWithConnection(
    @Param('id') id: string,
    @Body() updateLabDto: UpdateLabDto,
    @Req() req,
  ): Promise<ShowLabWithConnectionDto> {
  	const loggedInUser: LoggedInUserDto = req.user
  	//check if lab exists
	  const lab: Lab = await this.labService.getLabById(id)
	  if (!lab) {
  		throw new HttpException(
  			`Could not find lab with id: ${id}.`,
  			HttpStatus.NOT_FOUND,
  		)
  	}
  	if(lab.connection.id !== updateLabDto.connection.id){
  		this.logger.log(`User with id ${loggedInUser.id} tried to update a lab with connection id ${lab.connection.id} but send in the request a connection with id ${updateLabDto.connection.id}. `)
  		throw new BadRequestException(`Failed to update lab with id: ${id}.`)
		
  	}
  	if (loggedInUser.role === Role.teacher) {
  		// check if lab is linked to teacher that send reqest
  		const teacher:Teacher = await this.teachersService.getOneByLabId(id)
  		if(!teacher || teacher.user.id !== loggedInUser.id){
  			this.logger.log(
  				`Teacher with user id ${loggedInUser.id} tried to access lab with id ${id} which doesn't belong to them.`,
  			)
  			throw new HttpException(
  				'You don\t have access to this lab.',
  				HttpStatus.FORBIDDEN,
  			)
  		}
  	}
  	//rest of the code is same for teacher/admin
  	//update lab
  	const updateSucceeded: boolean = await this.labService.update(
  		id,
  		updateLabDto,
  	)
  	if (!updateSucceeded) {
  		throw new HttpException(
  			`Failed to update lab with id: ${id}.`,
  			HttpStatus.BAD_REQUEST,
  		)
  	}
  	const labDto: ShowLabWithConnectionDto = plainToInstance(
  		ShowLabWithConnectionDto,
  		instanceToPlain(updateLabDto),
  		{ excludeExtraneousValues: true },
  	)
  	labDto.id = id
  	return labDto
  	} 

}
