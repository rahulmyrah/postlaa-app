import {
  IsBoolean,
  IsDefined,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

export class MCPClientDto {
  @IsString()
  @IsDefined()
  name: string;

  @IsString()
  @IsDefined()
  url: string;

  @IsString()
  @IsIn(['none', 'bearer', 'header'])
  @IsOptional()
  authType?: string;

  @IsString()
  @IsOptional()
  authValue?: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
