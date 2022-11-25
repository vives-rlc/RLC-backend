import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { WinstonModule } from 'nest-winston'
import { TimeslotService } from '../timeslots/timeslots.service'
import * as winston from 'winston'
import { Reservation } from '../shared/models/reservation.entity'
import { ReservationsController } from './reservations.controller'
import { ReservationsService } from './reservations.service'
import { Timeslot } from '../shared/models/timeslot.entity'
import { StudentsService } from '../students/students.service'
import { Student } from '../shared/models/student.entity'
import { mockNewReservation, reservationWithInvalidStudent, reservationWithInvalidTimeslot, validReservation } from '../shared/mocks/mockReservation'
import { mockStudentUserToken } from '../shared/mocks/mockJWTService'
import { CreateReservationDto } from '../shared/dtos/reservation.dto'
import { mockTimeslots } from '../shared/mocks/mockLab'
import { mockStudent, mockStudentUser } from '../shared/mocks/mockStudent'
import { HttpException } from '@nestjs/common'


describe('ReservationsController', () => {
 	let controller: ReservationsController
	let reservationsService:ReservationsService
	let timeslotService:TimeslotService
	const mockValidReservation:CreateReservationDto = validReservation
	 	beforeEach(async () => {
	 		const module: TestingModule = await Test.createTestingModule({
			imports:[ 	WinstonModule.forRoot({transports:
					new winston.transports.File({
						filename: 'logs/test.log', 
					})})],
	 			controllers: [ReservationsController],
	 			providers: [ReservationsService, {
				provide: getRepositoryToken(Reservation),
				useValue:{}
			}, TimeslotService, {
				provide: getRepositoryToken(Timeslot),
				useValue:{findOneBy : jest.fn().mockImplementation((object) =>{
					
					return mockTimeslots.find(timeslot => timeslot.id === object.id)
				} )}
			},
			StudentsService,{
				provide: getRepositoryToken(Student),
				useValue:{findOneBy: jest.fn().mockImplementation((object) =>{
					
					if(object.id === mockStudent.id){
						return mockStudent
					} else{
						return null
					}
				} )}
			}]
	 		}).compile()

	 	controller = module.get<ReservationsController>(ReservationsController)
		reservationsService = module.get<ReservationsService>(ReservationsService)
		timeslotService=module.get<TimeslotService>(TimeslotService)

	})

 	it('controller should be defined', () => {
 		expect(controller).toBeDefined()
 	})
	it('ReservationService should be defined', () => {
		expect(reservationsService).toBeDefined()
	})
	it('TimeslotService should be defined', () => {
		expect(timeslotService).toBeDefined()
	})
	describe('create', () => {
		it('Should create reservation and return ReservationDto', async () => {
			jest.spyOn(reservationsService, 'create').mockImplementation(async() => {
				return mockNewReservation
			})
			jest.spyOn(timeslotService, 'updateTimeslotReservation').mockImplementation(async () => {
				mockTimeslots[0].isReserved = true
				return mockTimeslots[0].isReserved
			}
			
			)
			expect(await controller.create(mockValidReservation, {
				headers:{
					authentication: `Bearer ${mockStudentUserToken}`
				}})).toEqual({id:mockNewReservation.id})
		})
		it('Should find timeslot that is already reserved and return httpexeption with code 400', async() => {
			await controller.create(mockValidReservation, {
				headers:{
					authentication: `Bearer ${mockStudentUserToken}`,
				
				},user:{number:mockStudentUser.number, role:'student', id:mockStudentUser.id}
			}
			).catch(error => {
				expect(error).toBeInstanceOf(HttpException)
				expect (error.response).toBe('This timeslot is already reserved.')
				expect(error.status).toBe(400)
			}
			)
			

		})
		it('Should not find timeslot and return httpexception with code 404', async() => {
			await controller.create(reservationWithInvalidTimeslot, {
				headers:{
					authentication: `Bearer ${mockStudentUserToken}`,
				
				},user:{number:mockStudentUser.number, role:'student', id:mockStudentUser.id}
			}
			).catch(error => {
				expect(error).toBeInstanceOf(HttpException)
				expect (error.response).toBe('Timeslot not found.')
				expect(error.status).toBe(404)
			}
			)
			

		})
		it('Should not find student and return httpexception with code 404', async() => {
			await controller.create(reservationWithInvalidStudent, {
				headers:{
					authentication: `Bearer ${mockStudentUserToken}`,
				
				},user:{number:mockStudentUser.number, role:'student', id:mockStudentUser.id}
			}
			).catch(error => {
				expect(error).toBeInstanceOf(HttpException)
				expect (error.response).toBe('Student not found.')
				expect(error.status).toBe(404)
			}
			)
			

		})
			
		
	})
})
