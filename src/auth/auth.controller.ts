import { Controller, Request, Post, UseGuards, Body, 
	HttpException, HttpStatus, Inject, LoggerService, NotFoundException } from '@nestjs/common'
import { ApiOperation, 
	ApiTags, ApiBody, ApiCreatedResponse, ApiBadRequestResponse,
	ApiUnauthorizedResponse,
	ApiNotFoundResponse} from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { LocalAuthGuard } from './local-auth.guard'
import { ActivateStudentAccountDto, LoginDto, UserTokenDto } from '../shared/dtos/auth.dto'
import { CreateUserDto } from '../shared/dtos/user.dto'
import { UsersService } from '../users/users.service'
import { TeachersService } from '../teachers/teachers.service'
import { Teacher } from '../shared/models/teacher.entity'
import { hashString } from '../shared/utils/hash'
import { StudentsService } from '../students/students.service'
import { CreateTeacherDto } from '../shared/dtos/teacher.dto'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { Student } from '../shared/models/student.entity'


@ApiTags('authentication')
@Controller('auth')
export class AuthController {
	constructor( private authService: AuthService, 
		private userService: UsersService,
		private readonly teachersService:TeachersService,
		private readonly studentsService:StudentsService,
		@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService ){}

	@Post('/register')
	@ApiOperation({ summary: 'Create a new teacher account.' })
	@ApiCreatedResponse({type: UserTokenDto, description:'Login Your account has been successfully created.'})
	@ApiUnauthorizedResponse({description: 'You do not have the right credentials to create an account.' })
	@ApiBadRequestResponse({description: 'User couldn\'t be created'})
	@ApiBody({type:CreateUserDto})
	async register(@Body() createUserDto : CreateUserDto): Promise<UserTokenDto> {
		//check if number is teacher number
		if(!createUserDto.number.startsWith('u')){
			this.logger.log(`User tried to create teacher account with user number that doesn't start with u, number tried: ${createUserDto.number}`)
			throw new HttpException('You do not have the right credentials to create an account.', HttpStatus.UNAUTHORIZED)
		}
		//check if user exists
		const isExistingUser:boolean = await this.userService.userExists(createUserDto.number, createUserDto.email)
		if(isExistingUser){
			this.logger.log(`User tried to create an already existing account: ${JSON.stringify(createUserDto)}`)
			throw new HttpException('Account already exists.', HttpStatus.BAD_REQUEST)
		}
		//create user with teacher role
		const teacherToCreate: CreateTeacherDto={user:{...createUserDto}}
		const newTeacher:Teacher = await this.teachersService.create(teacherToCreate)
		if(!newTeacher){					
			this.logger.log(`Failed to create new account for teacher:${JSON.stringify(createUserDto)}`)
			throw new HttpException('Failed to create new account', HttpStatus.BAD_REQUEST)
		}
		return this.authService.login(newTeacher.user)
	}

	// it's possible to switch this logic and declare all routes as guarded  
	//and only use decorators for the public routes. 
	//https://docs.nestjs.com/security/authentication#extending-guards
  @UseGuards(LocalAuthGuard) 
  @Post('/login')
  @ApiOperation({ summary: 'Login with your username and password.' })
  @ApiCreatedResponse({type: UserTokenDto, description:'Login succeeded'})
  @ApiUnauthorizedResponse({description: 'Error: Unauthorized'})
  @ApiBody({type:LoginDto})
  //this has to be a request and not a body
  // because it goes through the authentication guards
	async login(@Request() req):Promise<UserTokenDto> {
		return  this.authService.login(req.user)
	}
	
	@ApiOperation({ summary: 'Activate your account and set a password.' })
	@ApiCreatedResponse({type: UserTokenDto, description:'Account activation succeeded.'})
	@ApiUnauthorizedResponse({description: 'Error: Unauthorized'})
	@ApiBadRequestResponse({description:'Failed to activate account.'})
	@ApiNotFoundResponse({description:'Student not found.'})
	@Post('/activatestudent')
 	async activateStudent(@Body() activateStudentDto:ActivateStudentAccountDto): Promise<UserTokenDto>{
  	//check student against activation hash
  	if( hashString( activateStudentDto.number) !== activateStudentDto.activationToken){
  		this.logger.log(`Student with number ${activateStudentDto.number} used wrong activation url 
		(${activateStudentDto.activationToken} should be ${hashString(activateStudentDto.number)}) to activate their account`)
  		throw new HttpException('You are not allowed to do this.', HttpStatus.UNAUTHORIZED)
  	}

  	//check if student exists and is not already activated
  	const student:Student =await this.studentsService.getOneByNumber(activateStudentDto.number)
  	if(!student){
  		throw new NotFoundException('Student not found')
  	}
  	if(student.isActivated){
  		throw new HttpException('Could not activate this account.', HttpStatus.BAD_REQUEST)
  	}
  	//update student pw
  	const pwUpdateSucceeded:boolean = await this.userService.updateStudentPassword(student.user.id, activateStudentDto.password)
  	if(!pwUpdateSucceeded){
  		throw new HttpException('Could not activate this account.', HttpStatus.BAD_REQUEST)
  	}
  	//set student as active
  	const isActivated:boolean =await this.studentsService.activateStudent(student.id)
	  if(!isActivated){
  		throw new HttpException('Could not activate this account.', HttpStatus.BAD_REQUEST)
  	}
  	
  	//login
  	student.user.password = activateStudentDto.password
  	return this.authService.login(student.user)

  }
	
}

