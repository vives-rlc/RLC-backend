import { randomBytes, createCipheriv, createDecipheriv } from 'crypto'
/**
 * 
 * @param value string to be encrypted
 * @returns encrypted string
 */
export const encrypt = (value): string => {
	try {
		const iv = randomBytes(16)
		const cipher = createCipheriv(
			process.env.CYPHER,
			process.env.KEY,
			iv,
		)
		let encrypted = cipher.update(JSON.stringify(value), 'utf-8', 'base64')
		encrypted += cipher.final('base64')
		const data = {
			iv: iv.toString('base64'),
			value: encrypted,
		}
		return Buffer.from(JSON.stringify(data)).toString('base64')
	} catch (error) {
		throw error //we throw the error and log this in the service where the function is called
	}
}
/**
 *
 * @param value string to be decrypted
 * @returns decrypted string
 */
export const decrypt = (value) => {
	const data = JSON.parse(Buffer.from(value, 'base64').toString('ascii'))
	try {
		const encrypted = Buffer.from(data.value, 'base64').toString('binary')
		const iv = Uint8Array.from(Buffer.from(data.iv, 'base64'))
		const decipher = createDecipheriv(
			process.env.CYPHER,
			process.env.CRYPT_SECRET,
			iv
		)
		let decrypted = decipher.update(encrypted, 'binary', 'ascii')
		decrypted += decipher.final('ascii')
		return JSON.parse(decrypted)
	} catch (error) {
		throw error //we throw the error and log this in the service where the function is called
	}
}