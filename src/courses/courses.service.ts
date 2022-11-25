import { HttpException, HttpStatus, Inject, Injectable, LoggerService } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateCourseDto, PatchCourseDto } from '../shared/dtos/course.dto'
import { Course } from '../shared/models/course.entity'
import { Repository, UpdateResult } from 'typeorm'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'

@Injectable()
export class CoursesService {
	
	constructor(
		@InjectRepository(Course)
		private coursesRepository: Repository<Course>,
		@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
	  ) {}
	  async createCourse(course:CreateCourseDto): Promise<Course> {
		
		try {
			const newCourse = this.coursesRepository.create(course)		
			await this.coursesRepository.save(newCourse)	
			return newCourse
		} catch (error) {
			this.logger.error(`Failed to create course ${JSON.stringify(course)}, because of error: ${error}`)
		}
		
	}
	async getAll(): Promise<Course[]> {
		try {
			const courses = await this.coursesRepository.find(
				{
					order:
					{
						name:'ASC' //return courses ordered by name from A to Z
					}
				}
			)
			
			return courses
		} catch (error) {
			this.logger.error(`Failed to get courses because of error: ${error}`)
			throw new HttpException('Failed to get courses', HttpStatus.BAD_REQUEST)

		}
	}
	async getAllForTeacher(id:string) : Promise<Course[]> {
		try {
			const courses = await this.coursesRepository.find({
				relations:{
					teacher:true
				},
				where:{
					teacher:{
						id:id
					}
				},
				order:{
					name: 'ASC'

				}
			})
			return courses
		} catch (error) {
			this.logger.error(`Failed to find courses for teacher with id ${id}, because of error ${error}`)
		}
		
		
	}
	async getAllForStudent(id: string): Promise<Course[]> {
		try {
			const courses = await this.coursesRepository.find({
				relations:{
					students:true,
					teacher:{
						user:true
					}
				},
				where:{
					students:{
						id:id
					}
				},
				order:{
					name:'ASC'
				}
			})
		
			return courses
		} catch (error) {
			this.logger.error(`Failed to get courses for student with id ${id}, because of error: ${error}`)
		}
	}
	async getOneByCourseId(id:string, ) : Promise<Course> {
		try {
			const course = await this.coursesRepository.findOne({
				relations:{
					labs:true,
					teacher:{user:true},
					students:{user:true}

				},
				where:{id:id},
				order:{
					labs:{
						name:'ASC'
					}
				}
			})
			return course
		} catch (error) {
			this.logger.error(`Failed to get course with id ${id}, because of error: ${error}`)
		}
	}
	async getOneByTeacherIdAndStudentId({teacherId, studentId}):Promise<Course>{
		try {
			const course:Course = await this.coursesRepository.findOne({
				where:{
					teacher:{id:teacherId},
					students:{id:studentId}
				}
			})
			return course
		} catch (error) {
			this.logger.error(`Failed to get course for teacher with id ${teacherId} and student with id ${studentId}, because of error: ${error}`)
		}
	}
	async getOneWithoutRelationsByCourseId(id:string):Promise<Course>{
		try {
				
			const course = await this.coursesRepository.findOneBy({id:id})
				
			return course
		} catch (error) {
			console.log({error})
			throw error
		}
	}
	async getOneWithTeacherRelationByCourseId(id:string): Promise<Course> {
		try {
			const course:Course = await this.coursesRepository.findOne({
				relations:{
					teacher:{user:true}
				},
				where:{
					id:id
				}
			})
			return course
		} catch (error) {
			this.logger.error(`Failed to find course with id ${id}, because of error: ${error}`)
		}
	}
	async getOneByCourseIdForTeacher(id:string): Promise<Course> {
		try {

			const course = await this.coursesRepository.findOne({
				relations:{
					labs:true,
					students:{user:true},
					teacher:{user:true}

				},
				where:{id:id},
				order:{
					labs:{
						name:'ASC'
					}
				}
			})
			return course
		} catch (error) {
			this.logger.error(`Failed to get course by id ${id}, because of error: ${error}`)
		}
	}
	//students need less info, so we use a different function with less relations to reduce the amount of db reads
	async getOneByCourseIdForStudent(id: string) : Promise<Course> {
		try {
			const course = await this.coursesRepository.findOne({
				relations:{
					// we can't get reservations here because it's a one-on-one relationship and the foreignkey is in the reservation table
					labs:true, 
					teacher:{user:true},
					students:true
				},
				where:{id:id},
				order:{				
					labs:{
						name:'ASC'
					}
				}
			})
			return course
		} catch (error) {
			this.logger.error(`Failed to get course by id ${id}, because of error: ${error}`)
		}
	}

	async patchCourseName(id:string, patchCourseDto:PatchCourseDto):Promise<boolean> {
		try {
			const updateResult:UpdateResult = await this.coursesRepository.update(
				{
					id:id
				}, 
				patchCourseDto
			)
			
			if(updateResult){
				return true
			}
			return false
		} catch (error) {
			this.logger.error(`Failed to apply patch ${JSON.stringify(patchCourseDto)} to course with id ${id}, because of error: ${error}`)
		}
	}
}