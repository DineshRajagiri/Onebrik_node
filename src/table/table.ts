
export interface ITableService {
  buildTable(tableKey?: string, page?: number, limit?: number, query?: any): Promise<any>;
  findOne(id: string): Promise<any>;
  remove(id: string): Promise<any>;
}