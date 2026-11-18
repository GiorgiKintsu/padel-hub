import { Global, Inject, Injectable, Logger, Module, type OnModuleInit } from '@nestjs/common';
import { APP_ENV } from '../config/config.module.js';
import type { Env } from '../config/env.js';
import { MIGRATIONS_DIR } from './migrations-dir.js';
import { runMigrations } from './migrator.js';
import { PrismaService } from './prisma.service.js';

@Injectable()
export class BootMigrations implements OnModuleInit {
  private readonly logger = new Logger('Migrations');

  constructor(@Inject(APP_ENV) private readonly env: Env) {}

  async onModuleInit(): Promise<void> {
    if (!this.env.MIGRATE_ON_BOOT) return;
    const r = await runMigrations(this.env.DATABASE_URL, MIGRATIONS_DIR, (m) => this.logger.log(m));
    this.logger.log(`${r.applied.length} applied, ${r.alreadyApplied.length} already up to date`);
  }
}

// BootMigrations is declared first so its onModuleInit runs before anything that needs the schema.
@Global()
@Module({
  providers: [BootMigrations, PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
