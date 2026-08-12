import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FooterSection } from './entities/footer-section.entity';
import { FooterLink } from './entities/footer-link.entity';
import { FooterService } from './footer.service';
import { FooterController } from './footer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FooterSection, FooterLink])],
  providers: [FooterService],
  controllers: [FooterController],
  exports: [FooterService],
})
export class FooterModule {}
