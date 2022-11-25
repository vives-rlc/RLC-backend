import { Inject, Injectable, LoggerService } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
	CreateLabWithCourseIdDto,
	UpdateLabDto,
} from '../shared/dtos/lab.dto'
import { Connection } from '../shared/models/connection.entity'
import { Lab } from '../shared/models/lab.entity'
import { Repository, UpdateResult } from 'typeorm'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'

@Injectable()
export class LabsService {
	constructor(
    @InjectRepository(Lab)
    private labsRepository: Repository<Lab>,
    @InjectRepository(Connection)
    private connectionsRepository: Repository<Connection>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
	) {}
	async createLab(lab: CreateLabWithCourseIdDto): Promise<Lab> {
		try {
			const newLab:Lab = this.labsRepository.create(lab)
			await this.labsRepository.save(newLab)
			return newLab
		} catch (error) {
			this.logger.error(`Failed to create lab ${JSON.stringify(lab)}, because of error: ${error}`)
		}
	}
	async getAllLabs(): Promise<Lab[]> {
		try {
			const labs = await this.labsRepository.find({
				order:{
					name:'ASC'
				}
			})
			return labs
		} catch (error) {
			this.logger.error(`Failed to get labs, because of error: ${error}`)
		}
	}
	async getAllLabsForTeacher(id:string): Promise<Lab[]>{
		try {
			const labs:Lab[] = await this.labsRepository.find({
				where:{
					course:{
						teacher:{
							user:{
								id:id
							}
						}
					},
				},
				order:{
					course:{
						labs:{
							name:'ASC'
						}
					}
				}
			})
			return labs
		} catch (error) {
			this.logger.error(`Failed to get labs for teacher with user id ${id}, because of error: ${error}`)
		}
	}
	async getLabWithConnectionAndTimeslotsByLabId(id:string):Promise<Lab>{
		try {
			const lab:Lab = await this.labsRepository.findOne({
				relations:{
					course:
					{
						teacher:{
							user:true
						}
					},
					timeslots:true,
					connection:true
				}, 
				where:{id:id},
				order:{
					name:'ASC',
					timeslots:{
						startTime:'ASC'
					}
				}

			})
			return lab
		} catch (error) {
			this.logger.error(`Failed to get lab with id ${id}, because of error: ${error}`)
		}
	}
	
	// async findLabById(id: string, hasCourse = false, hasTeacher = false, hasUser=false, hasStudents=false): Promise<Lab> {
	// 	try {
	// 		const lab:Lab = await this.labsRepository.findOne(
	// 			{
	// 				relations:
	// 				{	connection:true,
	// 					course: hasTeacher ? 
	// 						{
	// 							teacher:  hasTeacher, 
	// 							students:hasStudents} : 
	// 						hasCourse},
	// 				where: { id: id } 
	// 			})
	// 		return lab
	// 	} catch (error) {
	// 		this.logger.error(`Failed to find lab with id ${id}, because of error: ${error}`)
	// 	}
	// }
	async getLabById(id:string){
		try {
			const lab:Lab = await this.labsRepository.findOne(
				{
					relations:
					{	connection:true,
					},
					where: { id: id } 
				})
			return lab
		} catch (error) {
			this.logger.error(`Failed to find lab with id ${id}, because of error: ${error}`)
		}
	}
	async getLabWithTeacherByLabId(id:string){
		try {
			const lab:Lab = await this.labsRepository.findOne(
				{
					relations:
					{	connection:true,
						course: {
							teacher:{
								user:true
							}	
						}
					},
					where: { id: id } 
				})
			return lab
		} catch (error) {
			this.logger.error(`Failed to find lab with id ${id}, because of error: ${error}`)
		}
	}
	async getLabWithTeacherAndStudentsByLabId(id:string){
		try {
			const lab:Lab = await this.labsRepository.findOne(
				{
					relations:
					{	connection:true,
						course: {
							teacher:{
								user:true
							},
							students:{
								user:true
							}	
						}
					},
					where: { id: id } 
				})
			return lab
		} catch (error) {
			this.logger.error(`Failed to find lab with id ${id}, because of error: ${error}`)
		}
	}
	
	async update(id:string, updateLabDto: UpdateLabDto):Promise<boolean>{
		try {
			const updatedLab:UpdateResult = await this.labsRepository.update({id:id}, updateLabDto)
			const updatedConnection:UpdateResult =await this.connectionsRepository.update({id: updateLabDto.connection.id}, updateLabDto.connection)
			if(updatedLab && updatedConnection){
				return true
			}
		} catch (error) {
			this.logger.error(`Failed to update lab with id ${id} to ${JSON.stringify(updateLabDto)}, because of error: ${error}`)
		}
	}
}
