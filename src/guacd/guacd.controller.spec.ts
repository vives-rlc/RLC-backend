import { Test, TestingModule } from '@nestjs/testing'
import { WinstonModule } from 'nest-winston'
import { ReservationsService } from '../reservations/reservations.service'
import * as winston from 'winston'
import { GuacdController } from './guacd.controller'
import { GuacdService } from './guacd.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Reservation } from '../shared/models/reservation.entity'
import { mockStudentUserToken } from '../shared/mocks/mockJWTService'
import { mockStudentUser } from '../shared/mocks/mockStudent'
import { validGuacdDto } from '../shared/mocks/mockGuacd'
import { mockNewReservation } from '../shared/mocks/mockReservation'
import { mockTimeslots } from '../shared/mocks/mockLab'
import { HttpException } from '@nestjs/common'

describe('GuacdController', () =>{
	let guacdController:GuacdController
	let reservationsService:ReservationsService
	let guacdService: GuacdService
	beforeEach(async () =>{
		const module:TestingModule = await Test.createTestingModule({
			imports:[ 	WinstonModule.forRoot({transports:
				new winston.transports.File({
					filename: 'logs/test.log', 
				})})],
			controllers:[GuacdController],
			providers:[GuacdService, 
				ReservationsService, 
				{
					provide: getRepositoryToken(Reservation),
					useValue: {}

				}]
		}).compile()
		guacdController = module.get<GuacdController>(GuacdController)
		reservationsService = module.get<ReservationsService>(ReservationsService)
		guacdService = module.get<GuacdService>(GuacdService)
	})
	it('GuacdController should be defined', () => {
		expect(guacdController).toBeDefined()
	})
	it('ReservationsService should be defined', () => {
		expect(reservationsService).toBeDefined()
	})
	it('GuacdService should be defined', () => {
		expect(guacdService).toBeDefined()
	})
	describe('getConnectionToken', () => {
	
		it('Should create a connectiontoken for the connection settings related to this timeslot and return this token along with the embeded sway.', async () => {
			jest.spyOn(reservationsService, 'getOneWithConnectionByTimeslotId').mockImplementation(async (id) => {
				if(id === mockNewReservation.timeslot.id){
					return mockNewReservation
				}else {
					return null
				}
				
			})
			jest.spyOn(guacdService, 'getConnectionToken').mockImplementation(()=> {
				// eslint-disable-next-line max-len
				return 'eyJpdiI6ImpnN3VkMFlYcis5b0lDOWJ4RHZUUlE9PSIsInZhbHVlIjoidFhXVTJ3ckdFZVNwNzVDL3dvb3FhTU5KbUZPNjIwWGRpZ0d1bXJXc3pJaWF5K2lESjlkOFRST0Y1MUcxQldlMWxselJNaU8rdzd6aktDZjV5dGIzbVM2WlB1bDJlQXB3cXlyc2g1OHBtbDZyemh2cndhTHliQ0I3b0poZ240eXhjNTc0V3I3Mzh3WUt2SWRhaEFSNzVRPT0ifQ=='
			})
			expect(await guacdController.getConnectionToken(mockTimeslots[0].id, {
				headers:{
					authentication: `Bearer ${mockStudentUserToken}`,
				
				},user:{number:mockStudentUser.number, role:'student', id:mockStudentUser.id}
			})).toEqual(validGuacdDto)
			
		})
		it('Should not find a reservation and return a 404', async ()=> {
			jest.spyOn(reservationsService, 'getOneWithConnectionByTimeslotId').mockImplementation(async (id) => {
				if(id === mockNewReservation.timeslot.id){
					return mockNewReservation
				}else {
					return null
				}
				
			})
			await guacdController.getConnectionToken(mockTimeslots[1].id, {
				headers:{
					authentication: `Bearer ${mockStudentUserToken}`,
				
				},user:{number:mockStudentUser.number, role:'student', id:mockStudentUser.id}
			}).catch(error => {
				expect(error).toBeInstanceOf(HttpException)
				expect (error.response).toBe('Connection not found.')
				expect(error.status).toBe(404)
			})
		})
		it('User should not be allowed and return a 403', async ()=> {
			jest.spyOn(reservationsService, 'getOneWithConnectionByTimeslotId').mockImplementation(async (id) => {
				if(id === mockNewReservation.timeslot.id){
					return mockNewReservation
				}else {
					return null
				}
				
			})
			await guacdController.getConnectionToken(mockTimeslots[0].id, {
				headers:{
					authentication: `Bearer ${mockStudentUserToken}`,
				
				},user:{number:'r234567', role:'student', id:'invalidStudentId'}
			}).catch(error => {
				expect(error).toBeInstanceOf(HttpException)
				expect (error.response).toBe('You are not allowed to view this lab.')
				expect(error.status).toBe(403)
			})
			
		})
		it('Should not return token and return 500', async ()=> {
			jest.spyOn(reservationsService, 'getOneWithConnectionByTimeslotId').mockImplementation(async (id) => {
				if(id === mockNewReservation.timeslot.id){
					return mockNewReservation
				}else {
					return null
				}
				
			})
			jest.spyOn(guacdService, 'getConnectionToken').mockImplementation(()=> {
				return null
			})
			await guacdController.getConnectionToken(mockTimeslots[0].id, {
				headers:{
					authentication: `Bearer ${mockStudentUserToken}`,
				
				},user:{number:mockStudentUser.number, role:'student', id:mockStudentUser.id}
			}).catch(error => {
				expect(error).toBeInstanceOf(HttpException)
				expect (error.response).toBe('Failed to create connection token.')
				expect(error.status).toBe(500)
			})
			
		})
	})
})
