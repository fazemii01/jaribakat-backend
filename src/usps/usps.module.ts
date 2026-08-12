import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { USP } from './entities/usp.entity';
import { USPsService } from './usps.service';
import { USPsController } from './usps.controller';

@Module({
  imports: [TypeOrmModule.forFeature([USP])],
  providers: [USPsService],
  controllers: [USPsController],
  exports: [USPsService],
})
export class USPsModule {}
