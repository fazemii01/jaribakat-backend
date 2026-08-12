import { PartialType } from '@nestjs/swagger';
import { CreateVideoCourseDto } from './create-video-course.dto';

export class UpdateVideoCourseDto extends PartialType(CreateVideoCourseDto) {}
