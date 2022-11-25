import { Module } from '@nestjs/common'
import { FileService } from '../shared/files.service'
import { CsvModule } from 'nest-csv-parser'
import { MulterModule } from '@nestjs/platform-express'

@Module({
	imports: [CsvModule,   MulterModule.register({
		dest: './uploads/csv',
	  }) ],
	controllers: [],
	providers: [ FileService],
	exports: [FileService],
})
export class FileModule {}