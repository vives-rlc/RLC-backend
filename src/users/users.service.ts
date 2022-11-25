import { Inject, Injectable, LoggerService } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '../shared/models/user.entity'
import { Repository, UpdateResult } from 'typeorm'
import { CreateUserDto } from '../shared/dtos/user.dto'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'

@Injectable()
export class UsersService {
	
	
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
	  ) {}
	
	async create(createUserDto: CreateUserDto): Promise<User> {
		try {
			const newUser :User = this.userRepository.create(createUserDto)
			await this.userRepository.save(newUser)
			return newUser
		} catch (error) {
			this.logger.error(`Failed to create user ${JSON.stringify(createUserDto)} because of error: ${error}`)
		}
	}
	async userExists(number:string, email:string):Promise<boolean> {
		try {
			const existingUser:User = await	this.getOneByNumberOrEmail(number, email)
			return existingUser? true : false
		} catch (error) {
			this.logger.error(`Failed to find teacher with number ${number} and email ${email}, because of error: ${error}`)
		}
	}
	async getAll():Promise<User[]> {
		try {
			const users:User[] = await this.userRepository.find()
			return users
		} catch (error) {
			this.logger.error(`Failed to find users, because of error: ${error}`)
		}
	}
	async getOneByNumberOrEmail(number:string, email:string){
		try {
			const user = await this.userRepository.findOne({
				where: [
					{number:number},
					{email:email}
				]
			}
			
			)
			return user
		} catch (error) {
			throw error // function is only used inside this service, so we throw the error
		}
	  }
	  async getOneByNumber(number: string): Promise<User> {
		try {
			const user:User = await this.userRepository.findOneBy({number:number})
			return user
		} catch (error) {
			this.logger.error(`Failed to find user with number ${number} because of error: ${error}`)
		}
	  }
	  async getOneById(id: string): Promise<User> {
		try {
			const user:User = await this.userRepository.findOneBy({id:id})
			return user
		} catch (error) {
			this.logger.error(`Failed to find user with id ${id}, because of error: ${error}`)
		}
	  }
	  async updateStudentPassword(id:string, password:string) :Promise<boolean> {
		try {
			const updateResult:UpdateResult = await this.userRepository.update({id:id}, {password:password})
			if(updateResult){
				return true
			}
		} catch (error) {
			this.logger.error(`Failed to update password of student with id ${id} because of error: ${error}`)
		
		}
	}
	
}