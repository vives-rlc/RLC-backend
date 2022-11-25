import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { WinstonModule } from 'nest-winston'
import { User } from '../shared/models/user.entity'
import { UsersService } from '../users/users.service'
import * as winston from 'winston'
import { LabController } from './labs.controller'
import { LabsService } from './labs.service'
import { Lab } from '../shared/models/lab.entity'
import { Connection } from '../shared/models/connection.entity'
import { TimeslotService } from '../timeslots/timeslots.service'
import { Timeslot } from '../shared/models/timeslot.entity'
import { CoursesService } from '../courses/courses.service'
import { Course } from '../shared/models/course.entity'
import { ReservationsService } from '../reservations/reservations.service'
import { Reservation } from '../shared/models/reservation.entity'
import { TeachersService } from '../teachers/teachers.service'
import { Teacher } from '../shared/models/teacher.entity'
import { mockLab, mockShowLabWithConnectionDto, mockUpdateLabDto } from '../shared/mocks/mockLab'
import { mockAdminUser } from '../shared/mocks/mockAdmin'
import { mockAdminUserToken, mockTeacherUserToken } from '../shared/mocks/mockJWTService'
import { BadRequestException, HttpException } from '@nestjs/common'
import { mockTeacher, mockTeacherUser } from '../shared/mocks/mockTeacher'

describe('Labs Controller', () => {
	let labController:LabController
	let labsService:LabsService
	let teachersService:TeachersService
	const invalidLabid ='1'
	beforeEach(async() => {
		const module:TestingModule = await Test.createTestingModule({
			imports:[ 	WinstonModule.forRoot({transports:
				new winston.transports.File({
					filename: 'logs/test.log', 
				})})],
			controllers:[LabController],
			providers:[UsersService, {
				provide: getRepositoryToken(User),
				useValue:{}
			},
			LabsService,
			{
				provide:getRepositoryToken(Lab),
				useValue:{}
			},{
				provide: getRepositoryToken(Connection),
				useValue:{}
			},
			TimeslotService,
			{
				provide: getRepositoryToken(Timeslot),
				useValue: {}
			},
			CoursesService,
			{
				provide:getRepositoryToken(Course),
				useValue:{}
			},
			ReservationsService,
			{
				provide:getRepositoryToken(Reservation),
				useValue:{}
			},
			TeachersService,
			{
				provide:getRepositoryToken(Teacher),
				useValue:{}
			}	
			]
		}).compile()
		labController = module.get<LabController>(LabController)
		labsService = module.get<LabsService>(LabsService)
		teachersService = module.get<TeachersService>(TeachersService)
	})
	it('LabController should be defined', () => {
		expect(labController).toBeDefined()
	})
	it('LabsService should be defined', () => {
		expect(labsService).toBeDefined()
	})
	it('TeachersService should be defined', () => {
		expect(teachersService).toBeDefined()
	})
	describe('updateLabWithConnection', () => {
	
		//admin side
		it('Should update lab and return ShowLabWithConnectionDto', async () => {
			jest.spyOn(labsService, 'getLabById').mockImplementation(async(id) => {
				if(id === mockLab.id){
					return mockLab
				}else{return null}
			})
			jest.spyOn(labsService, 'update').mockImplementation(async () => {
				return true
			})
			expect(await labController.updateLabWithConnection(mockLab.id, mockUpdateLabDto, {
				headers:{
					authentication: `Bearer ${mockAdminUserToken}`
				},user:{
					number: mockAdminUser.number,
					role:mockAdminUser.role,
					id:mockAdminUser.id
				}
			})).toEqual(mockShowLabWithConnectionDto)
		})

		//teacher side
		it('Should update lab and return ShowLabWithConnectionDto', async () => {
			jest.spyOn(labsService, 'getLabById').mockImplementation(async(id) => {
				if(id === mockLab.id){
					return mockLab
				}else{return null}
			})
			jest.spyOn(teachersService, 'getOneByLabId').mockImplementation(async (id) => {
				
				if(mockLab.id === id){
					return mockTeacher
				}else{
					return null
				}
			})
			jest.spyOn(labsService, 'update').mockImplementation(async () => {
				return true
			})
			expect(await labController.updateLabWithConnection(mockLab.id, mockUpdateLabDto, {
				headers:{
					authentication: `Bearer ${mockTeacherUserToken}`
				},user:{
					number: mockTeacherUser.number,
					role:mockTeacherUser.role,
					id:mockTeacherUser.id
				}
			})).toEqual(mockShowLabWithConnectionDto)
		})
		it('Should not allow teacher access and return 403', async () => {
			jest.spyOn(labsService, 'getLabById').mockImplementation(async(id) => {
				if(id === mockLab.id){
					return mockLab
				}else{return null}
			})
			jest.spyOn(teachersService, 'getOneByLabId').mockImplementation(async (id) => {
				
				if(mockLab.id === id){
					return mockTeacher
				}else{
					return null
				}
			})
			jest.spyOn(labsService, 'update').mockImplementation(async () => {
				return true
			})
			expect(await labController.updateLabWithConnection(mockLab.id, mockUpdateLabDto, {
				headers:{
					authentication: `Bearer ${mockTeacherUserToken}`
				},user:{
					number: mockTeacherUser.number,
					role:mockTeacherUser.role,
					id:'invalidTeacherId'
				}
			}).catch((error)=> {
				expect(error).toBeInstanceOf(HttpException)
				expect (error.message).toBe('You don\t have access to this lab.')
				expect(error.status).toBe(403)
			}))
		})
		//both
		it('Should not find a lab and return a 404', async () => {
			jest.spyOn(labsService, 'getLabById').mockImplementation(async(id) => {
				if(id === mockLab.id){
					return mockLab
				}else{return null}
			})
			expect(await labController.updateLabWithConnection(invalidLabid, mockUpdateLabDto, {
				headers:{
					authentication: `Bearer ${mockAdminUserToken}`
				},user:{
					number: mockAdminUser.number,
					role:mockAdminUser.role,
					id:mockAdminUser.id
				}
			}).catch((error)=> {
				expect(error).toBeInstanceOf(HttpException)
				expect (error.message).toBe(`Could not find lab with id: ${invalidLabid}.`)
				expect(error.status).toBe(404)
			}))
		})
		it('Should not match connection ids and return a 400', async () => {
			jest.spyOn(labsService, 'getLabById').mockImplementation(async(id) => {
				if(id === mockLab.id){
					mockLab.connection.id = 'invalidConnectionId'
					return mockLab
				}else{return null}
			})
			expect(await labController.updateLabWithConnection(mockLab.id, mockUpdateLabDto, {
				headers:{
					authentication: `Bearer ${mockAdminUserToken}`
				},user:{
					number: mockAdminUser.number,
					role:mockAdminUser.role,
					id:mockAdminUser.id
				}
			}).catch((error)=> {
				expect(error).toBeInstanceOf(BadRequestException)
				expect (error.message).toBe(`Failed to update lab with id: ${mockLab.id}.`)
				expect(error.status).toBe(400)
			}))
		})
		it('Should fail to update and return 400', async () => {
			jest.spyOn(labsService, 'getLabById').mockImplementation(async(id) => {
				if(id === mockLab.id){
					return mockLab
				}else{return null}
			})
			jest.spyOn(labsService, 'update').mockImplementation(async () => {
				return false
			})
			expect(await labController.updateLabWithConnection(mockLab.id, mockUpdateLabDto, {
				headers:{
					authentication: `Bearer ${mockAdminUserToken}`
				},user:{
					number: mockAdminUser.number,
					role:mockAdminUser.role,
					id:mockAdminUser.id
				}
			}).catch((error)=> {
				expect(error).toBeInstanceOf(HttpException)
				expect (error.message).toBe(`Failed to update lab with id: ${mockLab.id}.`)
				expect(error.status).toBe(400)
			}))
		})
	})
})