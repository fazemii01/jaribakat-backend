import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoCourse } from './entities/video-course.entity';
import { VideoCoursesService } from './video-courses.service';
import { VideoCoursesController } from './video-courses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VideoCourse])],
  providers: [VideoCoursesService],
  controllers: [VideoCoursesController],
  exports: [VideoCoursesService],
})
export class VideoCoursesModule {}
