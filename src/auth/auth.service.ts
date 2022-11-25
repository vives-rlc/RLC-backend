
import { Inject, Injectable, LoggerService } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { JwtService } from '@nestjs/jwt'
import { JWTPayloadDto, LoginDto, UserTokenDto } from '../shared/dtos/auth.dto'
import { User } from '../shared/models/user.entity'
import { instanceToPlain, plainToClass } from 'class-transformer'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'

@Injectable()
export class AuthService {
	constructor(private usersService: UsersService, 
		private jwtService:JwtService,
		@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService) {}
	
	comparePasswords(loginPassword: string, dbPassword: string){
		return loginPassword === dbPassword
	}
	async validateUser({number, password}:LoginDto): Promise<any> {
		const user:User = await this.usersService.getOneByNumber(number)
		
		if (user && this.comparePasswords(password, user.password)) {
			// we don't want to return the password!
			const { password, ...result } = user 
			return result
		}else {
			this.logger.log(`User with number ${number} tried to login with wrong password.`)
			return null
		}
		
	}
	async createStudentActivationToken (studentNumber:string) {
		return this.jwtService.sign(studentNumber)
	}
	async login(user: User) :Promise<UserTokenDto> {
		try {
			//transform user to dto to sanitize the properties we don't need.
			const payload:JWTPayloadDto = plainToClass(JWTPayloadDto, instanceToPlain(user), {excludeExtraneousValues:true})
			const userTokenDto:UserTokenDto = {
				userToken: this.jwtService.sign(instanceToPlain(payload)), //jwt payload needs to be a plain object, not a dto
		   }
			return userTokenDto
	  
		} catch (error) {
			this.logger.error(`Failed to sign JWT payloayd for ${JSON.stringify(user)}, because of error: ${error}`)
		}
	}
}