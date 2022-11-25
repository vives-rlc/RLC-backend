import { Admin } from '../../database/data/admin'
import { User } from '../models/user.entity'

export const mockAdminUser:User = {
	...Admin,
	id:'6be73dfe-62e0-47c0-b6df-53ec5cf0f264',
	createdAt:new Date(),
	updatedAt: new Date(),
	deletedAt: null,
}