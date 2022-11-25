import { SeededStudent } from '../../database/data/student'
import { ShowStudentDto } from '../dtos/student.dto'
import { Student } from '../models/student.entity'
import { User } from '../models/user.entity'
import { mockCourse } from './mockCourse'

export const mockStudentUser:User ={...SeededStudent.user, 
	id:'2915ca42-12bb-4e85-8ed4-1bec7de5e30b',
	createdAt:new Date(),
	updatedAt: new Date(),
	deletedAt: null
}
export const mockStudent:Student ={
	user:mockStudentUser,
	id:'24be20c3-cf99-463c-9e06-584e45915f2b',
	createdAt:new Date(),
	updatedAt: new Date(),
	deletedAt: null,
	courses:[mockCourse],
	isActivated:true,
	reservations:[]
}
export const mockShowStudentDto:ShowStudentDto ={
	id:mockStudent.id,
	user: {
		id:mockStudentUser.id,
		firstName: mockStudentUser.firstName,
		lastName:mockStudentUser.lastName,
		email:mockStudentUser.email

	}
}
export const mockUploadedStudent ={'Uitschrijvingsdatum': '',
	Nummer: '',
	Naam: mockStudentUser.lastName,
	'Voornaam/Roepnaam': mockStudentUser.firstName,
	Opleiding: '',
	'Tweede naam':'',
	Correspondentietaal: '',
	Inlognummer:  mockStudentUser.number,
	QNummer: '',
	Telefoonnummer: '',
	Mobielnummer: '',
	Emailadres: mockStudentUser.email,
	Opties: ''}