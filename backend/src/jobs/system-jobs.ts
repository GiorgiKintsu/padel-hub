import { Injectable, type OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { JobsService } from './jobs.service.js';

export const SYSTEM_PING_QUEUE = 'system.ping';

/**
 * The only job in stage A. It proves the full path: enqueue -> pg-boss -> worker -> database write.
 * Business jobs (hold expiry, reminders, ...) arrive in later stages.
 */
@Injectable()
export class SystemJobs implements OnModuleInit {
  constructor(
    private readonly jobs: JobsService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    this.jobs.registerWorker(SYSTEM_PING_QUEUE, async () => {
      // Idempotent: running it twice just refreshes the timestamp.
      await this.prisma.appMeta.upsert({
        where: { key: 'last_job_ping' },
        create: { key: 'last_job_ping', value: new Date().toISOString() },
        update: { value: new Date().toISOString() },
      });
    });
  }
}
