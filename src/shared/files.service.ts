import { Inject, Injectable, LoggerService } from '@nestjs/common'
import { CsvParser, ParsedData, } from 'nest-csv-parser'
import * as fs from 'fs'
import { getCSVFile } from '../shared/utils/csv'
import { UploadedStudent } from './interfaces/UploadedStudent'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'

@Injectable()
export class FileService {
	constructor(
		private readonly csvParser: CsvParser,
		@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
	){}
	//this is a general function to read an csv, 
	//so we declare to wich entity the data must be transformed outside of the function
	async readFile(entity) {
		try {
			const csvPath = getCSVFile()
			const stream = fs.createReadStream(csvPath)
			const data: ParsedData<typeof entity> = await this.csvParser
				.parse(stream, entity)
			const entities : typeof entity[] = data.list as typeof entity[]
			//make sure no empty lines in csv are returned as students to create
			const nonEmtpyEntites =	entities.filter((entity : UploadedStudent) => entity.Inlognummer !='')
			
			return nonEmtpyEntites
		} catch (error) {
			this.logger.error(`Failed to read file and return entities of type ${entity}, because of error: ${error}, 
			originated from ${error.stack}`) // we ask the stack here because the error can be caused by any of the util functions and we have no logging there
		}
	}

}