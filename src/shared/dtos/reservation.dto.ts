import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsUUID } from 'class-validator'
import { ShowStudentDto, StudentDto } from './student.dto'
import { ShowTimeslotDto, ShowTimeslotWithLabDto, TimeslotDto } from './timeslot.dto'

export class ReservationDto {
 @Expose()
 @ApiProperty({example: '6748cf08-d93f-43ad-9dca-22fd7bf8b51b', type:'uuid'})
 @IsUUID()
	 id:string
}

export class CreateReservationDto {
@Type(() => StudentDto)
@Expose()
	student:StudentDto
@Type(() => TimeslotDto)
@Expose()
	timeslot:TimeslotDto
}

export class ShowFutureReservationDto extends ReservationDto {
	@Type(() => ShowTimeslotWithLabDto)
	@ApiProperty({type: () => ShowTimeslotWithLabDto})
	@Expose()
		timeslot:ShowTimeslotWithLabDto
}
export class ShowFullReservationDto extends ReservationDto{
	@Type(() => ShowTimeslotDto)
	@ApiProperty({type:ShowTimeslotDto})
	@Expose()
		timeslot: ShowTimeslotDto
	@Type(() => ShowStudentDto)
	@ApiProperty({type:ShowStudentDto})
	@Expose()
		student:ShowStudentDto
}

