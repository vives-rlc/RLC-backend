import { ApiProperty, OmitType, PickType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsEmail, IsEnum, IsHash, IsString, IsUUID } from 'class-validator'
import { Role } from '../../shared/enums/role.enum'
/**
 * @description: dto class with all enitity properties to more easily infer other dto's.
 * Not to be used outside of dto files
 */
export class FullUserDto {
	@Expose()
	@ApiProperty({example: '26de925e-0548-11ed-b939-0242ac120002'})
	 @IsUUID()
	 id:string
	 @Expose()
	@ApiProperty({example:'John'})
	@IsString()
	 	firstName:string
	@Expose()
	@ApiProperty({example:'Doe'})
	@IsString()
		lastName:string
	@Expose()
	@ApiProperty({examples:['r1234567', 'u1234567'],
	  description:'Studentnumber or teachernumber, issued by Vives.'})
	@IsString()
		number:string
	@Expose()
	@ApiProperty({examples:['john.doe@student.vives.be', 'jane.doe@vives.be'], 
		description:'Student or teacher emailadres.'})
	@IsEmail()
		email:string
	@Expose()
	@ApiProperty({nullable:true})
	@IsHash('sha256')
		password:string
	@Expose()
	@ApiProperty({type:'enum', enum:Role, default: Role.student})
	@IsEnum(Role)
		role:Role
}
export class UserDto  extends PickType(FullUserDto, ['id']){
}
export class CreateUserDto extends OmitType(FullUserDto, ['id']){
}
export class LoggedInUserDto extends PickType(FullUserDto, ['number', 'role', 'id']) {
}

export class ShowUserDto extends PickType(FullUserDto, ['id', 'firstName', 'lastName', 'email']) {
}
export class testEmailDto extends PickType(FullUserDto, ['email']) {}