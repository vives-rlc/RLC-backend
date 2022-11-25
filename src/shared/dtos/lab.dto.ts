import { CreateConnectionDto, ShowConnectionDto } from './connection.dto'
import { CourseDto, ShowCourseDto } from './course.dto'
import { CreateTimeslotDto, ShowTimeslotDto, ShowTimeslotWithStudentDto } from './timeslot.dto'
import { Expose, Type } from 'class-transformer'
import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'
/**
 * @description: dto class with all enitity properties to more easily infer other dto's.
 * Not to be used outside of dto files
 */
class FullLabDto{
	@Expose()
	@ApiProperty({example: '26de925e-0548-11ed-b939-0242ac120002'})
	@IsUUID()
		id:string
	@Expose()
	@ApiProperty({example:'Lab 1'})
		name:string
	@Expose()
	@ApiProperty({example:'<iframe></iframe>'})
		sway:string
	@Expose()
		connection:CreateConnectionDto
	@Expose()
 	timeslots?:CreateTimeslotDto[]
}
export class LabDto extends PickType(FullLabDto, ['id']){
}
export class ShowLabDto extends PickType(FullLabDto, ['id', 'name']) {}

export class CreateLabDto extends OmitType(FullLabDto, ['id']){}
export class ShowLabSwayDto extends PickType(FullLabDto, ['sway']){}

export class CreateLabWithCourseIdDto extends CreateLabDto{
	@Type(() => CourseDto)
	@Expose()
		course:CourseDto

}


export class ShowLabWithTimeslotsAndConnectionDto extends ShowLabDto {
	@Type(() => ShowConnectionDto)
	@Expose()
		connection:ShowConnectionDto
	@Type(() => ShowTimeslotDto)
	@Expose()
		timeslots:ShowTimeslotDto[]
}
export class ShowLabWithConnectionDto extends OmitType(ShowLabWithTimeslotsAndConnectionDto, ['timeslots']){}
export class ShowLabWithTimeslotsDto extends  OmitType(ShowLabWithTimeslotsAndConnectionDto, ['connection']) {}

export class ShowLabWithCourseDto extends ShowLabDto {
	@Type(() => ShowCourseDto)
	@Expose()
		course:ShowCourseDto
}

export class ShowLabWithConnectionAndReservationsDto extends IntersectionType(ShowLabWithConnectionDto, ShowLabSwayDto){

	@Type(() => ShowTimeslotWithStudentDto)
	@ApiProperty({type: [ShowTimeslotWithStudentDto]})
	@Expose()
		timeslots:ShowTimeslotWithStudentDto[]
}
export class UpdateLabDto extends IntersectionType(OmitType(ShowLabWithConnectionDto, ['id']), ShowLabSwayDto) {}