import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne } from 'typeorm'
import { Student } from './student.entity'
import { Timeslot } from './timeslot.entity'

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  	id: string
	@ManyToOne(() => Student, student => student.reservations)
		student:Student
	@OneToOne(()=> Timeslot)
	@JoinColumn()
		timeslot:Timeslot
	@CreateDateColumn()
	  createdAt:Date
	@UpdateDateColumn()
	  updatedAt:Date
	@DeleteDateColumn()
	  deletedAt:Date
}