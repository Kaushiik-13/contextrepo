import { Module } from '@nestjs/common';
import { ContextModule } from './context/context.module';
import { HealthController } from './health.controller';
import { DatabaseModule } from './database/database.module';
import { GithubModule } from './github/github.module';

@Module({
  imports: [DatabaseModule, GithubModule, ContextModule],
  controllers: [HealthController],
})
export class AppModule {}
