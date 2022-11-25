import { JwtService } from '@nestjs/jwt'
import { mockPayload, mockPayloadAdmin, mockPayloadTeacher } from './mockUser'
import * as dotenv from 'dotenv'
dotenv.config() //needed for .env vars
export const mockedJwtService:JwtService = new JwtService({
	secret: process.env.JWT_SECRET,
	signOptions:{
		expiresIn:'30d'
	}})

export const mockStudentUserToken = mockedJwtService.sign(mockPayload)
export const mockAdminUserToken = mockedJwtService.sign(mockPayloadAdmin)
export const mockTeacherUserToken = mockedJwtService.sign(mockPayloadTeacher)