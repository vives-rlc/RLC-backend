import { BadRequestException, ForbiddenException, HttpException, LoggerService, NotFoundException } from '@nestjs/common'
import { MailService } from '../mailer/mail.service'
import { ReservationsService } from '../reservations/reservations.service'
import { FileService } from '../shared/files.service'
import { Course } from '../shared/models/course.entity'
import { StudentsService } from '../students/students.service'
import { TeachersService } from '../teachers/teachers.service'
import { Repository } from 'typeorm'
import { CourseController } from './courses.controller'
import { CoursesService } from './courses.service'
import { Test, TestingModule } from '@nestjs/testing'
import { WinstonModule } from 'nest-winston'
import * as winston from 'winston'
import { mockCourse, mockCreateCourseDto, mockShowcourseDto, mockValidCourseDto, 
	mockValidShowCourseDetailsForStudentDto, mockValidShowCourseDetailsForStudentWithoutReservationsDto, mockValidShowCourseDetailsForTeacherDto } from '../shared/mocks/mockCourse'
import { mockAdminUserToken, mockStudentUserToken, mockTeacherUserToken } from '../shared/mocks/mockJWTService'
import { mockAdminUser } from '../shared/mocks/mockAdmin'
import { getRepositoryToken } from '@nestjs/typeorm'
import { UsersService } from '../users/users.service'
import { User } from '../shared/models/user.entity'
import { Student } from '../shared/models/student.entity'
import { Reservation } from '../shared/models/reservation.entity'
import { Teacher } from '../shared/models/teacher.entity'
import { CsvModule } from 'nest-csv-parser'
import { MailerModule, MailerService } from '@nestjs-modules/mailer'
import { mockTeacher, mockTeacherUser } from '../shared/mocks/mockTeacher'
import { mockStudent, mockStudentUser, mockUploadedStudent } from '../shared/mocks/mockStudent'
import { mockLab } from '../shared/mocks/mockLab'
import { mockNewReservationNoCircularRelations } from '../shared/mocks/mockReservation'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { join } from 'path'
import { Readable } from 'stream'

describe('Course controller', () => {
	let courseController: CourseController
	let courseService: CoursesService
	let studentsService: StudentsService
	let teachersService: TeachersService
	let reservationsService: ReservationsService
	let fileService: FileService
	let mailService: MailService
	let logger: LoggerService
	let coursesRepository: Repository<Course>
	const invalidCourseId = '1'
	const mockFile: Express.Multer.File ={
		fieldname: '',
		originalname: '',
		encoding: '',
		mimetype: '',
		size: 0,
		stream: new Readable,
		destination: '',
		filename: '',
		path: '',
		buffer: undefined
	}
	const invalidTeacherId = '1'
	beforeEach(async () => {
	//	courseController = new CourseController(courseService, studentsService, teachersService, reservationsService, fileService, mailService, logger)
		//courseService = new CoursesService(coursesRepository, logger)

		const module:TestingModule = await Test.createTestingModule({
			imports:[ 	WinstonModule.forRoot({transports:
				new winston.transports.File({
					filename: 'logs/test.log', 
				})}), CsvModule, MailerModule.forRootAsync({
				imports: [ConfigModule],
				useFactory: async (config: ConfigService) => ({
					  transport: {
						host: config.get('EMAIL_HOST'),
						secure: false,
						auth: {
						  user: config.get('EMAIL_USER'),
						  pass: config.get('EMAIL_PASSWORD'),
						},
					  },
					  defaults: {
						from: 'em6494@goomyx.com' // this is the validated sender adres that is linked to the sendgrid account
					  },
					  template: {
						dir: join(__dirname, './mailer/templates'),
						adapter: new HandlebarsAdapter(),
						options: {
						  strict: true
						}
					  }
				}),
				inject: [ConfigService]
			}),],
			controllers:[CourseController],
			providers:[CoursesService, 
				{
					provide:getRepositoryToken(Course),
					useValue:{}
				},
				UsersService, 
				{
					provide:getRepositoryToken(User),
					useValue:{}
				},
				StudentsService,
				{
					provide:getRepositoryToken(Student),
					useValue:{}
				},
				TeachersService,
				{
					provide:getRepositoryToken(Teacher),
					useValue:{}
				},
				ReservationsService,
				{
					provide:getRepositoryToken(Reservation),
					useValue:{}
				},
				FileService,
				MailService]
		}).compile()
		courseController = module.get<CourseController>(CourseController)
		courseService = module.get<CoursesService>(CoursesService)
		studentsService = module.get<StudentsService>(StudentsService)
		reservationsService = module.get<ReservationsService>(ReservationsService)
		fileService = module.get<FileService>(FileService)
		mailService = module.get<MailService>(MailService)
		teachersService =module.get<TeachersService>(TeachersService)
	})
	it('CoursesController should be defined', () => {
		expect(courseController).toBeDefined()
	})
	it('CoursesService should be defined', () => {
		expect(courseService).toBeDefined()
	})
	it('StudentsService should be defined', () => {
		expect(studentsService).toBeDefined()
	})
	it('StudentsService should be defined', () => {
		expect(reservationsService).toBeDefined()
	})
	it('FileService should be defined', () => {
		expect(fileService).toBeDefined()
	})
	it('MailService should be defined', () => {
		expect(mailService).toBeDefined()
	})
	it('TeachersService should be defined', () => {
		expect(teachersService).toBeDefined()
	})
	// 	describe('create course', () => {
	// 		it('should return course name and id', async () => {
	// 			const result = {
				
	// 			}
	// 		})
	// 	})
	describe('getCourseByCourseId', () => {
	//test admin side
		it('Should return a CourseDTO for the admin user', async ()=> {
			jest.spyOn(courseService, 'getOneByCourseId').mockImplementation(async (id) => {
				if(id === mockCourse.id){
					return mockCourse
				}else {
					return null
				}
			})
			expect(await courseController.getCourseByCourseId(mockCourse.id, {
				headers:{
					authentication: `Bearer ${mockAdminUserToken}`
				},user:{
					number: mockAdminUser.number,
					role:mockAdminUser.role,
					id:mockAdminUser.id
				}
			})).toEqual(mockValidCourseDto)
		})
		it('Should not find a course and return a 404 for the admin user', async ()=> {
			jest.spyOn(courseService, 'getOneByCourseId').mockImplementation(async (id) => {
				if(id === mockCourse.id){
					return mockCourse
				}else {
					return null
				}
			})
			await courseController.getCourseByCourseId(invalidCourseId, {
				headers:{
					authentication: `Bearer ${mockAdminUserToken}`
				},user:{
					number: mockAdminUser.number,
					role:mockAdminUser.role,
					id:mockAdminUser.id
				}
			}).catch(error => {
				expect(error).toBeInstanceOf(NotFoundException)
				expect (error.message).toBe(`Course with id ${invalidCourseId} not found.`)
				expect(error.status).toBe(404)
			})
		})

		//test teacher side
		it('Should return a ShowCourseDetailsForTeacherDto for the teacher user', async ()=> {
			jest.spyOn(courseService, 'getOneByCourseIdForTeacher').mockImplementation(async (id) => {
				if(id === mockCourse.id){
					return mockCourse
				}else {
					return null
				}
			})
			expect(await courseController.getCourseByCourseId(mockCourse.id, {
				headers:{
					authentication: `Bearer ${mockTeacherUserToken}`
				},user:{
					number: mockTeacherUser.number,
					role:mockTeacherUser.role,
					id:mockTeacherUser.id
				}
			})).toEqual(mockValidShowCourseDetailsForTeacherDto)
		})
		it('Should not find course and return 404 for teacher user', async ()=> {
			jest.spyOn(courseService, 'getOneByCourseIdForTeacher').mockImplementation(async (id) => {
				if(id === mockCourse.id){
					return mockCourse
				}else {
					return null
				}
			})
			expect(await courseController.getCourseByCourseId(invalidCourseId, {
				headers:{
					authentication: `Bearer ${mockTeacherUserToken}`
				},user:{
					number: mockTeacherUser.number,
					role:mockTeacherUser.role,
					id:mockTeacherUser.id
				}
			}).catch(error => {
				expect(error).toBeInstanceOf(HttpException)
				expect (error.message).toBe(`Course with id ${invalidCourseId} not found.`)
				expect(error.status).toBe(404)
			}))
		})
		it('Teacher should not be allowed access and return a 403', async ()=> {
			jest.spyOn(courseService, 'getOneByCourseIdForTeacher').mockImplementation(async (id) => {
				if(id === mockCourse.id){
					return mockCourse
				}else {
					return null
				}
			})
			expect(await courseController.getCourseByCourseId(mockCourse.id, {
				headers:{
					authentication: `Bearer ${mockTeacherUserToken}`
				},user:{
					number: mockTeacherUser.number,
					role:mockTeacherUser.role,
					id:'invalidTeacherId'
				}
			}).catch(error => {
				expect(error).toBeInstanceOf(HttpException)
				expect (error.message).toBe('You have no access to this course.')
				expect(error.status).toBe(403)
			}))
		})
		//test student side
		it('Should return a ShowCourseDetailsForStudentDto for the student user', async ()=> {
			jest.spyOn(courseService, 'getOneByCourseIdForStudent').mockImplementation(async (id) => {
				if(id === mockCourse.id){
					return mockCourse
				}else {
					return null
				}
			})
			jest.spyOn(studentsService, 'getOneByUserId').mockImplementation(async (id) => {
				if(id === mockStudentUser.id){
					return mockStudent
				}else {
					return null
				}
			})
			jest.spyOn(reservationsService, 'getAllForLabAndStudent').mockImplementation(
				async (labId, studentId) => {
					if(labId === mockLab.id && studentId === mockStudent.id){
						return [mockNewReservationNoCircularRelations]
					} else {return []}
				})
			
			expect(await courseController.getCourseByCourseId(mockCourse.id, {
				headers:{
					authentication: `Bearer ${mockStudentUserToken}`
				},user:{
					number: mockStudentUser.number,
					role:mockStudentUser.role,
					id:mockStudentUser.id,
					

				}
			})).toEqual(mockValidShowCourseDetailsForStudentDto)
			
		})
		it('Should not find a course and return a 404 for the student user', async ()=> {
			jest.spyOn(courseService, 'getOneByCourseIdForStudent').mockImplementation(async (id) => {
				if(id === mockCourse.id){
					return mockCourse
				}else {
					return null
				}
			})
			jest.spyOn(studentsService, 'getOneByUserId').mockImplementation(async (id) => {
				if(id === mockStudentUser.id){
					return mockStudent
				}else {
					return null
				}
			})
			jest.spyOn(reservationsService, 'getAllForLabAndStudent').mockImplementation(
				async (labId, studentId) => {	
					if(labId === mockLab.id && studentId === mockStudent.id){
						return [mockNewReservationNoCircularRelations]
					} else {return []}
				})
			
			await courseController.getCourseByCourseId(invalidCourseId, {
				headers:{
					authentication: `Bearer ${mockStudentUserToken}`
				},user:{
					number: mockStudentUser.number,
					role:mockStudentUser.role,
					id:mockStudentUser.id,
					

				}
			}).catch(error => {
				expect(error).toBeInstanceOf(NotFoundException)
				expect (error.message).toBe(`Course with id ${invalidCourseId} not found.`)
				expect(error.status).toBe(404)
			})
			
		})
		it('Should not allow access to the student user and return a 403', async ()=> {
			jest.spyOn(courseService, 'getOneByCourseIdForStudent').mockImplementation(async (id) => {
				if(id === mockCourse.id){
					return mockCourse
				}else {
					return null
				}
			})
			jest.spyOn(studentsService, 'getOneByUserId').mockImplementation(async (id) => {
				if(id === mockStudentUser.id){
					return mockStudent
				}else {
					return null
				}
			})
			jest.spyOn(reservationsService, 'getAllForLabAndStudent').mockImplementation(
				async (labId, studentId) => {	
					if(labId === mockLab.id && studentId === mockStudent.id){
						return [mockNewReservationNoCircularRelations]
					} else {return []}
				})
			
			await courseController.getCourseByCourseId(mockCourse.id, {
				headers:{
					authentication: `Bearer ${mockStudentUserToken}`
				},user:{
					number: mockStudentUser.number,
					role:mockStudentUser.role,
					id:'invalidStudentId',
					

				}
			}).catch(error => {
				expect(error).toBeInstanceOf(ForbiddenException)
				expect (error.message).toBe('You have no access to this course.')
				expect(error.status).toBe(403)
			})
			
		})
		it('Should return course with empty timeslot array for student user', async ()=> {
			jest.spyOn(courseService, 'getOneByCourseIdForStudent').mockImplementation(async (id) => {
				if(id === mockCourse.id){
					return mockCourse
				}else {
					return null
				}
			})
			jest.spyOn(studentsService, 'getOneByUserId').mockImplementation(async (id) => {
				if(id === mockStudentUser.id){
					return mockStudent
				}else {
					return null
				}
			})
			jest.spyOn(reservationsService, 'getAllForLabAndStudent').mockImplementation(
				async (labId, studentId) => {	
					return []
				})
			
			expect(await courseController.getCourseByCourseId(mockCourse.id, {
				headers:{
					authentication: `Bearer ${mockStudentUserToken}`
				},user:{
					number: mockStudentUser.number,
					role:mockStudentUser.role,
					id:mockStudentUser.id,
					

				}
			})).toEqual(mockValidShowCourseDetailsForStudentWithoutReservationsDto)
			
		})
	})
	describe('createCourse', () => {
		//admin
		it('Should create a new course and new student and return a ShowCourseDTO for the admin user', async ()=> {
			jest.spyOn(courseService, 'createCourse').mockImplementation(async (object) => {
				return mockCourse
			})
			jest.spyOn(fileService, 'readFile').mockImplementation(async(type) => {
				return [mockUploadedStudent]
			})
			jest.spyOn(studentsService, 'create').mockImplementation(async (object) => {
				return mockStudent
			})
			jest.spyOn(mailService, 'sendMail').mockImplementation(async (object) => {
				return true
			})
			expect(await courseController.createCourse(mockFile, {
				headers:{
					authentication: `Bearer ${mockAdminUserToken}`
				},
				user:{
					number: mockAdminUser.number,
					role:mockAdminUser.role,
					id:mockAdminUser.id
				},
				body:{
					
					course:JSON.stringify(mockCreateCourseDto)
				}
			})).toEqual(mockShowcourseDto)
		})
		it('Should create a new course and update a student and return a ShowCourseDTO for the admin user', async ()=> {
			jest.spyOn(courseService, 'createCourse').mockImplementation(async (object) => {
				return mockCourse
			})
			jest.spyOn(fileService, 'readFile').mockImplementation(async(type) => {
				return [mockUploadedStudent]
			})
			jest.spyOn(studentsService, 'getOneWithCoursesByStudentNumber').mockImplementation(async (object) => {
				return mockStudent
			})
			jest.spyOn(studentsService, 'updateStudentWithCourse').mockImplementation(async (object,id) => {
				return true
			})
			expect(await courseController.createCourse(mockFile, {
				headers:{
					authentication: `Bearer ${mockAdminUserToken}`
				},
				user:{
					number: mockAdminUser.number,
					role:mockAdminUser.role,
					id:mockAdminUser.id
				},
				body:{
					
					course:JSON.stringify(mockCreateCourseDto)
				}
			})).toEqual(mockShowcourseDto)
		})
		//teacher
		it('Should return a ShowCourseDTO for the teacher user', async ()=> {
			jest.spyOn(teachersService, 'getOneByUserId').mockImplementation(async(id) => {
				if(id ===mockTeacherUser.id){
					return mockTeacher
				}else{
					return null
				}
			})
			jest.spyOn(courseService, 'createCourse').mockImplementation(async (object) => {
				return mockCourse
			})
			jest.spyOn(fileService, 'readFile').mockImplementation(async(type) => {
				return [mockUploadedStudent]
			})
			jest.spyOn(studentsService, 'create').mockImplementation(async (object) => {
				return mockStudent
			})
			jest.spyOn(mailService, 'sendMail').mockImplementation(async (object) => {
				return true
			})
			expect(await courseController.createCourse(mockFile, {
				headers:{
					authentication: `Bearer ${mockTeacherUserToken}`
				},
				user:{
					number: mockTeacherUser.number,
					role:mockTeacherUser.role,
					id:mockTeacherUser.id
				},
				body:{
					
					course:JSON.stringify(mockCreateCourseDto)
				}
			})).toEqual(mockShowcourseDto)
		})
		it('Should not allow access for teacher user and return a 403', async ()=> {
			jest.spyOn(teachersService, 'getOneByUserId').mockImplementation(async(id) => {
				if(id ===mockTeacherUser.id){
					return mockTeacher
				}else{
					mockTeacher.id = invalidTeacherId
					return mockTeacher
				}
			})
			jest.spyOn(courseService, 'createCourse').mockImplementation(async (object) => {
				return mockCourse
			})
			jest.spyOn(fileService, 'readFile').mockImplementation(async(type) => {
				return [mockUploadedStudent]
			})
			jest.spyOn(studentsService, 'create').mockImplementation(async (object) => {
				return mockStudent
			})
			jest.spyOn(mailService, 'sendMail').mockImplementation(async (object) => {
				return true
			})
			expect(await courseController.createCourse(mockFile, {
				headers:{
					authentication: `Bearer ${mockTeacherUserToken}`
				},
				user:{
					number: mockTeacherUser.number,
					role:mockTeacherUser.role,
					id:invalidTeacherId
				},
				body:{
					
					course:JSON.stringify(mockCreateCourseDto)
				}
			}).catch(error => {
				expect(error).toBeInstanceOf(ForbiddenException)
				expect (error.message).toBe('You have don\'t have access to create this course.')
				expect(error.status).toBe(403)
			}))
		})
		//both roles
		it('Should fail to create a course and return a 400', async ()=> {
			jest.spyOn(courseService, 'createCourse').mockImplementation(async (object) => {
				return null
			})
			jest.spyOn(fileService, 'readFile').mockImplementation(async(type) => {
				return [mockUploadedStudent]
			})
			jest.spyOn(studentsService, 'create').mockImplementation(async (object) => {
				return mockStudent
			})
			jest.spyOn(mailService, 'sendMail').mockImplementation(async (object) => {
				return true
			})
			expect(await courseController.createCourse(mockFile, {
				headers:{
					authentication: `Bearer ${mockAdminUserToken}`
				},
				user:{
					number: mockAdminUser.number,
					role:mockAdminUser.role,
					id:mockAdminUser.id
				},
				body:{
					
					course:JSON.stringify(mockCreateCourseDto)
				}
			}).catch(error => {
				expect(error).toBeInstanceOf(BadRequestException)
				expect (error.message).toBe('Failed to create course.')
				expect(error.status).toBe(400)
			}))
		})
		it('Should not get students from file and return a 400', async ()=> {
			jest.spyOn(courseService, 'createCourse').mockImplementation(async (object) => {
				return mockCourse
			})
			jest.spyOn(fileService, 'readFile').mockImplementation(async(type) => {
				mockFile.filename='InvalidFileName'
				return null
			})
			jest.spyOn(studentsService, 'create').mockImplementation(async (object) => {
				return mockStudent
			})
			jest.spyOn(mailService, 'sendMail').mockImplementation(async (object) => {
				return true
			})
			expect(await courseController.createCourse(mockFile, {
				headers:{
					authentication: `Bearer ${mockAdminUserToken}`
				},
				user:{
					number: mockAdminUser.number,
					role:mockAdminUser.role,
					id:mockAdminUser.id
				},
				body:{
					
					course:JSON.stringify(mockCreateCourseDto)
				}
			}).catch(error => {
				expect(error).toBeInstanceOf(HttpException)
				expect (error.message).toBe(`Could not read file ${mockFile.filename}`)
				expect(error.status).toBe(400)
			}))
		})
		it('Should fail to create a new student and return a 400', async ()=> {
			jest.spyOn(courseService, 'createCourse').mockImplementation(async (object) => {
				return mockCourse
			})
			jest.spyOn(fileService, 'readFile').mockImplementation(async(type) => {
				return [mockUploadedStudent]
			})
			jest.spyOn(studentsService, 'create').mockImplementation(async (object) => {
				return null
			})
			jest.spyOn(mailService, 'sendMail').mockImplementation(async (object) => {
				return true
			})
			await courseController.createCourse(mockFile, {
				headers:{
					authentication: `Bearer ${mockAdminUserToken}`
				},
				user:{
					number: mockAdminUser.number,
					role:mockAdminUser.role,
					id:mockAdminUser.id
				},
				body:{
				
					course:JSON.stringify(mockCreateCourseDto)
				}
			}).catch(error => {
				expect(error).toBeInstanceOf(HttpException)
				expect (error.message).toBe(`Failed to add new student with number ${mockStudentUser.number}`)
				expect(error.status).toBe(400)
			})
		})
		it('Should fail to send an email and return a 400', async ()=> {
			jest.spyOn(courseService, 'createCourse').mockImplementation(async (object) => {
				return mockCourse
			})
			jest.spyOn(fileService, 'readFile').mockImplementation(async(type) => {
				return [mockUploadedStudent]
			})
			jest.spyOn(studentsService, 'create').mockImplementation(async (object) => {
				return mockStudent
			})
			jest.spyOn(mailService, 'sendMail').mockImplementation(async (object) => {
				return false
			})
			await courseController.createCourse(mockFile, {
				headers:{
					authentication: `Bearer ${mockAdminUserToken}`
				},
				user:{
					number: mockAdminUser.number,
					role:mockAdminUser.role,
					id:mockAdminUser.id
				},
				body:{
				
					course:JSON.stringify(mockCreateCourseDto)
				}
			}).catch(error => {
				expect(error).toBeInstanceOf(HttpException)
				expect (error.message).toBe(`Failed to send email to student with number ${mockStudentUser.number}`)
				expect(error.status).toBe(400)
			})
		})
		it('Should create a new course and fail to update a student and return a 400', async ()=> {
			jest.spyOn(courseService, 'createCourse').mockImplementation(async (object) => {
				return mockCourse
			})
			jest.spyOn(fileService, 'readFile').mockImplementation(async(type) => {
				return [mockUploadedStudent]
			})
			jest.spyOn(studentsService, 'getOneWithCoursesByStudentNumber').mockImplementation(async (object) => {
				return mockStudent
			})
			jest.spyOn(studentsService, 'updateStudentWithCourse').mockImplementation(async (object,id) => {
				return false
			})
			expect(await courseController.createCourse(mockFile, {
				headers:{
					authentication: `Bearer ${mockAdminUserToken}`
				},
				user:{
					number: mockAdminUser.number,
					role:mockAdminUser.role,
					id:mockAdminUser.id
				},
				body:{
				
					course:JSON.stringify(mockCreateCourseDto)
				}
			}).catch(error => {
				expect(error).toBeInstanceOf(HttpException)
				expect (error.message).toBe('Failed to add course to existing student.')
				expect(error.status).toBe(400)
			}))
		})
	})
})