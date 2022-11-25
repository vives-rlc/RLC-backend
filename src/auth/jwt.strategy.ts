import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { LoggedInUserDto } from '../shared/dtos/user.dto'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //get JWT Bearer token from header
			ignoreExpiration: false, //make sure token isn't expired
			secretOrKey: configService.get('JWT_SECRET'), //get secret key from .env
		})
	}

	async validate(payload: any) {	
		const userDto:LoggedInUserDto = {id:payload.id, role:payload.role, number:payload.number}
		return userDto
	}
}