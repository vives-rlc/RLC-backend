import { SeededTeacher } from '../../database/data/teacher'
import { ShowTeacherDto } from '../dtos/teacher.dto'
import { Teacher } from '../models/teacher.entity'
import { User } from '../models/user.entity'
import { mockCourse } from './mockCourse'

export const mockTeacherUser:User = {
	...SeededTeacher.user,
	id:'668cb352-7a1d-48d5-a176-7412a77447c0',
	createdAt:new Date(),
	updatedAt: new Date(),
	deletedAt: null,
}
export const mockTeacher:Teacher ={user: {...mockTeacherUser},
	id:'a663dfb9-13be-470a-a453-d91b4ff960ec',
	courses:[mockCourse],
	createdAt:new Date(),
	updatedAt: new Date(),
	deletedAt: null,
	
}
export const mockShowTeacherDto:ShowTeacherDto = {
	id:mockTeacher.id,
	user:{
		id:mockTeacherUser.id,
		firstName:mockTeacherUser.firstName,
		lastName:mockTeacherUser.lastName,
		email:mockTeacherUser.email
	}
}