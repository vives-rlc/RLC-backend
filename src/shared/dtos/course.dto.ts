import {Expose, Type} from 'class-transformer'
import { IsUUID } from 'class-validator'
import { ShowStudentDto } from './student.dto'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { ShowTeacherDto, TeacherDto } from './teacher.dto'
import { CreateLabDto, LabDto, ShowLabDto, ShowLabWithTimeslotsDto } from './lab.dto'
import { FileUploadDto } from './file.dto'

/**
 * @description: dto class with all enitity properties to more easily infer other dto's.
 * Not to be used outside of dto files
 */
class FullCourseDto{
	@Expose()
	@ApiProperty({example: '26de925e-0548-11ed-b939-0242ac120002'})
	@IsUUID()
		id:string
	@Expose()
	@ApiProperty({example:'Networking'})
		name:string
	@Expose()
	@ApiProperty({type:TeacherDto})
		teacher:TeacherDto
	@Expose()
		labs: LabDto[]
}
export class CourseDto extends PickType(FullCourseDto,['id']){}
export class CreateCourseDto extends PickType(FullCourseDto,['name', 'teacher']){
	@Expose()
		labs: CreateLabDto[]
	
}
export class CreateCourseWithFileUploadDto extends  FileUploadDto {
	@Expose()
		course: CreateCourseDto
}

export class ShowCourseDto extends PickType(FullCourseDto, ['id', 'name']){}
export class ShowCourseWithTeacherDto extends ShowCourseDto {
	//We need to share the type of this dto with the class transformer to correctly map the parent dto
	@Type(() => ShowTeacherDto)
	@Expose()
		teacher: ShowTeacherDto
}

export class ShowCourseDetailsForStudentDto extends ShowCourseWithTeacherDto{
@Type(() => ShowLabWithTimeslotsDto)
@Expose()
@ApiProperty({type: () => [ShowLabWithTimeslotsDto], nullable:true})
	labs: ShowLabWithTimeslotsDto[]
}

export class ShowCourseDetailsForTeacherDto extends ShowCourseDto{
	@Type(() => ShowLabDto)
	@Expose()
	@ApiProperty({type: () => [ShowLabDto], nullable:true})
		labs: ShowLabDto[]
	@Type(() => ShowStudentDto)
	@Expose()
	@ApiProperty({type: () => [ShowStudentDto], nullable:true})
		students: ShowStudentDto[]
}

export class PatchCourseDto extends PickType(FullCourseDto, ['name']){}