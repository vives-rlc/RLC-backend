import {DataSourceOptions } from 'typeorm'
import DbConfig from './db.config'
import * as dotenv from 'dotenv'
// needed to load in .env variables
dotenv.config() 
const typeormConfig = DbConfig() as DataSourceOptions
export default typeormConfig