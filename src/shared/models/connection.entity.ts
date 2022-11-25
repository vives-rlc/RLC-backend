import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm'
import { Protocol } from '../enums/protocol.enum'
@Entity()
export class Connection {
	@PrimaryGeneratedColumn('uuid')
		id: string
	@Column({nullable:true})
		name?:string
	@Column({type:'enum', enum:Protocol, default:Protocol.telnet})
		protocol:Protocol
	@Column()
		hostname:string
	@Column()
		port:number
	@Column({nullable:true})
		userName?:string
	@Column({nullable:true})
		password?:string
	@CreateDateColumn()
		createdAt:Date
	@UpdateDateColumn()
		updatedAt:Date
	@DeleteDateColumn()
		deletedAt:Date
}