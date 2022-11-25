import { ApiProperty } from '@nestjs/swagger'
import { Type, Expose } from 'class-transformer'
import { IsUUID } from 'class-validator'
import { CourseDto } from './course.dto'
import { CreateUserDto, ShowUserDto } from './user.dto'

export class StudentDto {
	@Expose()
	@ApiProperty({example: '6748cf08-d93f-43ad-9dca-22fd7bf8b51b', type:'uuid'})
	@IsUUID()
		id:string
}
export class CreateStudentDto{
	
	@Type(() => CreateUserDto)
	@Expose()
		user:CreateUserDto
	
	@Type(() => CourseDto)
	@Expose()
	@ApiProperty({type: () => [CourseDto], nullable:true})
		courses:CourseDto[]
}

export class ShowStudentDto extends StudentDto{
//We need to share the type of this dto with the class transformer to correctly map the parent dto
@Type(() => ShowUserDto)
@Expose()
@ApiProperty({type: () => ShowUserDto})
	user: ShowUserDto
}