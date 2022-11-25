import { SetMetadata } from '@nestjs/common'
import { Role } from '../shared/enums/role.enum'

export const ROLES_KEY = 'roles'
export const hasRoles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles)