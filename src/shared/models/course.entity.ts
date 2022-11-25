import { Entity, Column, PrimaryGeneratedColumn, 
	OneToMany, ManyToOne, ManyToMany, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm'
import { Lab } from './lab.entity'
import { Student } from './student.entity'
import { Teacher } from './teacher.entity'
@Entity()
export class Course {
	@PrimaryGeneratedColumn('uuid')
		id: string
	@Column()
		name:string
	@OneToMany(() => Lab, lab => lab.course, {cascade:true})
		labs: Lab[]
	 @ManyToOne(() => Teacher, teacher => teacher.courses)
	 	teacher: Teacher
	 @ManyToMany(() => Student, student => student.courses, {cascade:true})
	 	students:Student[]
	@CreateDateColumn()
		createdAt:Date
	@UpdateDateColumn()
		updatedAt:Date
	@DeleteDateColumn()
		deletedAt:Date
}