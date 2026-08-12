import { IsObject, IsNotEmpty } from 'class-validator';

export class UpdateSiteSettingsDto {
  @IsObject()
  @IsNotEmpty()
  settings: Record<string, string>;
}
