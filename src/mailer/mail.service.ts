import { MailerService } from '@nestjs-modules/mailer'
import { Inject, Injectable, LoggerService } from '@nestjs/common'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { join } from 'path'
import { Student } from '../shared/models/student.entity'
import { hashString } from '../shared/utils/hash'

@Injectable()
export class MailService {
	constructor(
		private mailerService: MailerService,
		@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
	) {}

	async sendMail(student:Student) :Promise<boolean> {
		try {
			const base_url = process.env.BASE_FRONTEND_URL

			//create a hash of the student number
			//this way, the url is unique for sure and we don't have to save anything to the db
			//this is also secure because a hash is unilateral -> meaning it can't be reversed
		
			const token:string = hashString(student.user.number)
			const activationUrl = `${base_url}/activate/${token}`
			const filePath:string= join(__dirname, '.', 'templates', 'email.hbs')
			let hasSucceeded:boolean
			await this.mailerService.sendMail({
				to: student.user.email,
				subject: 'Activeer je account',
				template: filePath,
				context: {
					firstName: student.user.firstName,
					lastName:student.user.lastName,
					activationUrl: activationUrl
				}
			}).then(() => {
				hasSucceeded =true
				this.logger.log(`Sucessfully send email with activation url ${activationUrl} to student with number ${student.user.number}.`)
				
			}).catch((error)=> {hasSucceeded = false; throw error})
			return hasSucceeded
		} catch (error) {
			this.logger.error(`Failed to send email to student ${JSON.stringify(student)}, because of error: ${error}`)
		}
	}
	
}