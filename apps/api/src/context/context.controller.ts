import { Controller, Get, Param, Query } from '@nestjs/common';
import { ContextService } from './context.service';

@Controller('context')
export class ContextController {
  constructor(private readonly contextService: ContextService) {}

  @Get()
  list(@Query('q') query?: string, @Query('type') type?: string) {
    return this.contextService.list(query, type);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.contextService.getById(id);
  }
}
