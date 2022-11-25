import { ApiProperty } from '@nestjs/swagger'
import { Entity, PrimaryGeneratedColumn, OneToMany, JoinColumn, OneToOne, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm'
import { Course } from './course.entity'
import { User } from './user.entity'
@Entity()
export class Teacher{
	@PrimaryGeneratedColumn('uuid')
		id: string
	@OneToOne(() => User, {cascade:true})
	@JoinColumn()
		user:User
	@OneToMany(() => Course, course => course.teacher)
	@ApiProperty({type:() => [Course]})
		courses: Course[]
	@CreateDateColumn()
		createdAt:Date
	@UpdateDateColumn()
		updatedAt:Date
	@DeleteDateColumn()
		deletedAt:Date

	
}