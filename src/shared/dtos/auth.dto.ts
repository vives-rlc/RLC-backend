import { ApiProperty, OmitType, PickType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsHash, IsString } from 'class-validator'
import {FullUserDto } from './user.dto'

export class LoginDto extends PickType(FullUserDto, ['number', 'password']) {}
export class UserTokenDto {
	@Expose()
	@ApiProperty()
	@IsString()
	  userToken: string
}
export class JWTPayloadDto extends OmitType(FullUserDto, ['password']){}

export class ActivateStudentAccountDto extends LoginDto {
	@Expose()
	@IsHash('sha256')
		activationToken:string
}