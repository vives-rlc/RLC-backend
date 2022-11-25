//we don't need to @Expose() these properties since we manually construct this dto and won't use class transformer to transform an entity into this dto
export class GuacdDto {
	connectionToken: string
	sway:string
}