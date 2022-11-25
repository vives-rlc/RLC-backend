import { createHash } from 'crypto'
export const hashString =(text: string): string =>{
	try {
		const hash = createHash('sha256').update(text).digest('hex')
		return hash
	} catch (error) {
		throw error //we throw the error and log this in the service where the function is called
	}

}