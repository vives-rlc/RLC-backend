import { Strategy } from 'passport-local'
import { PassportStrategy } from '@nestjs/passport'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { AuthService } from './auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private authService: AuthService) {
		//we customize the username/password strategy to use 
		//the usernumber instead of the username
		super({usernameField:'number'}) 
	}
	//these parameters have to be called username and 
	//password for the strategy to work
	async validate(username:string, password:string): Promise<any> {
		const user = await this.authService
			.validateUser({number:username, password})
		if (!user) {
			throw new HttpException('Invalid credentials.', HttpStatus.UNAUTHORIZED)
		}
		return user
	}
}