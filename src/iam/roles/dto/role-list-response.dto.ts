import { ApiProperty } from '@nestjs/swagger';
import { UserListMetaDto } from '../../users/dto/user-list-response.dto';
import { RoleResponseDto } from './role-response.dto';

export class RoleListResponseDto {
  @ApiProperty({ type: [RoleResponseDto] })
  data!: RoleResponseDto[];

  @ApiProperty({ type: UserListMetaDto })
  meta!: UserListMetaDto;
}
