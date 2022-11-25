import { ApiProperty } from '@nestjs/swagger'
import { Role } from '../../shared/enums/role.enum'
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm'
@Entity()

export class User {
	@PrimaryGeneratedColumn('uuid')
		id: string
		@ApiProperty({example: 'John', description:'First name of the user'})
		@Column()
			firstName:string
		@ApiProperty({example: 'Doe', description:'Last name of the user'})
		@Column()
			lastName:string
	 @ApiProperty({examples:['r1234567', 'u1234567'],
	  description:'Studentnumber or teachernumber, issued by Vives.'})
	 @Column()
	 	number:string
	@ApiProperty({example:'john.doe@student.vives.be', 
		description:'Student emailadres.'})
	@Column({unique:true})
		email:string
	@ApiProperty()
	@Column({nullable:true})
		password?:string
	
	@Column({type:'enum', enum:Role, default: Role.student})
		role: Role
	@CreateDateColumn()
		createdAt:Date
	@UpdateDateColumn()
		updatedAt:Date
	@DeleteDateColumn()
		deletedAt:Date
}