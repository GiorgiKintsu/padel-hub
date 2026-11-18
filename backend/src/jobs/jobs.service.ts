import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { PgBoss, type Job } from 'pg-boss';
import { APP_ENV } from '../config/config.module.js';
import type { Env } from '../config/env.js';

export type JobHandler<T extends object = object> = (jobs: Job<T>[]) => Promise<void>;

interface Registration {
  queue: string;
  handler: JobHandler<never>;
}

/**
 * Wraps pg-boss (a job queue stored in PostgreSQL, schema `pgboss`).
 *
 * Reminder from the architecture rules: the queue only *triggers* work. The source of truth
 * (e.g. `expires_at` of a booking hold) is always an ordinary table, and every handler must be safe
 * to run twice. A periodic sweep that re-checks the tables must back up every time-based job.
 *
 * Feature modules call `registerWorker()` from their own `onModuleInit`; workers start in
 * `onApplicationBootstrap`, after all modules (and migrations) are initialised.
 */
@Injectable()
export class JobsService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger('Jobs');
  private boss: PgBoss | null = null;
  private readonly registrations: Registration[] = [];

  constructor(@Inject(APP_ENV) private readonly env: Env) {}

  registerWorker<T extends object>(queue: string, handler: JobHandler<T>): void {
    this.registrations.push({ queue, handler: handler as JobHandler<never> });
  }

  get running(): boolean {
    return this.boss !== null;
  }

  async onApplicationBootstrap(): Promise<void> {
    if (!this.env.JOBS_ENABLED) {
      this.logger.warn('JOBS_ENABLED=false: pg-boss is not started, no background jobs will run');
      return;
    }
    const boss = new PgBoss({
      connectionString: this.env.DATABASE_URL,
      application_name: 'padel-hub-jobs',
      max: 5,
    });
    boss.on('error', (err: Error) => this.logger.error(`pg-boss error: ${err.message}`));
    await boss.start();
    for (const { queue, handler } of this.registrations) {
      await boss.createQueue(queue);
      await boss.work(queue, handler as JobHandler);
      this.logger.log(`Worker registered for queue "${queue}"`);
    }
    this.boss = boss;
    this.logger.log('pg-boss started');
  }

  /** Enqueue a job. Resolves to the job id (null if a queue policy dropped it). */
  async send(queue: string, data: object = {}, options?: { startAfter?: number | Date }): Promise<string | null> {
    if (!this.boss) throw new Error('Job queue is not running');
    return this.boss.send(queue, data, options ?? {});
  }

  /** Cheap liveness probe for the health endpoint: asks pg-boss for queue metadata from the database. */
  async checkQueueReachable(): Promise<void> {
    if (!this.boss) throw new Error('Job queue is not running');
    await this.boss.getQueues();
  }

  async onApplicationShutdown(): Promise<void> {
    if (!this.boss) return;
    const boss = this.boss;
    this.boss = null;
    await boss.stop({ graceful: true, timeout: 10_000 });
  }
}
