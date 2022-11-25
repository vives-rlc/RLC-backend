import {
	Controller,
	Get,
	Post,
	Param,
	UploadedFile,
	UseInterceptors,
	Req,
	UseGuards,
	HttpException,
	HttpStatus,
	Put,
	Patch,
	Body,
	Inject,
	LoggerService,
	NotFoundException,
	BadRequestException,
	ForbiddenException,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
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
import { diskStorage } from 'multer'
import {
	CourseDto,
	CreateCourseDto,
	CreateCourseWithFileUploadDto,
	PatchCourseDto,
	ShowCourseDetailsForStudentDto,
	ShowCourseDetailsForTeacherDto,
	ShowCourseDto,
	ShowCourseWithTeacherDto,
} from '../shared/dtos/course.dto'
import { FileService } from '../shared/files.service'
import { CoursesService } from './courses.service'
import { csvFileFilter, csvFileName } from '../shared/utils/csv'
import { UploadedStudent } from '../shared/interfaces/UploadedStudent'
import { Request, Express } from 'express'
import { CreateStudentDto } from '../shared/dtos/student.dto'
import { StudentsService } from '../students/students.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Role } from '../shared/enums/role.enum'
import { RolesGuard } from '../auth/roles.guard'
import { hasRoles } from '../auth/roles.decorator'
import { TeachersService } from '../teachers/teachers.service'
import { Student } from '../shared/models/student.entity'
import { Course } from '../shared/models/course.entity'
import { plainToInstance, instanceToPlain } from 'class-transformer'
import { ReservationsService } from '../reservations/reservations.service'
import { Lab } from '../shared/models/lab.entity'
import { MailService } from '../mailer/mail.service'
import { LoggedInUserDto } from '../shared/dtos/user.dto'
import { Teacher } from '../shared/models/teacher.entity'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { FileUploadDto } from '../shared/dtos/file.dto'
import { Reservation } from '../shared/models/reservation.entity'
@ApiTags('courses')
@Controller('courses')
//We need to add models manually here that are used as ref in apiresponse schema's, but aren't already exposed in another controller function (not in a complicated schema way)
@ApiExtraModels(ShowCourseDetailsForStudentDto, ShowCourseDetailsForTeacherDto, ShowCourseDto, ShowCourseWithTeacherDto) 
export class CourseController {
	constructor(
    private readonly courseService: CoursesService,
    private readonly studentsService: StudentsService,
    private readonly teacherService: TeachersService,
    private readonly reservationsService: ReservationsService,
    private fileService: FileService,
	private mailService:MailService,
	@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
	) {}
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
  	schema: {
  		type: 'array',
  		items: {
  			oneOf: [
  				{
  					$ref: getSchemaPath(ShowCourseDto),
  				},
  				{ $ref: getSchemaPath(ShowCourseWithTeacherDto) },
  			],
  		},
  	},
  })
  @ApiUnauthorizedResponse({description:'Invalid credentials'})
  @ApiBadRequestResponse({description:'Failed to get courses'})
  @ApiNotFoundResponse({description:'No courses found.'})
  @ApiOperation({ summary: 'Returns all courses, linked to logged in user.' })
  @Get()
	async getAllCoursesForLoggedInUser(@Req() req): Promise<ShowCourseDto[] | ShowCourseWithTeacherDto[]> {
		const loggedInUser:LoggedInUserDto = req.user

		if (loggedInUser.role === Role.admin) {
			
			const courses:Course[] = await this.courseService.getAll()
			if(!courses){
				throw new NotFoundException('Courses not found.')
			}
			const courseDtos: ShowCourseDto[] = courses.map((course) => {
				return plainToInstance(ShowCourseDto, instanceToPlain(course), {
					excludeExtraneousValues: true,
				})
			})
			return courseDtos
		} else if (loggedInUser.role == Role.teacher) {
			
			//get teacher by user id			
			const teacher:Teacher = await this.teacherService.getOneByUserId(
				loggedInUser.id,
			)
			if(!teacher){
				this.logger.log(`Teacher with user id ${loggedInUser.id} tried to access courses, but was not found as a teacher.`)
				throw new BadRequestException('Failed to get courses.')
			}
			//use teacher id to only get courses that are linked to this teacher
			const courses:Course[] = await this.courseService.getAllForTeacher(
				teacher.id,
			)
			if (!courses) {
				throw new NotFoundException('Courses not found.')
			}
			//we can't abstract this (in a decently readable way) because Typescript's reflection system isn't advanced enough.
			const courseDtos: ShowCourseDto[] = courses.map((course) => {
				return plainToInstance(ShowCourseDto, instanceToPlain(course), {
					excludeExtraneousValues: true,
				})
			})
			return courseDtos			
		} else if (loggedInUser.role === Role.student) {
			//get student by user id
			const student:Student = await this.studentsService.getOneByUserId(
				loggedInUser.id,
			)
			if(!student){
				this.logger.log(`Student with user id ${loggedInUser.id} tried to access courses, but was not found as a student.`)
				throw new BadRequestException('Failed to get courses.')
			}
			//use student id to only get courses that are linked to this student
			const courses:Course[] = await this.courseService.getAllForStudent(student.id)
			if (!courses) {
				throw new NotFoundException('Courses not found.')
			}
			//map coureses to dto's
			//for students we want to return the teacher as well
			const courseDtos: ShowCourseWithTeacherDto[] = courses.map((course) => {
				return plainToInstance(
					ShowCourseWithTeacherDto,
					instanceToPlain(course),
					{ excludeExtraneousValues: true },
				)
			})
			return courseDtos
			
		}
	}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  //show the different response options for an ok response in swagger (under the "schema button")
  @ApiOkResponse({
  	schema: {
  		oneOf: [
  			{ $ref: getSchemaPath(CourseDto) },
  			{ $ref: getSchemaPath(ShowCourseDetailsForStudentDto) },
  			{ $ref: getSchemaPath(ShowCourseDetailsForTeacherDto) },
  		],
  	},
  })
  @ApiNotFoundResponse({description:'No course found.'})
  @ApiForbiddenResponse({description:'No access allowed.'})
  @ApiOperation({summary:'Get coursedetails by courseId, based on logged in user', 
  	description:`Teachers get a course object with all labs and students. </br>
	Students get a course object with the teacher, all labs and their own reservations. An empty timeslots list means that this student has no reservation for this lab.`})
  @Get(':id')
  async getCourseByCourseId(
    @Param('id') id: string,
    @Req() req,
  ): Promise<
    CourseDto | ShowCourseDetailsForStudentDto | ShowCourseDetailsForTeacherDto
  > {
  	const loggedInUser:LoggedInUserDto = req.user

	 	if (loggedInUser.role === Role.admin) {
	  		const course = await this.courseService.getOneByCourseId(id)
  			if(!course){
  				throw new NotFoundException(`Course with id ${id} not found.`)
  			}
	  		const courseDto: CourseDto = plainToInstance(
	  			CourseDto,
	  			instanceToPlain(course),
	  			{ excludeExtraneousValues: true },
	  		)
	  		return courseDto
	  	} else if (loggedInUser.role === Role.teacher) {
  			//get course
	  		const course:Course = await this.courseService.getOneByCourseIdForTeacher(id)
			  if(!course){
  				throw new NotFoundException(`Course with id ${id} not found.`)
  			}
  			//check if teacher that send request for course details is linked to this course
  			if(loggedInUser.id !== course.teacher.user.id){
  				throw new ForbiddenException('You have no access to this course.')
  			}
	  		const courseDto: ShowCourseDetailsForTeacherDto = plainToInstance(
	  			ShowCourseDetailsForTeacherDto,
	  			instanceToPlain(course),
	  			{ excludeExtraneousValues: true },
	  		)
	  		return courseDto
	  	} else if (loggedInUser.role === Role.student) {
  			//get course with teacher, labs and students
  			const course:Course = await this.courseService.getOneByCourseIdForStudent(id)
  		if(!course){
  				throw new NotFoundException(`Course with id ${id} not found.`)
  			}
	  		//get student
  		//we get the student so we don't have to get all the user objects for every student in the course
	  		const loggedInStudent:Student = await this.studentsService.getOneByUserId(loggedInUser.id)
  		if(!loggedInStudent ||!course.students.find((student) => student.id === loggedInStudent.id)){
  			this.logger.log(`Student with user id ${loggedInUser.id} tried to access course with id ${id}, but is not a student of this course.`)
  			throw new ForbiddenException('You have no access to this course.')
  		}
	  			//for every lab get timeslots that are reserved by this student
	  			//we can't add this logic in the courseService, by adding the students and reservations relations and then filtering with the student Id
	  			// becuase if a student has no reservations for any labs of this course, then the course will not be returned.
				  const promises:Promise<Lab>[] = course.labs.map(async (lab):Promise<Lab> => {
	  				lab.timeslots = []
	  				const reservations :Reservation [] = await this.reservationsService.getAllForLabAndStudent(lab.id, loggedInStudent.id)
	  				reservations.forEach(reservation => {
	  					lab.timeslots.push(reservation.timeslot)
	  				})
	  				return new Promise((resolve, reject) => {resolve(lab)})
				  
	  			})
				  const labs:Lab[] =	await Promise.all(promises)
				  .then((results) => {
					  return results
				  })
	  			
	  			if(labs){
	  				course.labs = labs
	  			const courseDto: ShowCourseDetailsForStudentDto = plainToInstance(
	  				ShowCourseDetailsForStudentDto,
	  				instanceToPlain(course),
	  				{ excludeExtraneousValues: true },
	  			)

	  			return courseDto
	  			}
	  		}
  }

  @hasRoles(Role.teacher, Role.admin) // only teachers and admins can create courses
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
  	type: CreateCourseWithFileUploadDto,
  })
  @UseInterceptors(
  	FileInterceptor('file', {
  		storage: diskStorage({
  			destination: './uploads/csv',
  			filename: csvFileName,
  		}),
  		fileFilter: csvFileFilter,
  	}),
  )
  @ApiCreatedResponse({ type: ShowCourseDto })
  @ApiBadRequestResponse({description:'Create failed.'})
  @ApiUnauthorizedResponse({description:'Invalid credentials.'})
  @ApiForbiddenResponse({description:'No accesss allowed.'})
  @ApiOperation({summary:'As a teacher or admin, create a new course with students, labs (optional) and timeslots (optional).'})
  @Post()
  async createCourse(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ): Promise<ShowCourseDto> {
  		//FileInterceptor removes body params, so we use @Req instead
  		const loggedInUser:LoggedInUserDto = req.user
  		//create course from req body.
	  	//we have to parse json first, because request is not in application/json format
	  	const course: CreateCourseDto = { ...JSON.parse(req.body.course) }
  		//if the user that creates the course is a teacher, we check if the teacher creates a course for themselves
		
  		if(loggedInUser.role === Role.teacher){
  			const loggedInTeacher:Teacher = await this.teacherService.getOneByUserId(loggedInUser.id)
  			if(loggedInTeacher.id !== course.teacher.id){
  				this.logger.log(`Teacher with id ${loggedInTeacher.id} tried to create a course ${JSON.stringify(course)} for teacher with id ${course.teacher.id}`)
  				throw new ForbiddenException('You have don\'t have access to create this course.')
  			}
  		}
  		//rest of teacher code equals admin code, so we continue from here without a seperation
	  	//create new course in database with labs (with connection and timeslots)
	  	const createdCourse: Course = await this.courseService.createCourse(course)
  		if(!createdCourse){
  			throw new BadRequestException('Failed to create course.')
  		}
	  	//if file is uploaded and course has been saved to db
	
	  	//read file and say what type the lines should become, here UploadedStudent
	  	const students: UploadedStudent[] = await this.fileService.readFile(
	  		UploadedStudent,
	  	)
  		if(!students){
  			throw new BadRequestException(`Could not read file ${file.filename}`)
  		}
	  	//create studentDTo's from file entities
	  	const studentDtos: CreateStudentDto[] =
	      this.studentsService.createStudentDtos(students)

	  	for (const  student of studentDtos) { //can't throw exceptions properly with a foreach loop
			  		//check if student exists
	  		
  				const existingStudent: Student =
	        	await this.studentsService.getOneWithCoursesByStudentNumber(
	          		student.user.number,
	          	)
	  			//if student does not exist, create new student
	  		if (!existingStudent) {
	  			student.courses = [{ id: createdCourse.id }]
	  			const newStudent:Student =await this.studentsService.create(student)
  				if(!newStudent){
  					throw new BadRequestException(`Failed to add new student with number ${student.user.number}`)
  				}
  					
  				//if the newStudent is created, send them an email to activate their account
  				const sendMailHasSucceeded:boolean =await this.mailService.sendMail(newStudent)
  				if(!sendMailHasSucceeded){
  					throw new BadRequestException(`Failed to send email to student with number ${newStudent.user.number}`)
  				}
  			} else {
	  			//if student exists, add course to student
	  			const updateStudentHasSucceeded:boolean =await this.studentsService.updateStudentWithCourse(
	  				existingStudent,
	  				createdCourse.id,
	  			)
  				if(!updateStudentHasSucceeded){
  					throw new BadRequestException('Failed to add course to existing student.')
  				}
	  		}
  			
	  	}
  	
	  	
	  	const newCourse: ShowCourseDto = plainToInstance(
	  		ShowCourseDto,
	  		instanceToPlain(createdCourse),
	  		//this is true so that we only return the properties in the dto
	  		//and not everything in the entity
	  		{ excludeExtraneousValues: true },
	  	)
	  	return newCourse
  }

  @hasRoles(Role.teacher, Role.admin) // only teachers and admins can create courses
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Put(':id/students')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
  	type: FileUploadDto})
  @UseInterceptors(
  	FileInterceptor('file', {
  		storage: diskStorage({
  			destination: './uploads/csv',
  			filename: csvFileName,
  		}),
  		fileFilter: csvFileFilter,
  	}),
  )
	@ApiCreatedResponse({ type: ShowCourseDto, status:201, description:'Course updated with students.' })
	@ApiBadRequestResponse({description:'Update failed.'})
	@ApiUnauthorizedResponse({description:'Invalid credentials.'})
	@ApiForbiddenResponse({description:'Access not allowed.'})
	@ApiNotFoundResponse({description:'Course not found.'})
	@ApiOperation({summary:'As a teacher or admin, update an existing course with new students.',
  	description:`Admins can update any course with students. </br>
		Teachers can only update their own courses with students.`})
  async updateCourseWithStudents(
    @UploadedFile() file: Express.Multer.File,
	@Param('id') id:string, //needs to be typed as string or swagger won't recognize it
	@Req() req
  ): Promise<ShowCourseDto> {
  	const loggedInUser: LoggedInUserDto = req.user
  	//FileInterceptor removes body params, so we use @Req instead

  	//check if course exists.
  	const course:Course = await this.courseService.getOneWithTeacherRelationByCourseId(id)
  	
  	if (!course) {
  		this.logger.log(`User with id ${loggedInUser.id} tried to access an non-existing course with id ${id}`)
  		throw new NotFoundException(`Course with id ${id} not found.`)
  	}
  	//if loggedinUser is teacher
  	if(loggedInUser.role === Role.teacher){
  		//check if teacher that made request is linked to this course
  		if(course.teacher.user.id !==loggedInUser.id){
  		this.logger.log(`Teacher with user id ${req.user.id} tried to edit course from teacher with user id ${course.teacher.user.id}`)
  		throw new HttpException('You\re not allowed to add students to this course.', HttpStatus.FORBIDDEN)
  		}
  	}
  	//rest of teacher code equals admin code, so we continue from here without a seperation
  	//read file
  	const students: UploadedStudent[] = await this.fileService.readFile(UploadedStudent)
  	if(!students){
  		throw new BadRequestException(`Could not read file ${file.filename}`)
  	}
  	//create studentDTo's from file entities
  	const studentDtos: CreateStudentDto[] = this.studentsService.createStudentDtos(students)
  	studentDtos.forEach(async (student) => {
	  		//check if student exists
	  		const existingStudent: Student = await this.studentsService.getOneWithCoursesByStudentNumber(student.user.number)
	  		//if student does not exist, create new student
	  		if (!existingStudent) {
	  			student.courses = [{ id: course.id }]
	  			const newStudent:Student =await this.studentsService.create(student)
  				if(!newStudent){
  					throw new BadRequestException(`Failed to add new student with number ${student.user.number}`)
  				}
  				const sendMailHasSucceeded:boolean = await this.mailService.sendMail(newStudent)
  				if(!sendMailHasSucceeded){
  					throw new BadRequestException(`Failed to send email to student with number ${newStudent.user.number}`)
  				}	  
	  		} else {
	  			//if student exists, add course to student
	  			const updateSucceeded:boolean =await this.studentsService.updateStudentWithCourse(
	  				existingStudent,
	  				course.id,
	  						)
  				if(!updateSucceeded){
  					throw new BadRequestException('Failed to add course to existing student.')
  				}
	  		}
						
	  	})
				
  	const updatedCourse: ShowCourseDto = plainToInstance(
  		ShowCourseDto,
  		instanceToPlain(course),
  		//this is true so that we only return the properties in the dto
  		//and not everything in the entity
  		{ excludeExtraneousValues: true },
  	)
  	return updatedCourse
  	
  }

  @hasRoles(Role.teacher, Role.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({summary:'Patch course with new name.', 
  	description:`Admins can patch the name of any course. </br>
		Teachers can patch the name of any course that they are linked to.`})
  @ApiOkResponse({description:'Patch succeeded.', type:ShowCourseDto})
  @ApiBadRequestResponse({description:'Patch failed.'})
  @ApiForbiddenResponse({description:'Access forbidden.'})
  @ApiUnauthorizedResponse({description:'Invalid credentials.'})
  @ApiNotFoundResponse({description:'Course not found.'})
  @Patch(':id')
  async patchCourseName(@Param('id') id:string, @Body() patchCourseDto:PatchCourseDto, @Req() req):Promise<ShowCourseDto>{
  	const loggedInUser:LoggedInUserDto = req.user
  	//check if course exists
  	const course:Course = await this.courseService.getOneWithTeacherRelationByCourseId(id)
  	if (!course) {
  		this.logger.log(`User with id ${loggedInUser.id} tried to access an non-existing course with id ${id}`)
  		throw new NotFoundException(`Course with id ${id} not found.`)
  	}
  	//if loggedinUser is teacher
  	if(loggedInUser.role === Role.teacher){
  		//check if teacher that made request is linked to this course
  		if(loggedInUser.id !== course.teacher.user.id){
  			this.logger.log(`Teacher with user id ${req.user.id} tried to edit course from teacher with user id ${course.teacher.user.id}`)
  			throw new HttpException('You don\t have access to patch this course.', HttpStatus.FORBIDDEN)
  		}
  	}
  	//rest of teacher code equals admin code, so we continue from here without a seperation
  	//update course with name
  	const updateSucceeded: boolean= await this.courseService.patchCourseName(id, patchCourseDto)
  	if (!updateSucceeded) {
  		throw new HttpException(`Patch for course with courseId ${id} failed.`, HttpStatus.BAD_REQUEST)
  	}
  	//return updated course
  	const updatedCourse:ShowCourseDto = {id:id, name:patchCourseDto.name}
  	return updatedCourse
  }
}
