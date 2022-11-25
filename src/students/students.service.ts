import { Inject, Injectable, LoggerService } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateStudentDto } from '../shared/dtos/student.dto'
import { Role } from '../shared/enums/role.enum'
import { UploadedStudent } from '../shared/interfaces/UploadedStudent'
import { Student } from '../shared/models/student.entity'
import { Repository, UpdateResult } from 'typeorm'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'


@Injectable()
export class StudentsService {
	constructor(
		@InjectRepository(Student)
		private studentRepository:Repository<Student>,
		@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
	){}
	createStudentDtos(students : UploadedStudent[]){
		try {
			const studentDtos:CreateStudentDto[] = []
			students.forEach((student:UploadedStudent) => {
				studentDtos.push(
					{
						user: {
							firstName: student['Voornaam/Roepnaam'],
							lastName: student.Naam,
							number: student.Inlognummer,
							email: student.Emailadres,
							role: Role.student,
							password: null
						},
						courses: []
					})

			})
			return studentDtos
		} catch (error) {
			this.logger.error(`Could not create student dto from file entity because of error ${error}`)
		}
	}
	async create(createStudentDto: CreateStudentDto ) :Promise<Student> {
		try {
			//we set cascade:true for user in student, so creating a student will automatically create a user and add the user id to the student
			const newStudent :Student = this.studentRepository.create(createStudentDto)
			await this.studentRepository.save(newStudent)
			return newStudent
		} catch (error) {
			this.logger.error(`Failed to create new student ${JSON.stringify(createStudentDto)}, because of error: ${error}`)
		}
	}

	async updateStudentWithCourse(student:Student, courseId:string) :Promise<boolean>{
		try {
			//querybuilder returns void.
			//the only way to know if this has succeeded is if there are no errors thrown
			let updateSucceeded:boolean
			await this.studentRepository.createQueryBuilder().relation(Student, 'courses').of(student).add(courseId)
				.then(() => {updateSucceeded=true; return}).catch((error) => {updateSucceeded = false; throw error})
			return updateSucceeded
		} catch (error) {
			this.logger.error(`Failed to add course with id ${courseId} to student ${JSON.stringify(student)}, because of error: ${error}`)
		}
	
	}


	async getOneByUserId(id:string): Promise<Student> {
		try {
			const student:Student = await this.studentRepository.findOne(
				{
					relations:{
						user:true
					},
					where:{
						user:{
							id:id
						}
					}
				})
			return student
		} catch (error) {
			this.logger.error(`Failed to find student with user id ${id}, because of error: ${error}`)
		}
	}
	async getOneByNumber(number: string) : Promise<Student|null> {
		try {
	
			const student:Student |null = await this.studentRepository.findOne({
				relations: {user:true},
				where:{user: {number:number}}
			})
			return student
		} catch (error) {
			this.logger.error(`Failed to find student for number ${number}, because of error: ${error}`)
		}
	}
	async getOneByStudentId(id:string):Promise<Student|null> {
		try {
			const student:Student|null = await this.studentRepository.findOneBy({id:id})
			return student
		} catch (error) {
			this.logger.error(`Failed to find student with id ${id}, because of error: ${error}`)
		}
	}
	async getOneWithCoursesByStudentNumber (number:string) : Promise<Student|null> {
	
		try {
			const student:Student |null = await this.studentRepository.findOne(
				{
					relations: {
						user:true, 
						courses:true
					},
					where:{
						user: {
							number:number
						}
					}
				})
		
			return student
		} catch (error) {
			this.logger.error(`Failed to find student with number ${number}, because of error: ${error}`)
		}
	}


	async activateStudent(id:string):Promise<boolean>{
		try {
			const updateResult:UpdateResult = await this.studentRepository.update({id:id}, {isActivated:true})
			if(updateResult){
				return true
			}
		} catch (error) {
			this.logger.error(`Failed to activate account for student with id ${id}, because of error: ${error}`)
		}
	}

}
