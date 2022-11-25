import { Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from '../users/users.service'
import { AuthService } from './auth.service'
import { User } from '../shared/models/user.entity'
import {SeededStudent} from '../database/data/student'
import { JWTPayloadDto } from '../shared/dtos/auth.dto'
import { WinstonModule } from 'nest-winston'
import { getRepositoryToken } from '@nestjs/typeorm'
import * as winston from 'winston'
import * as dotenv from 'dotenv'
import { mockedJwtService } from '../shared/mocks/mockJWTService'
dotenv.config() //needed for .env vars
const mockedConfigService = {
	get(key: string) {
	  switch (key) {
		case 'JWT_EXPIRATION_TIME':
		  return '3600'
		case 'JWT_SECRET':
			return process.env.JWT_SECRET
	  }

	}
}

const mockUserRepository = {}
describe('AuthService', () => {
	//let service: AuthService
	let usersService:UsersService
	//let userRepository: Repository<User>
	//let logger: LoggerService
	let authService: AuthService
	let jwtService: JwtService
	let mockUser:User
	let mockPayload:JWTPayloadDto
	let mockStudentUserToken:string
	let mockValidUser:any
	beforeEach(async () => {
		  const module: TestingModule = await Test.createTestingModule({
			imports:[ 	WinstonModule.forRoot({transports:
				new winston.transports.File({
					filename: 'logs/test.log', 
				})})],
			providers: [AuthService, UsersService, 
				{provide: getRepositoryToken(User), 
					useValue:{mockUserRepository}},
				{
					provide: JwtService,
					useValue: mockedJwtService
					  },
					  {
					provide: getRepositoryToken(User),
					useValue: {}
					  },
					
			   {provide: Logger, useValue:{
		  		log:jest.fn()
		  	}}],
		  }).compile()

		authService = module.get<AuthService>(AuthService)
		usersService = module.get<UsersService>(UsersService)
		jwtService = module.get<JwtService>(JwtService)
		mockUser= {...SeededStudent.user, 
			id:'2915ca42-12bb-4e85-8ed4-1bec7de5e30b',
			createdAt:new Date(),
			updatedAt: new Date(),
			deletedAt: null
		 }
		 const {password, ...result} = mockUser
		 mockValidUser = result
		 mockPayload={
			id:mockUser.id,
			firstName:mockUser.firstName,
			lastName:mockUser.lastName,
			number:mockUser.number,
			email:mockUser.email,	
			role:mockUser.role
	
		 }
		 mockStudentUserToken =jwtService.sign(mockPayload)
	})

	it('should be defined', () => {
		expect(AuthService).toBeDefined()
	})
	it('should be defined', () => {
		expect(jwtService).toBeDefined()
	})
	it('should be defined', () => {
		expect(usersService).toBeDefined()
	})
	
	describe('validateUser', () => {
		it('should return a user', async () => {
			
			jest.spyOn(usersService, 'getOneByNumber').mockImplementation(async () => {return mockUser})
			expect(await authService.validateUser({number:'r0123456', password:'3ab9df7de7da0ee1c24fb4fac39d06f967dabcc5f1c47975f0ed677e614540b7'})).toStrictEqual(mockValidUser)
	
		})
	})
	describe('validateUser', () => {
		it('should return null', async () => {
			
			jest.spyOn(usersService, 'getOneByNumber').mockImplementation(async () => {return mockUser})
			
			expect(await authService.validateUser({number:'r0123456', password:'WrongPassword'})).toBe(null)
		})
	})
	describe('login', () => {
		it('should return userToken', async () => {

			expect(await authService.login(mockUser)).toStrictEqual({
				'userToken': mockStudentUserToken
			})
		})
	
	})
})