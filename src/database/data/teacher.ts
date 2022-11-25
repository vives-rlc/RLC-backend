import { CreateTeacherDto } from '../../shared/dtos/teacher.dto'
import { Role } from '../../shared/enums/role.enum'
import { hashString } from '../../shared/utils/hash'
import { faker } from '@faker-js/faker'
import * as dotenv from 'dotenv'
import { env } from 'process'
// needed to load in .env variables
dotenv.config() 
const firstName:string = faker.name.firstName()
const lastName:string = faker.name.lastName()
const email:string = faker.internet.email(firstName, lastName)
export const SeededTeacher:CreateTeacherDto = {
	user:{
		firstName:firstName,
		lastName: lastName,
		email: email,
		number:env.TEACHER_NUMBER,
		password:hashString(env.TEACHER_PASSWORD),
		role:Role.teacher
	}
}