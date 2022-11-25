import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm'
import { UsersService } from './users.service'
import {User} from '../shared/models/user.entity'
import { Logger, LoggerService } from '@nestjs/common'
import { Repository } from 'typeorm'
import { WinstonModule } from 'nest-winston'
import winston from 'winston'

describe('UsersService', () => {
	let service: UsersService
	let logger: LoggerService
	const mockUserRepository = {}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports:[ 	WinstonModule.forRoot({}),],
			providers: [UsersService, {provide: getRepositoryToken(User), 
				useValue:{mockUserRepository}}, {provide: Logger, useValue:{
				log:jest.fn()
			}}],
		}).compile()

		service = module.get<UsersService>(UsersService)
	})
	it('should be defined', () => {
		expect(service).toBeDefined()
	})
	
})
