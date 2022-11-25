import { Role } from '../../shared/enums/role.enum'
import { hashString } from '../../shared/utils/hash'
import { CreateUserDto } from '../../shared/dtos/user.dto'
import * as dotenv from 'dotenv'
import { env } from 'process'
// needed to load in .env variables
dotenv.config() 
export const Admin :CreateUserDto ={
	firstName:env.ADMIN_FIRSTNAME,
	lastName:env.ADMIN_LASTNAME,
	email:env.ADMIN_EMAIL,
	number:env.ADMIN_NUMBER,
	password:hashString(env.ADMIN_PASSWORD),
	role:Role.admin
}