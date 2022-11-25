const DatabaseConfig = () => ({
	type: 'mysql',
	host: process.env.DB_HOST || 'localhost',
	port: parseInt(process.env.DB_PORT) || 3306,
	database: process.env.DB_NAME || '',
	username: process.env.DB_USER || '',
	password: process.env.DB_PASSWORD || '',
	entities: [
		'dist/**/*.entity{.ts,.js}'
	],

	//allows you to automatically create db tables based on the entities in code
	//set true in dev and false in prod
	synchronize: process.env.DB_SYNCHRONIZE || false,
	// this field will be used to create the table by name of migrations. 
	//You can name it whatever you want. But make sure to use the sensible name
	migrationsTableName: 'migrations', 
	// This is the path to the migration files created by typeorm cli.
	// You don't have to create dist folder.
	// When you save file, compiled files will be stored in dist folder
	migrations: [
		'dist/src/migrations/*{.ts,.js}' 
	],
	// This path will be used by typeorm cli when we create a new migration
	cli: {
		migrationsDir: 'src/migrations' 
	}
})
export default DatabaseConfig
