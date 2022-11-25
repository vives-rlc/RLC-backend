import { SeededCourse } from '../../database/data/course'
import { CreateLabDto, ShowLabDto, ShowLabWithConnectionDto, ShowLabWithTimeslotsDto, UpdateLabDto } from '../dtos/lab.dto'
import { ShowTimeslotDto } from '../dtos/timeslot.dto'
import { Connection } from '../models/connection.entity'
import { Lab } from '../models/lab.entity'
import { Timeslot } from '../models/timeslot.entity'
import { mockCourse } from './mockCourse'

export const mockConnection:Connection ={...SeededCourse.labs[0].connection,
	id:'8e610654-32aa-4872-b7ed-b4691519dc4e',
	createdAt:new Date(),
	updatedAt: new Date(),
	deletedAt: null,
}


export const mockLab:Lab ={
	connection:mockConnection,
	sway:SeededCourse.labs[0].sway,
	name: SeededCourse.labs[0].name,
	id:'9415cda6-5d5c-4c2d-a910-25cffd0f9ac3',
	createdAt:new Date(),
	updatedAt: new Date(),
	deletedAt: null,
	course:mockCourse
}
export const mockTimeslots:Timeslot[]=[
	{...SeededCourse.labs[0].timeslots[0],
		id:'6d004d01-b919-43c0-91b4-687c071963ec',
		createdAt:new Date(),
		updatedAt: new Date(),
		deletedAt: null,
		lab:mockLab
	},
	{...SeededCourse.labs[0].timeslots[1],
		id:'757093c1-f07c-4568-9f27-dae21451b37b',
		createdAt:new Date(),
		updatedAt: new Date(),
		deletedAt: null,
		lab:mockLab
	}
]
export const mockShowLabDto:ShowLabDto ={
	id: mockLab.id,
	name:mockLab.name
}
export const mockShowTimeslotDto:ShowTimeslotDto ={
	id:mockTimeslots[0].id,
	startTime:mockTimeslots[0].startTime,
	endTime: mockTimeslots[0].endTime,
	isCompleted:false,
	isReserved:true
}
export const mockShowLabWithTimeslotsDto:ShowLabWithTimeslotsDto ={
	...mockShowLabDto,
	timeslots:[mockShowTimeslotDto]
}
export const mockShowLabWithEmptyTimeslotsDto:ShowLabWithTimeslotsDto ={
	...mockShowLabDto,
	timeslots:[]
}
export const mockUpdateLabDto:UpdateLabDto={
	name:mockLab.name,
	connection:{
		id:mockConnection.id,
		name:'UpdatedConnection',
		protocol:mockConnection.protocol,
		port:mockConnection.port+1,
		hostname:'192.168.7.127'

	},
	sway:mockLab.sway
}
export const mockShowLabWithConnectionDto:ShowLabWithConnectionDto ={
	id:mockLab.id,
	name:mockLab.name,
	connection:{
		id:mockConnection.id,
		name:'UpdatedConnection',
		protocol:mockConnection.protocol,
		port:mockConnection.port+1,
		hostname:'192.168.7.127'

	},
}
export const mockCreateLabDto:CreateLabDto ={
	name:SeededCourse.labs[0].name,
	sway:mockLab.sway,
	connection:{
		name:mockConnection.name,
		protocol:mockConnection.protocol,
		hostname:mockConnection.hostname,
		port:mockConnection.port,
		userName:mockConnection.userName,
		password:mockConnection.password
	},
	timeslots:[
		{
			startTime:mockTimeslots[0].startTime,
			endTime:mockTimeslots[0].endTime,
			isReserved:false,
			isCompleted:false
		},
		{
			startTime:mockTimeslots[1].startTime,
			endTime:mockTimeslots[1].endTime,
			isReserved:false,
			isCompleted:false
		}
	]		
}