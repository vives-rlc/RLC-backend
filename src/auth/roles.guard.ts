import { Injectable, CanActivate, ExecutionContext, 
	Inject, forwardRef, HttpException, HttpStatus, LoggerService } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from './roles.decorator'
import { User } from '../shared/models/user.entity'
import { UsersService } from '../users/users.service'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'


@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private reflector: Reflector, 
		@Inject(forwardRef(() => UsersService)) 
		private userService: UsersService,
		@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredRoles = this.reflector
			.getAllAndOverride<string[]>(ROLES_KEY, [
				context.getHandler(), 
				context.getClass()])
		if (!requiredRoles) {
			return true
		}
		const  request = context.switchToHttp().getRequest()
		const userId:string = request.user.id
		if(!userId) {
			this.logger.error(`Could not find user id in request: ${request}`)
			return
		}
		
		return this.userService.getOneById(userId).then(
			(user: User) => {
				//check if user has a role that fits the required roles of this function
				const hasRole = () => requiredRoles.indexOf(user.role) > -1
				
				let hasPermission = false

				if (hasRole()) {
					//if user has one of the required roles, permission is true
					hasPermission = true
				} else{
					this.logger.log(`User with id ${userId} and role ${user.role}, tried to access a function that requires roles: ${requiredRoles}`)
					throw new HttpException('You have no access to this function.', HttpStatus.FORBIDDEN )
				}
				return user && hasPermission
			})
			
	}
}