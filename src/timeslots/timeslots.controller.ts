import {
	Body,
	Controller,
	Get,
	HttpException,
	HttpStatus,
	Inject,
	LoggerService,
	NotFoundException,
	Param,
	Patch,
	Post,
	Put,
	Req,
	UseGuards,
} from '@nestjs/common'
import {
	ApiBearerAuth,
	ApiOkResponse,
	ApiBadRequestResponse,
	ApiForbiddenResponse,
	ApiUnauthorizedResponse,
	ApiTags,
	ApiOperation,
	ApiBody,
	getSchemaPath,
	ApiNotFoundResponse,
} from '@nestjs/swagger'
import { instanceToPlain, plainToClass, plainToInstance } from 'class-transformer'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { hasRoles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { ReservationsService } from '../reservations/reservations.service'
import { CreateMultipleTimeslotsWithLabIdDto, PatchTimeslotDto, ShowTimeslotDto, TimeslotDto, UpdateTimeslotDto } from '../shared/dtos/timeslot.dto'
import { LoggedInUserDto } from '../shared/dtos/user.dto'
import { Role } from '../shared/enums/role.enum'
import { Timeslot } from '../shared/models/timeslot.entity'
import { TimeslotService } from './timeslots.service'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { Lab } from '../shared/models/lab.entity'
import { LabsService } from '../labs/labs.service'
import { TeachersService } from '../teachers/teachers.service'
import { Teacher } from '../shared/models/teacher.entity'
import { Reservation } from '../shared/models/reservation.entity'

@ApiTags('timeslots')
@Controller('timeslots')
export class TimeslotsController {
	constructor(
    private readonly timeslotService: TimeslotService,
    private readonly reservationsService: ReservationsService,
	private readonly teachersService:TeachersService,
	private readonly labsService:LabsService,
	@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
	) {}
	@hasRoles(Role.teacher, Role.admin)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@ApiBearerAuth()
	@ApiBody({ type:CreateMultipleTimeslotsWithLabIdDto })
	@ApiOkResponse({
		schema: { type: 'array', items: { $ref: getSchemaPath(TimeslotDto) } },
	})
	@ApiBadRequestResponse({ description: 'Create failed.' })
	@ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
	@ApiForbiddenResponse({ description: 'No access allowed.' })
	@ApiNotFoundResponse({description:'Lab not found.'})
	@ApiOperation({ summary: 'Add new timeslots to an existing lab.' })
	@Post()
	async addTimeslotsToLab(
	  @Body() createTimeslotsDto: CreateMultipleTimeslotsWithLabIdDto,
	  @Req() req,
	): Promise<TimeslotDto[]> {
		const loggedInUser: LoggedInUserDto = req.user
		//check if lab exists
		const lab: Lab = await this.labsService.getLabById(createTimeslotsDto.labId)
		if (!lab) {
			throw new HttpException(
				`Could not find lab with id: ${createTimeslotsDto.labId}`,
				HttpStatus.NOT_FOUND,
			)
		}
		if (loggedInUser.role === Role.teacher) {
			const teacher:Teacher =await this.teachersService.getOneByLabId(createTimeslotsDto.labId)
			//check if teacher that send request is linked to course
			if(!teacher){
				this.logger.log(
					`Teacher with user id ${loggedInUser.id} tried to access lab with id ${createTimeslotsDto.labId} which doesn't belong to them.`,
				)
				throw new HttpException(
					'You don\t have access to this lab.',
					HttpStatus.FORBIDDEN,
				)
			}
		}
		//add timeslots to lab
		const createdTimeslots: Timeslot[] =
		  await this.timeslotService.createMany(createTimeslotsDto)
		if (!createdTimeslots) {
			throw new HttpException(
				`Failed to add timeslots to lab with id: ${createTimeslotsDto.labId}`,
				HttpStatus.BAD_REQUEST,
			)
		}
		const timeslotDtos: ShowTimeslotDto[] = createdTimeslots.map(
			(timeslot) => {
				return plainToInstance(ShowTimeslotDto, instanceToPlain(timeslot), {
					excludeExtraneousValues: true,
				})
			},
		)
		return timeslotDtos
		
	}	
	
	@hasRoles(Role.admin, Role.teacher)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@ApiBearerAuth()
	@ApiOperation({summary:'Get timeslotdetails by timeslot id.', 
		description:`Admins can get any timeslot. </br>
		Teachers can only get a timeslot that belongs to one of their labs.`})
	@ApiOkResponse({ description: 'Succeeded to get timeslot.', type:ShowTimeslotDto })
	@ApiForbiddenResponse({ description: 'Access forbidden.' })
	@ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
	@ApiNotFoundResponse({description:'Timeslot not found.'})
@Get(':id')
	async getTimeslotDetails(@Param('id') id:string, @Req() req) : Promise<ShowTimeslotDto>{
		const loggedInUser:LoggedInUserDto = req.user
		//get timeslot without relations
		const timeslot:Timeslot = await this.timeslotService.getOneByTimeslotId(id)
		if(!timeslot){
			throw new NotFoundException(`No timeslot found with id ${id}`)
		}
		if(loggedInUser.role === Role.teacher){
			//get timeslot by id with teacher relation
			const timeslot:Timeslot = await this.timeslotService.getOneWithTeacherRelationByTimeslotId(id)
			if(!timeslot){
				throw new NotFoundException(`No timeslot found with id ${id}`)
			}
			//check if timeslot is linked to teacher that send request
			if(timeslot.lab.course.teacher.user.id !== loggedInUser.id){
				this.logger.log(`Teacher with user id ${loggedInUser.id} tried to access timeslot details for timeslot linked to teacher with user id ${timeslot.lab.course.teacher.user.id}`)
				throw new HttpException('You have no access to this timeslot.', HttpStatus.FORBIDDEN)
			}
				
		}
			
		const timeslotDto: ShowTimeslotDto = plainToClass(ShowTimeslotDto, 
			instanceToPlain(timeslot), 
			{excludeExtraneousValues:true})
		return timeslotDto
		
	}

	
@hasRoles(Role.student)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Patch succeeded.', type:ShowTimeslotDto })
  @ApiBadRequestResponse({ description: 'Patch failed.' })
  @ApiForbiddenResponse({ description: 'Access forbidden.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  @ApiNotFoundResponse({description:'No reservation found.'})
  @ApiOperation({ summary: 'Complete timeslot.' })
  @Patch(':id')
	async completeTimeslot(
    @Param('id') id: string,
    @Body() patchTimeslotDto: PatchTimeslotDto,
    @Req() req,
	) :Promise<ShowTimeslotDto> {
		const loggedInUser:LoggedInUserDto = req.user
		//we don't need to check if the timeslot exists. 
		//A timeslot without a reservation is no use here
		//so by getting the reservation by the timeslotId, we also know the timeslot exists.
		//this saves us a db call
		//get reservation for timeslotId
		const reservation: Reservation =
          await this.reservationsService.getOneByTimeslotId(id, true, true, true)
		if (!reservation) {
			this.logger.log(`User with id ${loggedInUser.id} tried to complete a timeslot with id ${id} that has no reservation.`)
			throw new HttpException(`No reservation found for timeslot with id ${id}.`, HttpStatus.NOT_FOUND)
		}
		//check if student that is finishing the lab is the same student as the one that has the reservation

		if (loggedInUser.id !== reservation.student.user.id) {
			this.logger.log(`Student with user id ${loggedInUser.id} tried to complete reservation for student with user id ${reservation.student.user.id}`)
			throw new HttpException(
				'You\re not allowed to do this.',
				HttpStatus.FORBIDDEN,
			)
		}
		const updateSucceeded:boolean = await this.timeslotService.completeLab(
			id,
			patchTimeslotDto,
		)
		if(!updateSucceeded){
			throw new HttpException('Patch failed.', HttpStatus.BAD_REQUEST)
		}
		const timeslotDto: ShowTimeslotDto = plainToClass(ShowTimeslotDto, 
			instanceToPlain(reservation.timeslot), 
			{excludeExtraneousValues:true})
		return timeslotDto
		
		
	}

@hasRoles(Role.teacher, Role.admin)
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiOkResponse({ description: 'Update succeeded.', type:ShowTimeslotDto })
@ApiBadRequestResponse({ description: 'Update failed.' })
@ApiForbiddenResponse({ description: 'Access forbidden.' })
@ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
@ApiOperation({ summary: 'Update times of timeslot' })
@Put(':id')
async updateTimesOfTimeslot(@Param('id') id:string, @Body() updateTimeslotDto:UpdateTimeslotDto, @Req() req):Promise<ShowTimeslotDto>{
  	const loggedInUser:LoggedInUserDto = req.user
	const timeslot:Timeslot = await this.timeslotService.getOneByTimeslotId(id)
	if (!timeslot) {
		throw new NotFoundException(`Timeslot with id ${id} not found.`)
	}
  	if (loggedInUser.role === Role.teacher) {
  		//check if timeslot exists
  		const timeslot:Timeslot = await this.timeslotService.getOneWithTeacherRelationByTimeslotId(id)
  		
  			//check if teacher is linked to this timeslot
	  	if (timeslot.lab.course.teacher.user.id !== loggedInUser.id) {
			this.logger.log(`Teacher with user id ${loggedInUser.id} tried to access timeslot details for timeslot linked to teacher with user id ${timeslot.lab.course.teacher.user.id}`)
			throw new HttpException('You don\'t have access to this timeslot.', HttpStatus.FORBIDDEN)
		}
	}
	  	
	//update timeslot
	const updateSucceeded: boolean = await this.timeslotService.updateTimeslotsTime(id, updateTimeslotDto)
	 			
	if(!updateSucceeded){
		throw new HttpException(`Failed to update timeslot with id: ${id}`, HttpStatus.BAD_REQUEST)
	}
	  	
	const timeslotDto: ShowTimeslotDto = plainToClass(ShowTimeslotDto, 
	  		instanceToPlain(timeslot), 
	  		{excludeExtraneousValues:true})
	return timeslotDto
}
}
