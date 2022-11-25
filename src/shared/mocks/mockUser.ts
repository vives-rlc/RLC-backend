import { JWTPayloadDto } from '../dtos/auth.dto'
import { mockAdminUser } from './mockAdmin'
import { mockStudentUser } from './mockStudent'
import { mockTeacherUser } from './mockTeacher'


export const mockPayload:JWTPayloadDto= {
	id:mockStudentUser.id,
	firstName:mockStudentUser.firstName,
	lastName:mockStudentUser.lastName,
	number:mockStudentUser.number,
	email:mockStudentUser.email,	
	role:mockStudentUser.role
}
export const mockPayloadAdmin:JWTPayloadDto ={
	id:mockAdminUser.id,
	firstName:mockAdminUser.firstName,
	lastName:mockAdminUser.lastName,
	number:mockAdminUser.number,
	email:mockAdminUser.email,
	role:mockAdminUser.role

}
export const mockPayloadTeacher:JWTPayloadDto ={
	id:mockTeacherUser.id,
	firstName:mockTeacherUser.firstName,
	lastName:mockTeacherUser.lastName,
	number:mockTeacherUser.number,
	email:mockTeacherUser.email,
	role:mockTeacherUser.role
}
export const {password, ...mockValidUser} = mockStudentUser

