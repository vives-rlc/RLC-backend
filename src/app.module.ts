import { Module } from '@nestjs/common'
import { WinstonModule } from 'nest-winston'
import * as winston from 'winston'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSourceOptions } from 'typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import {ConfigModule, ConfigService} from '@nestjs/config'
import appConfig from './config/app.config'
import { CoursesModule } from './courses/courses.module'
import { LabsModule } from './labs/labs.module'

import { StudentsModule } from './students/students.module'
import { TeachersModule } from './teachers/teachers.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { GuacdModule } from './guacd/guacd.module'
import { ReservationsModule } from './reservations/reservations.module'
import { TimeslotsModule } from './timeslots/timeslots.module'
import { SeederModule } from './database/seeders/seeder.module'
import { MailerModule } from '@nestjs-modules/mailer'
import { join } from 'path'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { MailService } from './mailer/mail.service'

@Module({
	imports: [
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (config: ConfigService) => ({
			  transport: {
					host: config.get('EMAIL_HOST'),
					port: config.get('EMAIL_PORT'),
					secure: true,
					auth: {
				  user: config.get('EMAIL_USER'),
				  pass: config.get('EMAIL_PASSWORD'),
					},
			  },
			  defaults: {
					from:`${config.get('EMAIL_USER')}@${config.get('EMAIL_HOST')}` // this is the validated sender adres that is linked to the sendgrid account
			  },
			  preview:true,
			  template: {
					dir: join(__dirname, './mailer/templates'),
					adapter: new HandlebarsAdapter(),
					options: {
				  strict: true
					}
			  }
			}),
			inject: [ConfigService]
		}),
		WinstonModule.forRoot({
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.json()
			),
			transports: [
				new winston.transports.File({
					filename: 'logs/info.log', 
					level: 'info'
				}),
				new winston.transports.File({
					filename: 'logs/error.log', 
					level: 'error'
				}),
				new winston.transports.File({
					filename: 'logs/all.log', 
				})
			]
		}),
		ConfigModule.forRoot({isGlobal: true, load:[appConfig]}),
		TypeOrmModule.forRootAsync({
	  imports: [
		  ConfigModule
	  ],
	  useFactory: (configService: ConfigService) => {
		  return configService.get<DataSourceOptions>('database')
	  },
	  inject: [
		  ConfigService
	  ]
		}),
		AuthModule,
		UsersModule,
		StudentsModule,
		CoursesModule,
		LabsModule,
		TeachersModule,
		GuacdModule,
		ReservationsModule,
		TimeslotsModule,
		SeederModule
		
	],
	controllers: [AppController],
	providers: [AppService, MailService],
})
export class AppModule {}
