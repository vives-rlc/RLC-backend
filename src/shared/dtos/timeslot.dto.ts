import { Expose, Type } from 'class-transformer'
import { ApiProperty, OmitType, PickType } from '@nestjs/swagger'
import { IsBoolean, IsDateString, IsUUID } from 'class-validator'
import { ShowLabWithCourseDto } from './lab.dto'
import { ShowStudentDto } from './student.dto'
/**
 * @description: dto class with all enitity properties to more easily infer other dto's.
 * Not to be used outside of dto file
 */
class FullTimeslotDto {
	@Expose()
	@ApiProperty({example: '6748cf08-d93f-43ad-9dca-22fd7bf8b51b', type:'uuid'})
	@IsUUID()
		id: string
	@Expose()
	@ApiProperty()
	@IsDateString()
		startTime:Date
	@Expose()
	@ApiProperty()
	@IsDateString()
		endTime: Date
	@Expose()
	@ApiProperty({default:false})
	@IsBoolean()	
		isReserved: boolean
	@Expose()
	@ApiProperty({default:false})
	@IsBoolean()	
		isCompleted: boolean
}
export class CreateTimeslotDto extends OmitType(FullTimeslotDto, ['id']){}
export class CreateMultipleTimeslotsWithLabIdDto{
	@Expose()
	@ApiProperty({example: '6748cf08-d93f-43ad-9dca-22fd7bf8b51b', type:'uuid'})
	@IsUUID()
		labId:string
	@Type(() => CreateTimeslotDto)
	@Expose()
		timeslots:CreateTimeslotDto[]
}

export class TimeslotDto extends PickType(FullTimeslotDto, ['id']) {}
export class ShowTimeslotDto extends FullTimeslotDto{}


export class ShowTimeslotWithLabAndStudentDto extends ShowTimeslotDto{
	@Type(() => ShowStudentDto)
	@ApiProperty({type:ShowStudentDto, nullable:true})
	@Expose()
		student:ShowStudentDto
	@Type(() => ShowLabWithCourseDto)
	@ApiProperty({type:() => ShowLabWithCourseDto})
	@Expose()
		lab: ShowLabWithCourseDto
}
export class ShowTimeslotWithStudentDto extends OmitType(ShowTimeslotWithLabAndStudentDto, ['lab'] ){}
export class ShowTimeslotWithLabDto extends OmitType(ShowTimeslotWithLabAndStudentDto, ['student'] ){}
export class UpdateTimeslotDto extends PickType(FullTimeslotDto, ['startTime', 'endTime']) {}
export class PatchTimeslotDto extends PickType(FullTimeslotDto, ['isCompleted']){}
