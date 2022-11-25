import { Controller, Get, HttpException, HttpStatus, Param, Req, UseGuards } from '@nestjs/common'
import { ApiBadRequestResponse, ApiBearerAuth, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ReservationsService } from '../reservations/reservations.service'
import { GuacdDto } from '../shared/dtos/guacd.dto'
import { Reservation } from '../shared/models/reservation.entity'
import { GuacdService } from './guacd.service'


@ApiTags('guacd')
@Controller('guacd')
export class GuacdController {
	constructor(
		private readonly guacdService: GuacdService, 
		private readonly reservationsService:ReservationsService
	) {}
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOkResponse({type:GuacdDto, description:'Returned connection token.'})
	@ApiBadRequestResponse({description: 'Bad request'})
	@ApiUnauthorizedResponse({description:'Not authorized'})
	@ApiInternalServerErrorResponse({description:'Failed to create connection token.'})
	@ApiOperation({summary:'Get the connection string for the terminal and the sway based on the timeslot id of the reservation.'})
  	@Get('/connection/:timeslotId')
	async getConnectionToken( @Param('timeslotId') id: string, @Req() req,):Promise<GuacdDto> {
		//we use reservationId and not timeslotId so we can get the student easier and check if the person that requests this is also the person that made the reservation
		//check if reservation with this id exists (and return it with timeslot, lab and connection relations)
		const reservation:Reservation = await this.reservationsService.getOneWithConnectionByTimeslotId(id)
		if (!reservation || !reservation.timeslot.lab.connection){
			throw new HttpException('Connection not found.', HttpStatus.NOT_FOUND)
		}
		//check if the the person that requests this is the student that made the reservation
		if(reservation.student.user.id !== req.user.id){
			throw new HttpException('You are not allowed to view this lab.', HttpStatus.FORBIDDEN)
		}
		//generate connetiontoken from connection that is related to the reservation
		const token = this.guacdService.getConnectionToken(reservation.timeslot.lab.connection)
		if(!token){
			throw new HttpException('Failed to create connection token.', HttpStatus.INTERNAL_SERVER_ERROR)
		}
		const guacdDto: GuacdDto = {connectionToken:token, sway: reservation.timeslot.lab.sway}	
		return guacdDto
		
	}
}
