import { IsUUID } from 'class-validator'
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, 
	ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm'
import { Connection } from './connection.entity'
import { Course } from './course.entity'
import { Timeslot } from './timeslot.entity'

@Entity()
export class Lab {
	@PrimaryGeneratedColumn('uuid')
	@IsUUID()
		id: string
	@Column()
		name:string
	@Column({nullable:true, length:2000})
		sway:string
	@OneToOne(() =>Connection, {cascade:true})
	 @JoinColumn()
	 	connection:Connection
		
	@ManyToOne(() => Course, course => course.labs )
		course:Course
	 @OneToMany(() => Timeslot, timeslot => timeslot.lab, {nullable:true, cascade:true} )
	 	timeslots?: Timeslot[]
	@CreateDateColumn()
		createdAt:Date
	@UpdateDateColumn()
		updatedAt:Date
	@DeleteDateColumn()
		deletedAt:Date
	
}