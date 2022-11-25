import { ApiProperty, OmitType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsUUID } from 'class-validator'
import { Protocol } from '../enums/protocol.enum'

/**
 * @description: dto class with all enitity properties to more easily infer other dto's.
 * Not to be used outside of dto files
 */
class FullConnectionDto{
	@Expose()
	@ApiProperty({example: '26de925e-0548-11ed-b939-0242ac120002'})
	@IsUUID()
		id:string
	@Expose()
	@ApiProperty({nullable: true, example:'Router 1'})
		 name?:string
	@Expose()
	@ApiProperty({type: 'enum', enum:Protocol,  default:Protocol.telnet})
		  protocol:Protocol
	@Expose()
	@ApiProperty({nullable: false, example:'192.168.0.192'})
		hostname:string
	@Expose()
	@ApiProperty({nullable: false, example:2010})
		port:number 
	@Expose()
	@ApiProperty({nullable: true, default:null})	
		 userName?:string
	 @Expose()
	 @ApiProperty({nullable:true, default:null})
		 password?:string
}
export class CreateConnectionDto extends OmitType(FullConnectionDto, ['id']) {}

export class ShowConnectionDto extends FullConnectionDto{
}