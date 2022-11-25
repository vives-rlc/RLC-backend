import { faker } from '@faker-js/faker'
import { CreateCourseDto } from '../../shared/dtos/course.dto'
import { Protocol } from '../../shared/enums/protocol.enum'

const startTime1 =faker.date.future()
const startTime2 = faker.date.future()
export const SeededCourse:CreateCourseDto ={
	name: 'Networking 1',
	teacher: {id:''},
	labs:[
		{
			name:'Lab 1',
			connection:{
				name:'Router 1',
				protocol:Protocol.telnet,
				hostname:faker.internet.ip(),
				port: faker.internet.port(),
				userName:null,
				password:null
			},
			sway:`&lt;iframe width=&quot;760px&quot; 
			height=&quot;500px&quot; 
			src=&quot;https://sway.office.com/s/wCuOiwQmrOP23lXv/embed&quot; 
			frameborder=&quot;0&quot; 
			marginheight=&quot;0&quot; 
			marginwidth=&quot;0&quot; 
			max-width=&quot;100%&quot; 
			sandbox=&quot;allow-forms allow-modals allow-orientation-lock allow-popups allow-same-origin allow-scripts&quot; 
			scrolling=&quot;no&quot; style=&quot;border: none; max-width: 100%; max-height: 100vh&quot; 
			allowfullscreen mozallowfullscreen msallowfullscreen webkitallowfullscreen&gt;&lt;/iframe&gt;`,
			timeslots: [
				{
					startTime: startTime1,
					endTime: new Date(startTime1.getTime() + 60000),
					isReserved:false,
					isCompleted:false
				},
				{
					startTime: startTime2,
					endTime: new Date(startTime2.getTime() + 60000),
					isReserved:false,
					isCompleted:false
				},
			]
		}
	]

}