import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FAQ } from './entities/faq.entity';
import { FAQsService } from './faqs.service';
import { FAQsController } from './faqs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FAQ])],
  providers: [FAQsService],
  controllers: [FAQsController],
  exports: [FAQsService],
})
export class FAQsModule {}
