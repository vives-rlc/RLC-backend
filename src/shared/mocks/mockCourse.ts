import { SeededCourse } from '../../database/data/course'
import { CourseDto, CreateCourseDto, ShowCourseDetailsForStudentDto, ShowCourseDetailsForTeacherDto, ShowCourseDto } from '../dtos/course.dto'
import { Course } from '../models/course.entity'
import { mockCreateLabDto, mockLab, mockShowLabDto, mockShowLabWithEmptyTimeslotsDto, mockShowLabWithTimeslotsDto } from './mockLab'
import { mockShowStudentDto, mockStudent } from './mockStudent'
import { mockShowTeacherDto, mockTeacher } from './mockTeacher'


export const mockCourse:Course = {
	name:SeededCourse.name,
	id:'ea55be65-ee48-4756-b5f2-7db20cd37120',
	createdAt:new Date(),
	updatedAt: new Date(),
	deletedAt: null,
	teacher: mockTeacher,
	students:[mockStudent],
	labs:[mockLab]
	
}

export const mockValidCourseDto:CourseDto={
	id:mockCourse.id
}

export const mockValidShowCourseDetailsForTeacherDto:ShowCourseDetailsForTeacherDto ={
	id:mockCourse.id,
	name:mockCourse.name,
	students:[mockShowStudentDto],
	labs:[mockShowLabDto]
}
export const mockValidShowCourseDetailsForStudentDto:ShowCourseDetailsForStudentDto ={
	id:mockCourse.id,
	name:mockCourse.name,
	labs:[mockShowLabWithTimeslotsDto],
	teacher: mockShowTeacherDto

}
export const mockValidShowCourseDetailsForStudentWithoutReservationsDto:ShowCourseDetailsForStudentDto ={
	id:mockCourse.id,
	name:mockCourse.name,
	labs:[mockShowLabWithEmptyTimeslotsDto],
	teacher: mockShowTeacherDto

}
export const mockShowcourseDto: ShowCourseDto ={
	id:mockCourse.id,
	name:mockCourse.name
}
export const mockCreateCourseDto: CreateCourseDto = {
	name:mockCourse.name,
	teacher:{
		id:mockTeacher.id
	},
	labs:[mockCreateLabDto]
}