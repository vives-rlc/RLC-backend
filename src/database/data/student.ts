import { faker } from '@faker-js/faker'
import { CreateStudentDto } from '../../shared/dtos/student.dto'
import { Role } from '../../shared/enums/role.enum'
import { hashString } from '../../shared/utils/hash'
import * as dotenv from 'dotenv'
import { env } from 'process'
// needed to load in .env variables
dotenv.config() 
const firstName:string = faker.name.firstName()
const lastName:string = faker.name.lastName()
const email:string = faker.internet.email(firstName, lastName)
export const SeededStudent:CreateStudentDto = {
	user:{
		firstName:firstName,
		lastName: lastName,
		email: email,
		number:env.STUDENT_NUMBER,
		password:hashString(env.STUDENT_PASSWORD),
		role:Role.student
	},
	courses:[]
}