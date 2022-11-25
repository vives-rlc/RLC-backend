import { forwardRef, Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../shared/models/user.entity'
import { UserController } from './users.controller'
import { TeachersModule } from '../teachers/teachers.module'
import { StudentsModule } from '../students/students.module'

@Module({
	imports: [TypeOrmModule.forFeature([User]), forwardRef(() => TeachersModule),forwardRef(() =>StudentsModule)],
	controllers:[UserController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
