import { CreateReservationDto } from '../dtos/reservation.dto'
import { Reservation } from '../models/reservation.entity'
import { mockTimeslots } from './mockLab'
import { mockStudent, mockStudentUser } from './mockStudent'

export const validReservation: CreateReservationDto =  {
	student: {
		id:mockStudent.id
	},
	timeslot:{
		id:mockTimeslots[0].id
	}
}
export const reservationWithInvalidTimeslot:CreateReservationDto ={
	student: {
		id:mockStudent.id
	},
	timeslot:{
		id:'invalidTimeslotId'
	}
}
export const reservationWithInvalidStudent:CreateReservationDto ={
	student: {
		id:'invalidStudentId'
	},
	timeslot:{
		id:mockTimeslots[1].id
	}
}
export const mockNewReservation:Reservation = {
	id:'4ff11759-aa18-48f7-9509-b429d4e40dfa',
	student: mockStudent,
	timeslot:mockTimeslots[0],
	createdAt:new Date(),
	updatedAt: new Date(),
	deletedAt: null,
}
export const mockNewReservationNoCircularRelations = {
	id:'4ff11759-aa18-48f7-9509-b429d4e40dfa',
	student: mockStudent,
	timeslot:{
		id:mockTimeslots[0].id,
		startTime: mockTimeslots[0].startTime,
		endTime:mockTimeslots[0].endTime,
		isReserved:true,
		isCompleted:false,
		createdAt:new Date(),
		updatedAt: new Date(),
		deletedAt: null,
		lab:null
	},
	createdAt:new Date(),
	updatedAt: new Date(),
	deletedAt: null,
}

// export const mockReservationWithConnection:Reservation ={
// 	id:'4ff11759-aa18-48f7-9509-b429d4e40dfa',
// 	student: mockStudent,
// 	timeslot:mockTimeslots[0],
// 	createdAt:new Date(),
// 	updatedAt: new Date(),
// 	deletedAt: null,
// }