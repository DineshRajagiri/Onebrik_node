import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Typesense from 'typesense';

@Injectable()
export class TypesenseService implements OnModuleInit {
  private readonly logger = new Logger(TypesenseService.name);

  // 🔥 FIX: use 'any' to avoid TS namespace issue
  private client: any;

  constructor() {
    this.client = new Typesense.Client({
      nodes: [
        {
          host: process.env.TYPESENSE_HOST || '40.192.6.63',
          port: Number(process.env.TYPESENSE_PORT) || 8108,
          protocol: (process.env.TYPESENSE_PROTOCOL as 'http' | 'https') || 'http',
        },
      ],
      apiKey: process.env.TYPESENSE_API_KEY || 'xyz123',
      connectionTimeoutSeconds: 5,
    });
  }

  async onModuleInit() {
    await this.ensureCollection();
  }

  private async ensureCollection() {
    try {
      await this.client.collections('products').retrieve();
      this.logger.log('Typesense "products" collection already exists');
    } catch {
      try {
        await this.client.collections().create({
          name: 'products',
          fields: [
            { name: 'id', type: 'string' },
            { name: 'name', type: 'string' },
            { name: 'brand', type: 'string', facet: true, optional: true },
            { name: 'category', type: 'string', facet: true, optional: true },
            { name: 'description', type: 'string', optional: true },
            { name: 'price', type: 'float', optional: true },
            { name: 'isActive', type: 'bool', optional: true },
          ],
        });
        this.logger.log('Typesense "products" collection created');
      } catch (err) {
        this.logger.error('Failed to create Typesense collection', err?.message);
      }
    }
  }

  async upsertProduct(product: any) {
    try {
      await this.client.collections('products').documents().upsert(product);
    } catch (err) {
      this.logger.warn(`Typesense upsert failed: ${err?.message}`);
    }
  }

  async deleteProduct(id: string) {
    try {
      await this.client.collections('products').documents(id).delete();
    } catch (err) {
      this.logger.warn(`Typesense delete failed: ${err?.message}`);
    }
  }

  async searchProducts(query: string, options?: any) {
    return this.client.collections('products').documents().search({
      q: query || '*',
      query_by: 'name,brand,description',
      prefix: true,
      num_typos: 2,
      page: options?.page || 1,
      per_page: options?.perPage || 20,
      ...(options?.filterBy ? { filter_by: options.filterBy } : {}),
    });
  }
}