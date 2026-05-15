import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [IamModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
