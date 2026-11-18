import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorService,
  type HealthCheckResult,
  type HealthIndicatorResult,
} from '@nestjs/terminus';
import { APP_ENV } from '../config/config.module.js';
import type { Env } from '../config/env.js';
import { PrismaService } from '../database/prisma.service.js';
import { JobsService } from '../jobs/jobs.service.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly indicator: HealthIndicatorService,
    private readonly prisma: PrismaService,
    private readonly jobs: JobsService,
    @Inject(APP_ENV) private readonly env: Env,
  ) {}

  /** Liveness: the process is up. Does not touch the database. */
  @Get('live')
  @ApiOperation({ summary: 'Liveness probe (process is running)' })
  @ApiOkResponse({ schema: { example: { status: 'ok' } } })
  live(): { status: 'ok' } {
    return { status: 'ok' };
  }

  /** Readiness: the database answers, the schema is migrated and the job queue is running. */
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe (database, migrations, job queue)' })
  @ApiOkResponse({ description: 'All dependencies are healthy' })
  @ApiServiceUnavailableResponse({ description: 'At least one dependency is unhealthy' })
  ready(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.checkDatabase(),
      () => this.checkJobs(),
    ]);
  }

  private async checkDatabase(): Promise<HealthIndicatorResult> {
    const probe = this.indicator.check('database');
    try {
      const rows = await this.prisma.$queryRaw<{ version: string }[]>`
        SELECT max(version) AS version FROM schema_migrations`;
      return probe.up({ schemaVersion: rows[0]?.version ?? null });
    } catch {
      return probe.down({ message: 'database unreachable or migrations not applied' });
    }
  }

  private async checkJobs(): Promise<HealthIndicatorResult> {
    const probe = this.indicator.check('jobs');
    if (!this.env.JOBS_ENABLED) return probe.up({ enabled: false });
    try {
      await this.jobs.checkQueueReachable();
      return probe.up({ enabled: true });
    } catch {
      return probe.down({ message: 'job queue is not running' });
    }
  }
}
