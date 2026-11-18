import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AppConfigModule } from './config/config.module.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthController } from './health/health.controller.js';
import { JobsModule } from './jobs/jobs.module.js';

@Module({
  imports: [AppConfigModule, DatabaseModule, JobsModule, TerminusModule],
  controllers: [HealthController],
})
export class AppModule {}
