import { Module } from '@nestjs/common';
import { ContextController } from './context.controller';
import { ContextService } from './context.service';
import { DemoContextRepository } from './demo-context.repository';
import { CONTEXT_REPOSITORY } from './context.types';

@Module({
  controllers: [ContextController],
  providers: [
    ContextService,
    { provide: CONTEXT_REPOSITORY, useClass: DemoContextRepository },
  ],
})
export class ContextModule {}
