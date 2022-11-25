import { Inject, Injectable, LoggerService } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateReservationDto } from '../shared/dtos/reservation.dto'
import { Reservation } from '../shared/models/reservation.entity'
import { Raw, Repository } from 'typeorm'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'

@Injectable()
export class ReservationsService {
	constructor( 
		@InjectRepository(Reservation)
		private  reservationsRepository:Repository<Reservation>,
		@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
	){}
	 async create(createReservationDto:CreateReservationDto) {
		try {
			
			//create reservation
			const newReservation:Reservation = this.reservationsRepository.create(createReservationDto)
			
			//save reservation
			await this.reservationsRepository.save(newReservation)
			return newReservation
			
		} catch (error) {
			this.logger.error(`Failed to create reservation ${JSON.stringify(createReservationDto)}, because of error: ${error}`)
		}
	 }

	async getAllFutureReserationsForStudent(id: string):Promise<Reservation[]> {
		try {
			const reservations:Reservation[] = await this.reservationsRepository.find({
				relations:{
					timeslot:{
						lab:{course:true}
					},
				
				}, where:{
					timeslot:{
						endTime: Raw((alias) => `${alias} > NOW()`), //end time should be later or equal to now
					//we don't do this check for start time.
					//it's possible that starttime has passed, but endtime has not and student is trying to reconnect with a lab that they lost connection to
					},
					student:{id:id}
				},
				order:{
					timeslot:{
						startTime:'ASC'
					}
				}
			})
	
			return reservations
		} catch (error) {
			this.logger.error(`Failed to find future reservations for student with id ${id}, because of error: ${error} `)
	
		}
	}
	async getOneById(id: string): Promise<Reservation> {
		try {
			const reservation:Reservation = await this.reservationsRepository.findOneBy({id:id})
			return reservation
		} catch (error) {
			this.logger.error(`Failed to find reservation with id ${id}, because of error: ${error}`)
		}
	}

	async getOneByTimeslotId(id:string, hasTimeslot = false, hasStudent=false, hasUser=false): Promise<Reservation> {
		try {
			const reservation:Reservation = await this.reservationsRepository.findOne({
				relations:{
					student: hasUser? {user: hasUser} : hasStudent, 
					timeslot:hasTimeslot}, 
				where:{
					timeslot:{id:id} }
			}
			)
			return reservation
		} catch (error) {
			this.logger.error(`Failed to find reservation with timeslot id ${id}, because of error: ${error}`)
		}
	}

	async getOneWithConnectionByTimeslotId(id:string): Promise<Reservation>{
		try {
			const reservation:Reservation = await this.reservationsRepository.findOne({
				relations:{
					timeslot:{
						lab:{connection:true},
					
					},
					student:{user:true}
				
				}, where:{timeslot:{id:id}}
			})
			return reservation
		} catch (error) {
			this.logger.error(`Could not find reservation with timeslot id ${id}, because of error: ${error}`)
		}
	  }
	async getAllForLabAndStudent(labId:string, studentId:string): Promise<Reservation[]>{
		try {
			const reservations:Reservation[] = await this.reservationsRepository.find(
				{
					relations:
			{
				timeslot:true
			},
					where:{
						timeslot:{
							lab:{
								id:labId
							}
						},
						student:{
							id:studentId
						}
					}
				})
			return reservations
		} catch (error) {
			this.logger.error(`Failed to find reservations with lab id ${labId} and student id ${studentId}, because of error: ${error}`)
		}
	}
	async getReservationsAndAllLabInfoByLabId(id:string):Promise<Reservation[]> {
		const reservations:Reservation[] = await this.reservationsRepository.find({
			relations:{
				timeslot:{lab:true},
				student:{user:true}
			},
			where:{timeslot:{lab:{id:id}}}
		})
		return reservations
	}
	
}
