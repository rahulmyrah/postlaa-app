import {
  IsBoolean,
  IsDefined,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class MarketingProjectDto {
  @IsString()
  @IsDefined()
  name: string;

  @IsString()
  @IsDefined()
  description: string;

  @IsString()
  @IsDefined()
  url: string;

  @IsString()
  @IsDefined()
  niche: string;

  @IsString()
  @IsOptional()
  targetAudience?: string;

  @IsString()
  @IsOptional()
  brandVoice?: string;

  @IsString()
  @IsOptional()
  brandColors?: string;

  @IsString()
  @IsOptional()
  competitors?: string;

  @IsString()
  @IsOptional()
  goals?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
