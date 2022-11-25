
export interface ConnectionParameters {
	connection:{
		type: string,
		settings:ConnectionSettings
	}
}

interface ConnectionSettings{
	hostname:string
	port:number
	width:number
	height:number
	password?: string
	username?:string
}
