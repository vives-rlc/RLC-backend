import { Inject, Injectable, LoggerService } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Raw, Repository, UpdateResult } from 'typeorm'
import { Timeslot } from '../shared/models/timeslot.entity'
import { CreateMultipleTimeslotsWithLabIdDto, PatchTimeslotDto,  UpdateTimeslotDto } from '../shared/dtos/timeslot.dto'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'


@Injectable()
export class TimeslotService {
	
	
	constructor(
		@InjectRepository(Timeslot)
		private timeslotRepository: Repository<Timeslot>,
		@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
	  ) {}

	  async createMany({labId, timeslots}:CreateMultipleTimeslotsWithLabIdDto) : Promise<Timeslot[]> {
		try {
			const createdTimeslots : Timeslot[] = []

			timeslots.forEach(async timeslot => {
				const timeSlot = this.timeslotRepository.create({
					lab:{id: labId}, ...timeslot})
				createdTimeslots.push(timeSlot)
			})

			await this.timeslotRepository.save(createdTimeslots)
			return createdTimeslots
		} catch (error) {
			this.logger.error(`Failed to create timeslots ${JSON.stringify(timeslots)} with lab id ${labId}, because of error: ${error}`)
		}
		
	  }

	  async getByLabId(id:string) :Promise<Timeslot[]> {
		try {
			const timeslots: Timeslot [] = await this.timeslotRepository.find({where:{lab:{id:id}}})
			return timeslots
	
		} catch (error) {
			this.logger.error(`Failed to find timeslots with lab id ${id}, because of error: ${error}`)
		}
		

	  }
	  async getUnreservedTimeslotsByLabId(id:string) : Promise<Timeslot[]> {
		try {
			const timeslots: Timeslot[] = await this.timeslotRepository.find({where:{
				isCompleted:false,
				isReserved:false,
				startTime: Raw((alias) => `${alias} > NOW()`), // startTime must be in the future to be able to make the reservation
				lab:{id:id}
			},
			order:{
				startTime:'ASC'
			}
			})
			return timeslots
		} catch (error) {
			this.logger.error(`Failed to find unreserved timeslots for lab with id ${id}, because of error: ${error}`)
		}
	  }

	  async getOneWithTeacherRelationByTimeslotId(id:string) : Promise<Timeslot>{
		try {
			const timeslot:Timeslot = await this.timeslotRepository.findOne({
				relations:{
					lab:{
						course:{
							teacher:{
								user:true
							}
						}
					}
				}, where:{
					id:id
				}
			})
			return timeslot
		} catch (error) {
			this.logger.error(`Failed to get timeslot with id ${id}, error: ${error}`)
		}
	  }
	  async getOneByTimeslotId(id:string):Promise<Timeslot>{
		try {
			const timeslot:Timeslot = await this.timeslotRepository.findOneBy({id:id})
			return timeslot
		} catch (error) {
			this.logger.error(`Failed to find timeslot with id ${id}, because of error: ${error}`)
		}
	  }
	 
	  async updateTimeslotReservation(id:string, isReserved:boolean):Promise<boolean>{
		try {
			const updateResult:UpdateResult = await this.timeslotRepository.update({id:id}, {isReserved:isReserved})
			if(updateResult) return true
			return false
		} catch (error) {
			this.logger.error(`Failed to set timeslot with id ${id} as reserved, because of error: ${error}`)
		}

	  }
	  async updateTimeslotsTime(id:string, updateTimeslotDto:UpdateTimeslotDto):Promise<boolean>{
		try {
			const updateResult:UpdateResult = await this.timeslotRepository.update({id:id}, updateTimeslotDto)
			if(updateResult){
				return true
			}
			
		} catch (error) {
			this.logger.error(`Failed to update times to ${JSON.stringify(updateTimeslotDto)} for timeslot with id ${id}, because of error: ${error}`)
		}
	  }
	  async completeLab(id:string, patchTimeslotDto:PatchTimeslotDto): Promise<boolean>{
		try {
			const updateResult:UpdateResult = await this.timeslotRepository.update({id:id}, patchTimeslotDto)
			if (updateResult) return true
			return false
		} catch (error) {
			this.logger.error(`Failed to set lab with id ${id} as completed, because of error: ${error}`)
		}
	  }
	  async getAllTimeslotsWithCourseByTeacherId(id:string): Promise<Timeslot[]>{
		try {
			const timeslots:Timeslot[] = await this.timeslotRepository.find({
				relations:{
					lab:
					{
						course:true
					}
				},
				where:{
					lab:
					{
						course:
						{
							teacher:
							{
								id:id
							}
						}
					}
				}
			})
			return timeslots
		} catch (error) {
			this.logger.error(`Failed to find all timeslots for teacher with id ${id}, because of error: ${error}`)
		}
	  }
	 
}