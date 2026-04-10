import {
  IsBoolean,
  IsDefined,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

export class UserAgentDto {
  @IsString()
  @IsDefined()
  name: string;

  @IsString()
  @IsDefined()
  role: string;

  @IsString()
  @IsDefined()
  description: string;

  @IsString()
  @IsDefined()
  instructions: string;

  @IsString()
  @IsIn([
    'gpt-4.1',
    'gpt-4.1-mini',
    'gpt-4o',
    'gpt-4o-mini',
    'claude-sonnet-4-5',
    'claude-opus-4-5',
  ])
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
