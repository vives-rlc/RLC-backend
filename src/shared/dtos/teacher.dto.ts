import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsUUID } from 'class-validator'
import { CreateUserDto, ShowUserDto } from './user.dto'

export class TeacherDto {
	@Expose()
	@ApiProperty({example: '6748cf08-d93f-43ad-9dca-22fd7bf8b51b', type:'uuid'})
	@IsUUID()
		id: string
}
export class CreateTeacherDto{
	@Type(() => CreateUserDto)
	@Expose()
		user: CreateUserDto
}

export class ShowTeacherDto extends TeacherDto{
//We need to share the type of this dto with the class transformer to correctly map the parent dto
@Type(() => ShowUserDto)
@Expose()
	user: ShowUserDto
}