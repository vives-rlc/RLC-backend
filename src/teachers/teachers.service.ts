import { Inject, Injectable, LoggerService } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateTeacherDto } from '../shared/dtos/teacher.dto'
import { Teacher } from '../shared/models/teacher.entity'
import { Repository } from 'typeorm'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'

@Injectable()
export class TeachersService {
	
	constructor(
		@InjectRepository(Teacher)
		private teacherRepository:Repository<Teacher>,
		@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
	){}
	async create(createTeacherDto:CreateTeacherDto):Promise<Teacher>{
		try {
			const newTeacher:Teacher = this.teacherRepository.create(createTeacherDto)
			await this.teacherRepository.save(newTeacher)

			return newTeacher
		} catch (error) {
			this.logger.error(`Could not create teacher with teacher info: ${JSON.stringify(createTeacherDto)}, because of error:${error}`)
		}
	}

	async getOneByUserId(id: string) : Promise<Teacher> {
		try {
			const teacher:Teacher|null = await this.teacherRepository.findOne(
				{
					relations:{
						user:true
					},
					where:{
						user:
					{
						id:id
					}
					}
				}
			)
			
			return teacher
		} catch (error) {
			this.logger.error(`Failed to get teacher with user id ${id}, because of error: ${error}`)
		}
	}
	async getOneByLabId(id:string) :Promise<Teacher>{
		try {
			const teacher:Teacher = await this.teacherRepository.findOne({
				where:{
					courses:{
						labs:{
							id:id
						}
					}
				},
				relations:{
					user:true
				}
			})
			return teacher
		} catch (error) {
			this.logger.error(`Failed to get teacher with lab id ${id}, because of error: ${error}`)
		}
	}
	async getAll() : Promise<Teacher[]> {
		try {
			const teachers: Teacher[] = await this.teacherRepository.find()
			return teachers
		} catch (error) {
			this.logger.error(`Failed to get teachers, because of error: ${error}`)
		}
	}

}
