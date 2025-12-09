
export interface ITableService {
  buildTable(tableKey?: string, page?: number, limit?: number): Promise<any>;
  findOne(id: string): Promise<any>;
  remove(id: string): Promise<any>;
}