import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm'
import { Lab } from './lab.entity'

@Entity()
export class Timeslot {
	@PrimaryGeneratedColumn('uuid')
		id: string
	@Column({type: 'datetime'})
		startTime:Date
	@Column({type: 'datetime'})
		endTime: Date
		//we update this boolean when creating a reservation
		// based on this boolean, timeslots will show up as either free or already reserved
		// we could also do this by simply checking wether or not the timeslot id is present in the reservation table
		//however this would require more db request, so we prefer to add 1 write request instead
	@Column({default:false}) 
		isReserved: boolean
	@Column({type:Boolean, default:false})
		isCompleted:boolean
	 @ManyToOne(() => Lab, (lab) => lab.timeslots)
	 	lab:Lab
	@CreateDateColumn()
		createdAt:Date
	@UpdateDateColumn()
		updatedAt:Date
	@DeleteDateColumn()
		deletedAt:Date
}