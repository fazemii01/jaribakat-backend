import { PartialType } from '@nestjs/swagger';
import { CreateUSPDto } from './create-usp.dto';

export class UpdateUSPDto extends PartialType(CreateUSPDto) {}
