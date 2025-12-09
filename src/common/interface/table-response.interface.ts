export interface TableResponse<T = any> {
  success: boolean;
  tableName: string;
  columns: any[];
  actions: any;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
