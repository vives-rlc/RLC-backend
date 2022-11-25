import { Injectable } from '@nestjs/common'
import { Student } from '../../shared/models/student.entity'
import { CoursesService } from '../../courses/courses.service'
import { ReservationsService } from '../../reservations/reservations.service'
import { Course } from '../../shared/models/course.entity'
import { Reservation } from '../../shared/models/reservation.entity'
import { Teacher } from '../../shared/models/teacher.entity'
import { StudentsService } from '../../students/students.service'
import { TeachersService } from '../../teachers/teachers.service'
import { UsersService } from '../../users/users.service'
import { Admin } from '../data/admin'
import { SeededCourse } from '../data/course'
import { SeededStudent } from '../data/student'
import { SeededTeacher } from '../data/teacher'
import { TimeslotService } from 'src/timeslots/timeslots.service'


@Injectable()
export class Seeder {
	constructor(
		private readonly userService: UsersService,
		private readonly teacherService: TeachersService,
		private readonly studentService: StudentsService,
		private readonly courseService: CoursesService,
		private readonly reservationService : ReservationsService,
		private readonly timeslotService:TimeslotService
	){}
	//add admin to db
	async seedAdmin(){
		//check if admin already exists
		const isExistingUser:boolean = await this.userService.userExists(Admin.number, Admin.email)
		//if admin doesn't exist, create admin
		if(!isExistingUser){
			await this.userService.create(Admin)
		}
		
	}
	async seedTestData(){

		const isExistingTeacher:boolean = await this.userService.userExists(SeededTeacher.user.number, SeededTeacher.user.email)
		const isExistingStudent:boolean = await this.userService.userExists(SeededStudent.user.number, SeededStudent.user.email)
		if(!isExistingTeacher && !isExistingStudent){
			const teacher: Teacher =await this.teacherService.create(SeededTeacher)
			if(teacher){
				SeededCourse.teacher.id = teacher.id
				const course:Course =	await this.courseService.createCourse(SeededCourse)
				if(course){
					SeededStudent.courses = [{id:course.id}]
					const student:Student = await this.studentService.create(SeededStudent)
					if(student){
						const reservation:Reservation = await this.reservationService.create(
							{
								student:{
									id:student.id
								}, 
								timeslot:{
									id:course.labs[0].timeslots[0].id
								}
							})
						if(reservation){
							await this.timeslotService.updateTimeslotReservation(course.labs[0].timeslots[0].id, true)
						}
					}
				}
			}
		}
	}
	

}