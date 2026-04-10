import {
  IsDefined,
  IsIn,
  IsISO8601,
  IsOptional,
  IsString,
} from 'class-validator';

export class CampaignDto {
  @IsString()
  @IsDefined()
  name: string;

  @IsString()
  @IsDefined()
  goal: string;

  @IsString()
  @IsIn(['RESEARCHING', 'PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED'])
  @IsOptional()
  status?: string;

  @IsISO8601()
  @IsOptional()
  startDate?: string;

  @IsISO8601()
  @IsOptional()
  endDate?: string;
}
