import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { ITableService } from './table';
import { Public } from 'src/decorators/public.decorator';

@Controller('table')
export class TableController {

    constructor(
        @Inject(Services.TABLE) private service: ITableService,
    ) { }

    @Public()
    @Get(':tableKey')
    async getTable(
        @Param('tableKey') tableKey: string,
        @Query('page') page = 1,
        @Query('limit') limit = 10,
    ) {
        return this.service.buildTable(tableKey, Number(page), Number(limit));
    }
}
