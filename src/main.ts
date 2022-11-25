import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder, 
	SwaggerDocumentOptions } from '@nestjs/swagger'
import * as express from 'express'
import { ExpressAdapter } from '@nestjs/platform-express'
import * as http from 'http'
import * as GuacamoleLite from 'guacamole-lite'
import { ClientOptions } from './shared/interfaces/GuacdClientOptions'
import { LogLevel } from './shared/enums/logLevel.enum'
import { Seeder } from './database/seeders/seeder.service'

async function bootstrap() {
	//const app = await NestFactory.create(AppModule)
	// create an express app
	const expressApp= express()

	// use express app to create a nest app

	const	nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp))
	
	const serverPort  = process.env.RESERVATIONS_SERVER_PORT
	const guacdPort :string = process.env.GUACD_PORT // port of guacd
	const config = new DocumentBuilder()
		.setTitle('Remote Lab Reservation Server')
		.setDescription(`This API allows creating and reserving	
		timeslots for the Remote Lab Tool`)
		.setVersion('1.0')
		.addBasicAuth()
		.addBearerAuth()
		.build()
	const options: SwaggerDocumentOptions =  {
		operationIdFactory: (
			  controllerKey: string,
			  methodKey: string
		) => methodKey
		  }
	const document = SwaggerModule.createDocument(nestApp, config, options)
	SwaggerModule.setup('api', nestApp, document)
	nestApp.enableCors()
	nestApp.init()
	//await app.listen(serverPort)
	const guacdOptions = {
		host: process.env.GUACD_HOST,
		port: guacdPort, 
	}
	console.log({guacdOptions})
	const clientOptions: ClientOptions = {
		crypt: {
			cypher: process.env.CYPHER,
			key: process.env.KEY
		},
		log: {
			level: LogLevel.DEBUG,
		},
	}

	const seeder = nestApp.get(Seeder)
	seeder.seedAdmin()

	if(process.env.NODE_ENVIRONMENT === 'development'){
		seeder.seedTestData()
	}
	// create server with expressApp
	const server = http.createServer(expressApp)

	//create guacdServer with http server
	//we can't use websockoptions and give guacamolelite the portnumber, because then we get eaddrinuse errors
	const guacdServer = new GuacamoleLite({server}, guacdOptions, clientOptions)
	guacdServer.on('open', (clientConnection) => {
		
		console.log({clientConnection})
	})

	guacdServer.on('close', (clientConnection) => {
		console.log({clientConnection})
	})

	guacdServer.on('error', (clientConnection, error) => {
		console.error(clientConnection, error)
	})
	//listen to server
	server.listen(serverPort)
	//close the server on stopping the code
	//this prevents eaddrinuse errors on the next bootstrap
	process.on('SIGTERM', () => {shutdown(server)})
	process.on('SIGINT', ()=> {shutdown(server)})

	console.info(`reservations server started at ${serverPort}`)
}
bootstrap()
const shutdown = (server: http.Server) => {
	console.log('Recieved kill signal, shutting down gracefully')
	server.close(() => {
		console.log('Closed out remaining connections')
		process.exit(0)
	})
	setTimeout(() => {
		console.error('Could not close connections in time, forcefullyl shutting down')
		process.exit(1)
	}, 10000)
}