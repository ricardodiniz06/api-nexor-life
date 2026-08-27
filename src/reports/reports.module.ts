import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { Convenio } from '../convenios/entities/convenio.entity';
import { User } from '../iam/entities/user.entity';
import { IngestedEvent, IngestedEventSchema } from '../analytics/schemas/ingested-event.schema';
import { ReportsFrameworkModule } from './framework/reports-framework.module';
import { ConveniosActiveSummaryReport } from './providers/convenios-active-summary.report';
import { ConveniosByStateReport } from './providers/convenios-by-state.report';
import { UsersByRoleReport } from './providers/users-by-role.report';
import { InteroperabilityEventsReport } from './providers/interoperability-events.report';
import { ReportsController } from './reports.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Convenio, User]),
    MongooseModule.forFeature([
      { name: IngestedEvent.name, schema: IngestedEventSchema },
    ]),
    ReportsFrameworkModule.register([
      ConveniosByStateReport,
      ConveniosActiveSummaryReport,
      UsersByRoleReport,
      InteroperabilityEventsReport,
    ]),
  ],
  controllers: [ReportsController],
})
export class ReportsModule {}
