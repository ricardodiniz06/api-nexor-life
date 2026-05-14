import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import {
  ChartGranularity,
  type DashboardChartsDto,
} from './dto/dashboard-charts.dto';
import type { DashboardChartsQueryDto } from './dto/dashboard-charts-query.dto';
import type { DashboardSummaryDto } from './dto/dashboard-summary.dto';
import type { DashboardActivityDto } from './dto/dashboard-activity.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly users: UsersService) {}

  async getSummary(): Promise<DashboardSummaryDto> {
    const registeredUsers = await this.users.count();
    const now = new Date().toISOString();
    return {
      activePatients: 0,
      occupiedBeds: 18,
      visitsLast24h: 24,
      revenueMtd: 1_284_000.5,
      registeredUsers,
      generatedAt: now,
    };
  }

  getCharts(query: DashboardChartsQueryDto): Promise<DashboardChartsDto> {
    const granularity = query.granularity ?? ChartGranularity.DAY;
    const now = new Date().toISOString();
    return Promise.resolve({
      encounters: [
        { t: '2026-05-10', v: 38 },
        { t: '2026-05-11', v: 44 },
        { t: '2026-05-12', v: 41 },
        { t: '2026-05-13', v: 52 },
        { t: '2026-05-14', v: 47 },
      ],
      revenue: [
        { t: '2026-05-10', v: 44000 },
        { t: '2026-05-11', v: 46800 },
        { t: '2026-05-12', v: 45500 },
        { t: '2026-05-13', v: 51200 },
        { t: '2026-05-14', v: 49800 },
      ],
      departmentWorkload: [
        { label: 'Emergency', values: [12, 14, 11, 15, 13] },
        { label: 'ICU', values: [8, 9, 7, 10, 9] },
        { label: 'Surgery', values: [5, 6, 6, 7, 6] },
      ],
      generatedAt: now,
      granularity,
    });
  }

  getActivity(): Promise<DashboardActivityDto> {
    return Promise.resolve({
      generatedAt: new Date().toISOString(),
      items: [
        {
          type: 'report.exported',
          title: 'Regulatory bundle exported',
          at: new Date(Date.now() - 3600_000).toISOString(),
          module: 'reports',
        },
        {
          type: 'alert.triggered',
          title: 'Device integration heartbeat delayed',
          at: new Date(Date.now() - 7200_000).toISOString(),
          module: 'integrations',
        },
      ],
    });
  }
}
