import { BadRequestException, Body, Controller, Get, HttpException, HttpStatus, Inject, LoggerService, NotFoundException, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, getSchemaPath } from '@nestjs/swagger'
import { plainToInstance, instanceToPlain } from 'class-transformer'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { User } from '../shared/models/user.entity'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { hasRoles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { ShowStudentDto } from '../shared/dtos/student.dto'
import { ShowTeacherDto } from '../shared/dtos/teacher.dto'
import { CreateUserDto, LoggedInUserDto, ShowUserDto, UserDto } from '../shared/dtos/user.dto'
import { Role } from '../shared/enums/role.enum'
import { Student } from '../shared/models/student.entity'
import { Teacher } from '../shared/models/teacher.entity'
import { StudentsService } from '../students/students.service'
import { TeachersService } from '../teachers/teachers.service'
import { UsersService } from './users.service'


@ApiTags('users')
@Controller('users')
export class UserController {
	
	constructor( 
		private userService: UsersService,
		private teachersService: TeachersService,
		private studentsService:StudentsService,
		@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,){}

	@hasRoles(Role.admin)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@ApiBearerAuth()
	@ApiBody({type:[CreateUserDto]})
	@ApiOperation({summary:'Creates multiple new users. Admin access only.'})
	@ApiOkResponse({type:[UserDto], description:'Created new users.'})
	@ApiBadRequestResponse({description:'Failed to create new users.'})
	@Post()
	async createUsers(@Body() userDtos: CreateUserDto[], @Req() req):Promise<UserDto[]>{
		const loggedInUser:LoggedInUserDto = req.user
		
		//we need .map here and not .foreach because we need to return the createduser
		//foreach doesn't work because there is async logic on the inside
		//creating an empty list before .foreach and using .push(user) doesn't work
		const promises:Promise<UserDto>[] = userDtos.map(async (userDto:CreateUserDto) :Promise<UserDto>=> {
			const isExistingUser:boolean = await this.userService.userExists(userDto.number, userDto.email)
			if(isExistingUser){
				this.logger.log(`Admin with id ${loggedInUser.id} tried to create a user ${JSON.stringify(userDto)}, but user already exists.`)
				throw new BadRequestException('User already exists.')
			}
			let newUser:User
			if(userDto.role === Role.student){
				const student:Student = await this.studentsService.create({user:userDto, courses:[]})
				if(!student){
					throw new BadRequestException(`Failed to create student with number ${userDto.number}.`)
				}
				newUser = student.user
			} else if (userDto.role === Role.teacher){
				const teacher:Teacher = await this.teachersService.create({user:userDto})
				if(!teacher){
					throw new BadRequestException(`Failed to create teacher with number ${userDto.number}.`)
				}
				newUser = teacher.user
			}else {
				newUser = await this.userService.create(userDto)
				//create a new promise that holds the user
				
			}
			
			const createdUserDto : UserDto = plainToInstance(UserDto, 
				instanceToPlain(newUser),
				{excludeExtraneousValues:true})
			return new Promise((resolve, reject) => {resolve(createdUserDto)})
			
		})
		//wait until all the promises are resolved, meaning, all the async mapping is done
		//collect all the results and send them back in the response body
		const createdUsers:Promise<UserDto[]> =	Promise.all(promises)
			.then((results) => {
				return results
			})
	
		return createdUsers

	}
	@hasRoles(Role.admin)
	@UseGuards(JwtAuthGuard, RolesGuard)
	@ApiBearerAuth()
	@ApiOperation({summary:'Returns all users. Admin access only.'})
	@ApiNotFoundResponse({description:'No users found.'})
	@ApiOkResponse({schema:{
		type:'array',
		items: {
			$ref: getSchemaPath(UserDto)
		}
	}})
	@Get()
	async getAllUsers():Promise<UserDto[]>{
		const users:User[] = await this.userService.getAll()
		if(!users){
			throw new NotFoundException('Failed to find users.')
		}
		const userDtos:UserDto[] = []
		users.forEach(user => {
			const userDto : UserDto = plainToInstance(UserDto, 
				instanceToPlain(user),
				{excludeExtraneousValues:true})
			userDtos.push(userDto)
		})
		if(userDtos){
			return userDtos
		}
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	@ApiOkResponse({description:'Profile information of the logged in user.', 
		schema:{
			oneOf:[{
				$ref: getSchemaPath(ShowTeacherDto)

			},
			{
				$ref: getSchemaPath(ShowStudentDto)
			},
			{ $ref: getSchemaPath(ShowUserDto)}
			]
		}})
		@ApiNotFoundResponse({description:'Profile not found.'})
		@ApiOperation({ summary: 'Returns profile information of the logged in user (includes teacherId or studentId).' })
	@ApiBearerAuth()	
	async getProfile(@Req() req) {
		const loggedInUser:LoggedInUserDto = req.user
		if(loggedInUser.role === Role.teacher){
			const teacher:Teacher = await this.teachersService.getOneByUserId(loggedInUser.id)
			if(!teacher){
				throw new HttpException('Profile not found.', HttpStatus.BAD_REQUEST)
			}
			const teacherDto : ShowTeacherDto = plainToInstance(ShowTeacherDto, 
				instanceToPlain(teacher),
				{excludeExtraneousValues:true})
			return teacherDto
				
			
		} else if(loggedInUser.role === Role.student){
			const student:Student = await this.studentsService.getOneByUserId(loggedInUser.id)
			if(!student){
				throw new HttpException('Profile not found.', HttpStatus.BAD_REQUEST)
			}
			const studentDto : ShowStudentDto = plainToInstance(ShowStudentDto, 
				instanceToPlain(student),
				{excludeExtraneousValues:true})
			return studentDto
		
		}else if(loggedInUser.role === Role.admin){
			return req.user
		}
	  
	}

}

