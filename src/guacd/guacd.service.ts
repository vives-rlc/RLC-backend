import { Inject, Injectable, LoggerService } from '@nestjs/common'
import { encrypt } from '../shared/utils/crypto'
import { Connection } from '../shared/models/connection.entity'
import { ConnectionParameters } from '../shared/interfaces/GuacdConnectionParameters'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
@Injectable()
export class GuacdService {
	/**
	 *
	 */
	constructor(
		@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
	) {}
	/**
	 * 
	 * @returns token for requested connection over guacd
	 */
	getConnectionToken(connection:Connection): string {
		try {
			const connectionParameters:ConnectionParameters = {
				connection:{
					type:connection.protocol,
					settings:{
						hostname:connection.hostname,
						port:connection.port,
						width: 640,
						height: 480,

					}

				}
			
			}
			if(connection.password){
				connectionParameters.connection.settings.password = decrpyt(connection.password)
			}
			if(connection.userName){
				connectionParameters.connection.settings.hostname = connection.hostname
			}
		
			const token = encrypt(connectionParameters)
			return token
		} catch (error) {
			this.logger.error(`Failed to create a connection token for connection ${JSON.stringify(connection)}, because of error: ${error}`)
		}
	}
}
function decrpyt(password: string): string {
	throw new Error('Function not implemented.')
}

