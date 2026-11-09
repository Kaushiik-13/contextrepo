import { Module } from '@nestjs/common';
import { ContextModule } from './context/context.module';
import { HealthController } from './health.controller';

@Module({
  imports: [ContextModule],
  controllers: [HealthController],
})
export class AppModule {}
