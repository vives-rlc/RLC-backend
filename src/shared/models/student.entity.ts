import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm'
import { Course } from './course.entity'
import { ApiProperty } from '@nestjs/swagger'
import { User } from './user.entity'
import { Reservation } from './reservation.entity'

@Entity()
export class Student {
  @PrimaryGeneratedColumn('uuid')
  	id: string
	@OneToOne(() => User, {cascade:true})
	@JoinColumn()
		user:User
	@Column({default:false})
		isActivated:boolean
 	@ManyToMany(() => Course, course => course.students, {cascade: ['insert', 'update']})
  	@JoinTable()
  	@ApiProperty({type:() => [Course], nullable:true})
  		courses: Course[]
	@OneToMany(() => Reservation, reservation => reservation.student)
	@ApiProperty({type:() => [Reservation]})
		reservations: Reservation[]
	@CreateDateColumn()
	  createdAt:Date
	@UpdateDateColumn()
	  updatedAt:Date
	@DeleteDateColumn()
	  deletedAt:Date
}
