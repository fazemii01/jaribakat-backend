import { IsString, IsNotEmpty, IsOptional, IsEmail, IsBoolean, IsEnum } from 'class-validator';
import { RegistrationStatus } from '../entities/registration.entity';

export class CreateRegistrationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  participantAge?: string;

  @IsString()
  @IsNotEmpty()
  programType: string;

  @IsString()
  @IsNotEmpty()
  programTitle: string;

  @IsString()
  @IsOptional()
  programId?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(RegistrationStatus)
  @IsOptional()
  status?: RegistrationStatus;

  @IsBoolean()
  @IsOptional()
  agreedToPolicy?: boolean;
}
