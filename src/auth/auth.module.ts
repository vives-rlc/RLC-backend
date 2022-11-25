import { forwardRef, Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { AuthService } from './auth.service'
import { PassportModule } from '@nestjs/passport'
import { LocalStrategy } from './local.strategy'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtStrategy } from './jwt.strategy'
import { RolesGuard } from './roles.guard'
import { JwtAuthGuard } from './jwt-auth.guard'
import  {AuthController} from './auth.controller'
import { TeachersModule } from '../teachers/teachers.module'
import { StudentsModule } from '../students/students.module'

@Module({
	imports:[forwardRef(() => UsersModule) , 
		PassportModule, 
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get('JWT_SECRET'),
				signOptions: {expiresIn: '30d'}
			})}), forwardRef(() => TeachersModule) , forwardRef(() => StudentsModule)],
	controllers:[AuthController],
	providers: [AuthService, LocalStrategy, 
		JwtStrategy, RolesGuard, JwtAuthGuard],
	exports:[AuthService]

})
export class AuthModule {}
